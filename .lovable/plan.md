

## Plan: Restructure Fitness Taxonomy Database + Add Profile Scoring Engine

### Current State
The existing implementation uses 4 tables (`pt_fitness_categories`, `pt_fitness_subcategories`, `pt_fitness_goals`, `pt_client_fitness_profiles`) with a monolithic profile storing arrays of UUIDs and JSONB blobs. This works but limits queryability, reporting, and recommendation logic.

### What Changes

**1. Database Migration — Restructure Tables**

Add missing columns to existing tables and create new normalized tables:

| Table | Action |
|-------|--------|
| `pt_fitness_categories` | Add `slug`, `parent_id` (self-referencing for hierarchy) |
| `pt_fitness_subcategories` | Add `slug`, `description`, `difficulty_hint`, `equipment_level`, `training_style` — enrichment metadata for matching |
| `pt_user_fitness_interests` (NEW) | Normalized junction: `client_id`, `interest_id`, `interest_type` (category/subcategory), `interest_rank`, `experience_level`, `commitment_level`, `selected_at` |
| `pt_user_fitness_goals` (NEW) | Normalized: `client_id`, `shop_id`, `goal_name`, `priority_rank` |
| `pt_user_training_context` (NEW) | One row per client: `environment_preference[]`, `equipment_access[]`, `session_length`, `weekly_frequency`, `injury_notes`, `motivation_style` |
| `pt_client_fitness_scores` (NEW) | Computed profile scores: `strength_affinity`, `endurance_affinity`, `aesthetics_affinity`, `competition_affinity`, `recovery_need`, `beginner_support_need`, `equipment_richness`, `coaching_intensity` — all 0-100 floats |

The existing `pt_client_fitness_profiles` table stays as-is for backward compatibility (the monolithic profile still saves from the intake). The new normalized tables run alongside it and are populated on save.

**2. Scoring Engine — Database Function**

Create a `compute_fitness_profile_scores` PL/pgSQL function that:
- Takes a `client_id` + `shop_id`
- Reads from the normalized tables
- Calculates 8 affinity scores (0–100) based on:
  - Which categories/subcategories are selected (weighted by rank and experience level)
  - Training context (equipment richness = count of equipment types, coaching intensity from motivation style)
  - Goals selected (maps goal tags to affinity dimensions)
- Upserts into `pt_client_fitness_scores`
- Called automatically via trigger on `pt_user_fitness_interests` and `pt_user_training_context` changes

**3. Update Tags to Match Spec**

Ensure the intake UI uses the exact tag sets from the spec:
- **Goal tags**: Fat loss, Muscle gain, Strength, Endurance, Mobility, Athleticism, Energy, Health markers, Confidence, Stress reduction, Recovery, Competition
- **Environment tags**: Home, Garage gym, Commercial gym, Boutique studio, Outdoors, Pool, Track, Trail
- **Equipment tags**: None, Dumbbells, Barbell, Machines, Bands, Kettlebells, Cardio machines, Full gym access
- **Session tags**: 10–20 min, 20–30 min, 30–45 min, 45–60 min, 60+ min
- **Motivation tags**: Structured plan, Coaching/accountability, Competition, Gamification, Community, Education, Aesthetics, Performance, Habit-building

**4. Update Intake Component + Hook**

- Modify `FitnessInterestIntake.tsx` to use the updated tag lists
- On save, write to both the legacy monolithic profile AND the new normalized tables
- Add a call to the scoring function after save
- Add a new hook `useFitnessScores(clientId, shopId)` that reads from `pt_client_fitness_scores`

**5. Display Scores**

Add a "Fitness Profile Scores" card to the client detail view showing 8 radar/bar segments:
- Strength Affinity, Endurance Affinity, Aesthetics Affinity, Competition Affinity, Recovery Need, Beginner Support Need, Equipment Richness, Coaching Intensity

### Files to Create/Edit
- **New migration**: Schema changes (ALTER + CREATE tables + scoring function + trigger)
- **New migration**: Seed updated goal/environment/equipment/motivation tags
- `src/hooks/useFitnessTaxonomy.ts` — Add new hooks, update save logic
- `src/components/personal-trainer/FitnessInterestIntake.tsx` — Update tag lists, dual-write on save
- `src/pages/personal-trainer/PersonalTrainerClientDetail.tsx` — Add scores display card

