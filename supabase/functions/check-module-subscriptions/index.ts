import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-MODULE-SUBSCRIPTIONS] ${step}${detailsStr}`);
};

// Map Stripe product IDs to module slugs
const PRODUCT_TO_MODULE: Record<string, string> = {
  'prod_TjQuamW7bXdlp9': 'automotive',
  'prod_TjQvjdaBkKsCDF': 'power_washing',
  'prod_TjQv4acpfPjNlA': 'gunsmith',
  'prod_TjQwLR1WwHrnDx': 'marine',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get user's shop
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('shop_id')
      .or(`id.eq.${user.id},user_id.eq.${user.id}`)
      .maybeSingle();

    if (!profile?.shop_id) {
      logStep("No shop found for user");
      return new Response(JSON.stringify({ 
        subscriptions: [],
        trial_active: false,
        trial_ends_at: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get shop trial info
    const { data: shop } = await supabaseClient
      .from('shops')
      .select('trial_started_at, trial_days')
      .eq('id', profile.shop_id)
      .single();

    let trialActive = false;
    let trialEndsAt: string | null = null;

    if (shop?.trial_started_at) {
      const trialEnd = new Date(shop.trial_started_at);
      trialEnd.setDate(trialEnd.getDate() + (shop.trial_days || 14));
      trialEndsAt = trialEnd.toISOString();
      trialActive = new Date() < trialEnd;
    }

    logStep("Trial status", { trialActive, trialEndsAt });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ 
        subscriptions: [],
        trial_active: trialActive,
        trial_ends_at: trialEndsAt 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get all active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 100,
    });

    const activeModules: Array<{
      module_slug: string;
      subscription_id: string;
      current_period_end: string;
      status: string;
    }> = [];

    for (const sub of subscriptions.data) {
      for (const item of sub.items.data) {
        const productId = item.price.product as string;
        const moduleSlug = PRODUCT_TO_MODULE[productId] || sub.metadata?.module_slug;
        
        if (moduleSlug) {
          activeModules.push({
            module_slug: moduleSlug,
            subscription_id: sub.id,
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            status: sub.status,
          });
        }
      }
    }

    logStep("Active module subscriptions", { count: activeModules.length, modules: activeModules.map(m => m.module_slug) });

    // Sync to database
    for (const mod of activeModules) {
      const { data: moduleData } = await supabaseClient
        .from('business_modules')
        .select('id')
        .eq('slug', mod.module_slug)
        .single();

      if (moduleData) {
        await supabaseClient
          .from('module_subscriptions')
          .upsert({
            shop_id: profile.shop_id,
            module_id: moduleData.id,
            stripe_subscription_id: mod.subscription_id,
            stripe_customer_id: customerId,
            status: 'active',
            current_period_end: mod.current_period_end,
          }, {
            onConflict: 'shop_id,module_id',
          });
      }
    }

    return new Response(JSON.stringify({
      subscriptions: activeModules,
      trial_active: trialActive,
      trial_ends_at: trialEndsAt,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
