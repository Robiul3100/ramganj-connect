import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check - only admins
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const FCM_SERVER_KEY = Deno.env.get("FCM_SERVER_KEY");
    if (!FCM_SERVER_KEY) {
      return new Response(
        JSON.stringify({ error: "FCM_SERVER_KEY not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

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

    // Get FCM tokens
    const { data: subscriptions } = await supabase
      .from("push_subscriptions")
      .select("fcm_token")
      .eq("is_active", true);

    const tokens = (subscriptions || []).map((s: any) => s.fcm_token);

    if (tokens.length === 0) {
      // Update notification status
      if (notification_id) {
        await supabase
          .from("admin_notifications")
          .update({ status: "sent", sent_count: 0 })
          .eq("id", notification_id);
      }
      return new Response(
        JSON.stringify({ success: true, sent: 0, failed: 0, message: "No subscribers" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send via FCM Legacy HTTP API
    let sentCount = 0;
    let failedCount = 0;

    // Send in batches of 1000 (FCM limit)
    const batchSize = 1000;
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);

      const fcmPayload: any = {
        registration_ids: batch,
        notification: {
          title,
          body: notifBody || "",
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          click_action: redirect_url || "/",
        },
        data: {
          notification_id: notification_id || "",
          redirect_url: redirect_url || "/",
        },
      };

      if (image_url) {
        fcmPayload.notification.image = image_url;
      }

      const fcmResponse = await fetch(
        "https://fcm.googleapis.com/fcm/send",
        {
          method: "POST",
          headers: {
            Authorization: `key=${FCM_SERVER_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fcmPayload),
        }
      );

      const fcmResult = await fcmResponse.json();

      if (fcmResult.success) sentCount += fcmResult.success;
      if (fcmResult.failure) failedCount += fcmResult.failure;

      // Deactivate invalid tokens
      if (fcmResult.results) {
        const invalidTokens: string[] = [];
        fcmResult.results.forEach((r: any, idx: number) => {
          if (
            r.error === "NotRegistered" ||
            r.error === "InvalidRegistration"
          ) {
            invalidTokens.push(batch[idx]);
          }
        });
        if (invalidTokens.length > 0) {
          await supabase
            .from("push_subscriptions")
            .update({ is_active: false })
            .in("fcm_token", invalidTokens);
        }
      }
    }

    // Update notification record
    if (notification_id) {
      await supabase
        .from("admin_notifications")
        .update({
          status: failedCount > 0 && sentCount === 0 ? "failed" : "sent",
          sent_count: sentCount,
          failed_count: failedCount,
        })
        .eq("id", notification_id);
    }

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
