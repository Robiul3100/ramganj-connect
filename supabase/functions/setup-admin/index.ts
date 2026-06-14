import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * setup-admin: creates the FIRST admin account only.
 *
 * SECURITY:
 * - This function is one-shot: it refuses to run if any admin already exists.
 * - Requires a shared secret header `X-Setup-Secret` that must match the
 *   SETUP_ADMIN_SECRET environment variable (set this in Supabase Edge
 *   Function secrets before invoking).
 * - Anonymous (unauthenticated) requests are rejected.
 * - Email must be the configured owner email (env: ADMIN_OWNER_EMAIL).
 *
 * After the first admin is created, delete this function or stop deploying it.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-setup-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Refuse everything except POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // 1. Verify shared secret (prevents anonymous abuse)
    const setupSecret = req.headers.get("X-Setup-Secret");
    const expected = Deno.env.get("SETUP_ADMIN_SECRET");
    if (!expected) {
      return new Response(
        JSON.stringify({ error: "SETUP_ADMIN_SECRET not configured on server" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!setupSecret || setupSecret !== expected) {
      return new Response(JSON.stringify({ error: "Invalid setup secret" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Parse and validate body
    const { email, password } = await req.json();
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return new Response(JSON.stringify({ error: "email and password required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (password.length < 12) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 12 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Verify the email matches the configured owner
    const ownerEmail = Deno.env.get("ADMIN_OWNER_EMAIL");
    if (!ownerEmail) {
      return new Response(
        JSON.stringify({ error: "ADMIN_OWNER_EMAIL not configured on server" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (email.toLowerCase() !== ownerEmail.toLowerCase()) {
      return new Response(JSON.stringify({ error: "Unauthorized email" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Create admin client and refuse if any admin already exists
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: existingAdmin } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin")
      .limit(1)
      .maybeSingle();

    if (existingAdmin) {
      return new Response(
        JSON.stringify({
          error: "An admin already exists. Refusing to run. Delete this function.",
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Create the user
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 6. Assign admin role
    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
      user_id: userData.user.id,
      role: "admin",
    });

    if (roleError) {
      return new Response(JSON.stringify({ error: roleError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Admin account created" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});