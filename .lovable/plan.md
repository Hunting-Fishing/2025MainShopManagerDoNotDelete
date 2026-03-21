

# Integrate Spoonacular API for Recipe Search & Enhanced Meal Planning

## What This Adds

Real recipe data from Spoonacular's database of 5,000+ recipes with verified nutrition facts, step-by-step cooking instructions, and auto-generated grocery lists. This enhances the existing AI-only meal plan system with actual recipes trainers and clients can follow.

## Architecture

```text
┌─────────────┐     ┌──────────────────┐     ┌───────────────┐
│  Frontend   │────▶│  Edge Function   │────▶│  Spoonacular  │
│  Recipe     │     │  spoonacular-    │     │  API          │
│  Search /   │     │  recipes         │     │               │
│  Meal Plan  │     │                  │     │               │
└─────────────┘     └──────────────────┘     └───────────────┘
```

## Secret Required

- **SPOONACULAR_API_KEY** — from https://spoonacular.com/food-api (free tier: 150 requests/day)

## Edge Function: `spoonacular-recipes`

Actions:
- **`search`** — Search recipes by query, diet type, intolerances, max calories. Calls `/recipes/complexSearch`
- **`details`** — Get full recipe with nutrition + instructions. Calls `/recipes/{id}/information?includeNutrition=true`
- **`meal_plan`** — Auto-generate a day's meal plan by calorie target + diet. Calls `/mealplanner/generate`
- **`similar`** — Find similar recipes. Calls `/recipes/{id}/similar`

Returns normalized data matching our meal plan schema so results integrate with existing `nt_meal_plans`.

## UI Changes

### Nutrition Page → Meal Plans Tab — Enhanced

Add a "Recipe Search" section above the existing AI meal plan generator:

- Search bar with diet filter dropdown (keto, paleo, vegan, gluten-free, etc.)
- Calorie range filter
- Results show recipe cards with: image, title, prep time, calories, macros
- Click a recipe → detail dialog with ingredients, step-by-step instructions, full nutrition breakdown
- "Add to Meal Plan" button saves recipe to the client's active plan
- "Generate Grocery List" aggregates ingredients from selected recipes

### New Components

| Component | Purpose |
|-----------|---------|
| `RecipeSearch.tsx` | Search UI with filters calling edge function |
| `RecipeDetailDialog.tsx` | Full recipe view with nutrition, instructions, ingredients |
| `RecipeCard.tsx` | Compact card for search results |

All in `src/components/nutrition/`.

### Integration with Existing System

- When a Spoonacular recipe is added to a meal plan, its macros feed into the existing daily totals tracking
- Client dietary preferences from `nt_nutrition_profiles` (allergies, dietary_style) auto-populate search filters
- The existing AI meal plan generator remains as an alternative — trainers can choose real recipes OR AI-generated plans

## Files to Create/Edit

| File | Action |
|------|--------|
| `supabase/functions/spoonacular-recipes/index.ts` | New edge function |
| `src/components/nutrition/RecipeSearch.tsx` | New — search + filter UI |
| `src/components/nutrition/RecipeCard.tsx` | New — result card |
| `src/components/nutrition/RecipeDetailDialog.tsx` | New — full recipe detail |
| `src/components/nutrition/MealPlanView.tsx` | Add recipe search tab alongside AI generator |
| `src/hooks/useNutrition.ts` | Add `useRecipeSearch`, `useRecipeDetails` hooks |
| `supabase/config.toml` | Register new edge function |

## Spoonacular → Our Schema Mapping

| Spoonacular field | Our field | Notes |
|---|---|---|
| `title` | `name` | Recipe name |
| `readyInMinutes` | `prep_time_min` | Cook time |
| `nutrition.nutrients[calories]` | `calories` | Per serving |
| `nutrition.nutrients[protein]` | `protein_g` | Per serving |
| `nutrition.nutrients[carbs]` | `carbs_g` | Per serving |
| `nutrition.nutrients[fat]` | `fat_g` | Per serving |
| `extendedIngredients` | `foods[]` / `grocery_list[]` | Ingredient list |
| `analyzedInstructions` | displayed in detail | Step-by-step |

