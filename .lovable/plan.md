

## Plan: Nutrition Intelligence Module — Phase 1 (MVP Foundation)

The uploaded document describes a comprehensive 50+ page Nutrition Intelligence system — a Yuka-like food lookup and scoring engine connected to fitness goals, workouts, biometrics, and recovery. This is a large module. Following the document's own phasing recommendation, we build **Phase 1 (MVP)** first.

### Current State
- One basic table: `pt_nutrition_logs` (manual calorie/macro logging)
- One basic page: `PersonalTrainerNutrition.tsx` (simple meal log + chart + AI advice)
- No nutrition profiles, no food database, no scoring, no barcode scanning, no substitution engine

### Phase 1 Scope (What We Build Now)

**A. Database Schema — 12 New Tables**

| Table | Purpose |
|-------|---------|
| `nt_nutrition_profiles` | Per-user dietary style, allergies, intolerances, budget, cooking level, supplement usage |
| `nt_fitness_goals` | Linked nutrition goals with macro targets (calories, protein, carbs, fat, fiber) |
| `nt_workout_day_types` | Day types (rest/light/heavy/endurance) with carb/protein/fat bias multipliers |
| `nt_biometric_snapshots` | Weight, body fat, HR, sleep, steps, calories from wearables or manual entry |
| `nt_food_sources` | Registry of data sources (OFF, USDA, internal) with priority + config |
| `nt_food_products` | Normalized internal food/product cache (from any source) |
| `nt_food_product_nutrients` | Macro + micro nutrients per product |
| `nt_food_product_ingredients` | Parsed ingredient list with additive codes |
| `nt_food_logs` | User meal logs linked to food products (replaces manual-only approach) |
| `nt_food_quality_scores` | Computed scores: nutrition density, ingredient quality, goal fit, workout fit, recovery fit |
| `nt_food_substitutions` | Product → substitute mappings with substitution type |
| `nt_meal_plans` | AI-generated or trainer-created meal plans with daily macro targets |

All tables get RLS policies scoped to authenticated users.

**B. Edge Functions — 2 New Functions**

1. **`nutrition-food-lookup`** — Food search and barcode lookup
   - Searches internal cache first
   - Falls back to Open Food Facts API (barcode + text search)
   - Falls back to USDA FoodData Central API (generic/branded foods)
   - Normalizes results into internal schema
   - Caches products in `nt_food_products` + `nt_food_product_nutrients`
   - Returns structured product data with nutrients

2. **`nutrition-engine`** — Scoring, recommendations, and meal planning
   - Actions: `score_food`, `get_substitutions`, `generate_meal_plan`, `get_daily_targets`, `nutrition_advice`
   - `score_food`: Computes nutrition density (protein density 25%, fiber 20%, added sugar 15%, sodium 10%, micronutrient 15%, calorie efficiency 15%), ingredient quality, goal fit
   - `generate_meal_plan`: Uses AI with full client context (profile + goals + workout day type + biometrics + scores) to produce adaptive meal frameworks
   - `get_daily_targets`: Adjusts macros based on workout day type bias multipliers + recovery status

**C. Frontend — 6 New/Updated Pages**

1. **Nutrition Dashboard** (rewrite `PersonalTrainerNutrition.tsx`)
   - Today's calorie/macro targets with progress rings
   - Workout-day-adjusted guidance
   - Top recommendation card
   - Protein progress bar
   - Recent food quality trend
   - Quick-add food (search or scan)

2. **Nutrition Profile Setup** (new component)
   - Dietary style (omnivore, vegetarian, vegan, pescatarian, etc.)
   - Allergies + intolerances multi-select
   - Disliked foods, digestive notes
   - Budget level, cooking level
   - Supplement usage

3. **Food Search / Barcode Scan** (new component)
   - Search bar hitting the food-lookup edge function
   - Barcode input field (camera-based scanning is a future enhancement)
   - Results with nutrition density badges
   - Tap to view product detail

4. **Product Detail** (new component)
   - Nutrition facts table
   - Ingredient list with additive flags
   - Score breakdown (nutrition density, ingredient quality, goal fit)
   - "Better Alternatives" section
   - "Why it fits/doesn't fit your goal" explanation
   - Log-to-meal button

5. **Meal Plan View** (new component)
   - Day view with meal slots (breakfast, pre-workout, post-workout, dinner, snack)
   - Per-meal food suggestions
   - AI-generated or trainer-assigned
   - Grocery list extraction

6. **Goal Setup** (new component within profile)
   - Goal type selection (fat loss, muscle gain, recomp, endurance, strength, general health, recovery)
   - Target macros (auto-calculated or manual override)
   - Workout frequency + session linking

**D. API Keys Required**
- **USDA FoodData Central**: Free API key from api.data.gov (user needs to provide)
- **Open Food Facts**: No key needed (free public API)

### Files to Create/Edit

| File | Action |
|------|--------|
| Migration SQL | Create 12 tables + seed `nt_food_sources` + `nt_workout_day_types` |
| `supabase/functions/nutrition-food-lookup/index.ts` | NEW — Open Food Facts + USDA adapter |
| `supabase/functions/nutrition-engine/index.ts` | NEW — Scoring + meal planning + daily targets |
| `src/hooks/useNutrition.ts` | NEW — All nutrition hooks (profile, goals, food search, logs, scores, meal plans) |
| `src/pages/personal-trainer/PersonalTrainerNutrition.tsx` | REWRITE — Full nutrition dashboard |
| `src/components/nutrition/NutritionProfile.tsx` | NEW — Profile setup form |
| `src/components/nutrition/FoodSearch.tsx` | NEW — Search + barcode lookup |
| `src/components/nutrition/ProductDetail.tsx` | NEW — Product detail + scores + alternatives |
| `src/components/nutrition/MealPlanView.tsx` | NEW — Day-based meal plan |
| `src/components/nutrition/GoalSetup.tsx` | NEW — Nutrition goal configuration |
| `src/components/nutrition/DailyTargets.tsx` | NEW — Today's adjusted macro targets |
| `supabase/config.toml` | Add function entries |

### What Phase 2 Adds Later (Not Now)
- EU/US regulatory additive/allergen overlays
- Digestive response check-ins + food response learning
- Camera-based barcode scanning
- Ingredient cleanliness scoring with additive databases

### What Phase 3 Adds Later (Not Now)
- Adaptive recommendations from food-response correlations
- Predictive adherence scoring
- Pantry/grocery intelligence
- Coach automation rules

