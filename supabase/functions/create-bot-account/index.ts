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
    const userId = "53554c45-e23a-46b1-a84d-28aa3328eebb";
    const shopId = "b8dcc902-ccc3-4843-929a-c6cf84dc8e35";

    // Mark onboarding complete by setting has_completed_onboarding
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        has_completed_onboarding: true,
        onboarding_step: 'complete',
      })
      .eq("id", userId);

    if (profileError) console.error("Profile update error:", profileError);

    // Subscribe to all modules
    const moduleNames = [
      'automotive', 'power-washing', 'gunsmith', 'marine-services',
      'fuel-delivery', 'water-delivery', 'septic', 'export',
      'personal-trainer', 'welding'
    ];

    for (const mod of moduleNames) {
      const { error } = await supabaseAdmin
        .from("shop_modules")
        .upsert(
          { shop_id: shopId, module_slug: mod, is_active: true },
          { onConflict: "shop_id,module_slug" }
        );
      if (error) console.error(`Module ${mod} error:`, error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Onboarding completed and all modules activated",
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
