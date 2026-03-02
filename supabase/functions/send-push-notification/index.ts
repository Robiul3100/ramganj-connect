import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Create a JWT from a Google Service Account for FCM HTTP v1 API.
 */
async function getAccessToken(clientEmail: string, privateKeyPem: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: clientEmail,
    sub: clientEmail,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
  };

  const encode = (obj: unknown) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  const headerB64 = encode(header);
  const payloadB64 = encode(payload);
  const signingInput = `${headerB64}.${payloadB64}`;

  const pemBody = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");

  const binaryKey = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${signingInput}.${sigB64}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Auth check - verify user is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // User client to verify identity
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await userClient.auth.getUser(token);

    if (userError || !user) {
      console.error("Auth error:", userError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service role client for DB operations (bypasses RLS)
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check admin role
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get service account credentials
    const firebaseClientEmail = Deno.env.get("FIREBASE_CLIENT_EMAIL");
    const firebasePrivateKey = Deno.env.get("FIREBASE_PRIVATE_KEY");
    const firebaseProjectId = Deno.env.get("FIREBASE_PROJECT_ID");

    if (!firebaseClientEmail || !firebasePrivateKey || !firebaseProjectId) {
      return new Response(
        JSON.stringify({ error: "Firebase service account not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get OAuth2 access token
    const accessToken = await getAccessToken(
      firebaseClientEmail,
      firebasePrivateKey.replace(/\\n/g, "\n")
    );

    const body = await req.json();
    const {
      notification_id,
      title,
      body: notifBody,
      image_url,
      redirect_url,
      target_type = "all",
      target_value,
    } = body;

    console.log("Sending notification:", { title, target_type, notification_id });

    // Get FCM tokens using admin client
    const { data: subscriptions, error: subError } = await adminClient
      .from("push_subscriptions")
      .select("fcm_token")
      .eq("is_active", true);

    if (subError) {
      console.error("Error fetching subscriptions:", subError.message);
    }

    const tokens = (subscriptions || []).map((s: any) => s.fcm_token);

    if (tokens.length === 0) {
      if (notification_id) {
        await adminClient
          .from("admin_notifications")
          .update({ status: "sent", sent_count: 0, is_draft: false })
          .eq("id", notification_id);
      }
      return new Response(
        JSON.stringify({ success: true, sent: 0, failed: 0, message: "No subscribers" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send via FCM HTTP v1 API
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${firebaseProjectId}/messages:send`;
    let sentCount = 0;
    let failedCount = 0;
    const invalidTokens: string[] = [];

    const batchSize = 50;
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);

      const results = await Promise.allSettled(
        batch.map(async (fcmToken: string) => {
          const message: any = {
            message: {
              token: fcmToken,
              notification: { title, body: notifBody || "" },
              webpush: {
                fcm_options: { link: redirect_url || "/" },
                notification: {
                  icon: "/favicon.ico",
                  badge: "/favicon.ico",
                  ...(image_url ? { image: image_url } : {}),
                },
              },
              data: {
                notification_id: notification_id || "",
                redirect_url: redirect_url || "/",
              },
            },
          };

          const res = await fetch(fcmUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(message),
          });

          if (!res.ok) {
            const errBody = await res.json();
            console.error("FCM error for token:", fcmToken.substring(0, 20) + "...", errBody);
            const errorCode = errBody?.error?.details?.[0]?.errorCode ||
              errBody?.error?.status || "";
            if (errorCode === "UNREGISTERED" || errorCode === "INVALID_ARGUMENT") {
              invalidTokens.push(fcmToken);
            }
            throw new Error(JSON.stringify(errBody));
          }
          return true;
        })
      );

      for (const r of results) {
        if (r.status === "fulfilled") sentCount++;
        else failedCount++;
      }
    }

    // Deactivate invalid tokens
    if (invalidTokens.length > 0) {
      await adminClient
        .from("push_subscriptions")
        .update({ is_active: false })
        .in("fcm_token", invalidTokens);
    }

    // Update notification record
    if (notification_id) {
      await adminClient
        .from("admin_notifications")
        .update({
          status: failedCount > 0 && sentCount === 0 ? "failed" : "sent",
          sent_count: sentCount,
          failed_count: failedCount,
          is_draft: false,
        })
        .eq("id", notification_id);
    }

    console.log(`Notification sent: ${sentCount} success, ${failedCount} failed`);

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, failed: failedCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Push notification error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
