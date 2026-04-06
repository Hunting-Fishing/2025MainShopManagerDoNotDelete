import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const botEmail = "lovable-bot@allbusiness365.com";
    const botPassword = "LovableBot2026!Secure";

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingBot = existingUsers?.users?.find(
      (u) => u.email === botEmail
    );

    let userId: string;

    if (existingBot) {
      userId = existingBot.id;
      console.log("Bot user already exists:", userId);
    } else {
      // Create the bot user
      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email: botEmail,
          password: botPassword,
          email_confirm: true,
          user_metadata: { full_name: "Lovable Bot", is_bot: true },
        });

      if (createError) throw createError;
      userId = newUser.user.id;
      console.log("Created bot user:", userId);
    }

    // Get a shop_id to assign
    const { data: shops } = await supabaseAdmin
      .from("shops")
      .select("id, name")
      .limit(1)
      .single();

    if (!shops) throw new Error("No shops found");

    const shopId = shops.id;

    // Upsert profile with shop_id
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: userId,
          email: botEmail,
          full_name: "Lovable Bot",
          shop_id: shopId,
          role: "owner",
        },
        { onConflict: "id" }
      );

    if (profileError) console.error("Profile upsert error:", profileError);

    // Add as platform developer
    const { error: devError } = await supabaseAdmin
      .from("platform_developers")
      .upsert(
        {
          user_id: userId,
          email: botEmail,
          display_name: "Lovable Bot",
          is_active: true,
          notes: "Auto-created bot account for screenshot capture",
        },
        { onConflict: "user_id" }
      );

    if (devError) console.error("Platform developer upsert error:", devError);

    // Ensure user_roles entry
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert(
        {
          user_id: userId,
          role: "owner",
          shop_id: shopId,
        },
        { onConflict: "user_id,role" }
      );

    if (roleError) console.error("Role upsert error:", roleError);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Bot account ready",
        email: botEmail,
        password: botPassword,
        userId,
        shopId,
        shopName: shops.name,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
