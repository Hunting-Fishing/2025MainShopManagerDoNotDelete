import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, clientId, shopId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build rich context from database
    let contextSections: string[] = [];

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch client's nutrition profile
    if (clientId && shopId) {
      const [
        { data: profile },
        { data: goals },
        { data: recentLogs },
        { data: mealPlans },
        { data: biometrics },
        { data: workoutDayTypes },
        { data: fitnessScores },
        { data: ptClient },
      ] = await Promise.all([
        supabase.from("nt_nutrition_profiles").select("*").eq("client_id", clientId).eq("shop_id", shopId).maybeSingle(),
        supabase.from("nt_fitness_goals").select("*").eq("client_id", clientId).eq("shop_id", shopId).eq("is_active", true).limit(3),
        supabase.from("nt_food_logs").select("*, product:nt_food_products(product_name, brand, nutri_score_grade)").eq("client_id", clientId).eq("shop_id", shopId).order("logged_at", { ascending: false }).limit(10),
        supabase.from("nt_meal_plans").select("*").eq("client_id", clientId).eq("shop_id", shopId).eq("is_active", true).limit(1),
        supabase.from("nt_biometric_snapshots").select("*").eq("client_id", clientId).eq("shop_id", shopId).order("recorded_at", { ascending: false }).limit(1),
        supabase.from("nt_workout_day_types").select("*").eq("shop_id", shopId),
        supabase.from("pt_fitness_scores").select("*").eq("client_id", clientId).eq("shop_id", shopId).limit(1),
        supabase.from("pt_clients").select("first_name, last_name, email, status, assigned_trainer_id, fitness_interests").eq("id", clientId).maybeSingle(),
      ]);

      if (ptClient) {
        contextSections.push(`## Client Info\nName: ${ptClient.first_name} ${ptClient.last_name}\nStatus: ${ptClient.status}\nFitness Interests: ${JSON.stringify(ptClient.fitness_interests || [])}`);
      }

      if (profile) {
        contextSections.push(`## Nutrition Profile\nDietary Style: ${profile.dietary_style || "Not set"}\nAllergies: ${JSON.stringify(profile.allergies || [])}\nIntolerances: ${JSON.stringify(profile.intolerances || [])}\nBudget: ${profile.budget_level || "Not set"}\nCooking Level: ${profile.cooking_level || "Not set"}\nSupplements: ${JSON.stringify(profile.supplements || [])}`);
      }

      if (goals && goals.length > 0) {
        const goalTexts = goals.map((g: any) => `- ${g.goal_type}: ${g.target_calories || "?"} cal, P:${g.target_protein || "?"}g C:${g.target_carbs || "?"}g F:${g.target_fat || "?"}g`);
        contextSections.push(`## Active Fitness Goals\n${goalTexts.join("\n")}`);
      }

      if (recentLogs && recentLogs.length > 0) {
        const logTexts = recentLogs.map((l: any) => `- ${l.meal_type}: ${l.product?.product_name || "Unknown"} (${l.servings} servings, ${l.calories_consumed || "?"}cal)`);
        contextSections.push(`## Recent Food Logs (last 10)\n${logTexts.join("\n")}`);
      }

      if (mealPlans && mealPlans.length > 0) {
        const mp = mealPlans[0];
        contextSections.push(`## Active Meal Plan\nName: ${mp.plan_name}\nCalories: ${mp.daily_calories}\nMacros: P:${mp.daily_protein}g C:${mp.daily_carbs}g F:${mp.daily_fat}g\nMeals: ${JSON.stringify(mp.meals || {})}`);
      }

      if (biometrics && biometrics.length > 0) {
        const b = biometrics[0];
        contextSections.push(`## Latest Biometrics\nWeight: ${b.weight_kg || "?"}kg\nBody Fat: ${b.body_fat_pct || "?"}%\nHR: ${b.heart_rate_avg || "?"}bpm\nSleep: ${b.sleep_hours || "?"}h\nSteps: ${b.steps || "?"}\nRecorded: ${b.recorded_at}`);
      }

      if (fitnessScores) {
        contextSections.push(`## Fitness Affinity Scores\n${JSON.stringify(fitnessScores)}`);
      }

      if (workoutDayTypes && workoutDayTypes.length > 0) {
        const dayTexts = workoutDayTypes.map((d: any) => `- ${d.day_type_name}: Carb bias ${d.carb_bias}x, Protein bias ${d.protein_bias}x, Fat bias ${d.fat_bias}x`);
        contextSections.push(`## Workout Day Types\n${dayTexts.join("\n")}`);
      }
    }

    const systemPrompt = `You are FitCoach AI — an expert personal trainer, nutritionist, and meal prep coach embedded in a fitness management platform. You have deep knowledge of:

- Exercise science, program design, and periodization
- Sports nutrition, macro/micro nutrients, and supplementation
- Meal prep strategies, grocery planning, and cooking techniques
- Body composition, weight management, and recovery
- Food quality scoring (Nutri-Score, NOVA classification, ingredient analysis)
- Workout-day-specific nutrition (adjusting macros for rest/light/heavy/endurance days)
- Barcode-based food lookup and product alternatives

${contextSections.length > 0 ? `\n## Current Client Context\n${contextSections.join("\n\n")}` : ""}

Guidelines:
- Give specific, actionable advice based on the client's data when available
- Use metric AND imperial units when discussing weight/measurements
- When suggesting meals, consider the client's dietary style, allergies, and budget
- Adjust nutrition advice based on workout day type and training intensity
- Reference real foods and practical recipes, not generic advice
- If you don't have enough client data, ask clarifying questions
- Be motivational but honest — don't sugarcoat if someone is off track
- Format responses with clear headers, bullet points, and emojis for readability
- Keep responses focused and under 500 words unless a detailed plan is requested`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...(messages || []),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("pt-ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
