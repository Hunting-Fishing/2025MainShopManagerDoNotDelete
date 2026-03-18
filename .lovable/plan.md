

## Plan: AI-Powered Intake Output Engine + Wearable/Biometric Integration

The current fitness taxonomy intake and scoring engine are solid and complete. This next phase uses that data to power intelligent outputs.

### What We Build

**1. Enhance `pt-ai-assistant` Edge Function with Intake-Aware Actions**

Add 5 new actions to the existing edge function that read from the normalized taxonomy tables (`pt_user_fitness_interests`, `pt_user_fitness_goals`, `pt_user_training_context`, `pt_client_fitness_scores`) plus wearable data:

| Action | What It Does |
|--------|-------------|
| `generate_hybrid_program` | Creates a personalized multi-day workout program based on primary/secondary interests, experience levels, equipment, session length, and scores |
| `suggest_classes` | Recommends group classes/training styles based on interest taxonomy + commitment level |
| `match_trainer` | Scores available trainers against client affinity profile (strength trainer for strength-heavy clients, etc.) |
| `suggest_upsells` | Recommends packages, add-ons, challenges based on commitment level + interest gaps |
| `suggest_community` | Groups clients by shared interests/goals for challenges, community groups, and peer matching |

Each action fetches the client's full taxonomy profile + scores + wearable sync data and passes it as rich context to the AI.

**2. Wearable Data Feed into Scoring**

- Add a new DB column `wearable_boost` (jsonb) to `pt_client_fitness_scores` storing wearable-derived modifiers (e.g., high avg heart rate → endurance affinity boost)
- Update `compute_fitness_profile_scores` to optionally incorporate latest wearable sync data from `pt_wearable_connections.sync_data`
- Add a `pt_biometric_history` table to persist wearable snapshots over time (steps, HR, calories, sleep) for trend analysis

**3. AI Progression Tracker**

New action `analyze_progression` in the edge function:
- Reads workout logs + wearable biometrics over time
- Linked to active workout program
- AI identifies: plateaus, PRs, volume trends, recovery signals
- Returns structured recommendations to refine the program

**4. Frontend: AI Insights Panel**

Add a new "AI Insights" card/tab to the client detail page that shows:
- Program recommendations generated from intake
- Trainer match scores (if admin/trainer view)
- Suggested classes and upsells
- Progression analysis with wearable data overlay
- Community/challenge suggestions

Each insight is generated on-demand via the edge function and cached in a new `pt_ai_recommendations` table.

### Database Changes

```text
NEW TABLE: pt_biometric_history
  id, client_id, shop_id, recorded_at,
  steps, heart_rate_avg, heart_rate_resting,
  calories_burned, sleep_hours, sleep_quality,
  source (apple_watch, fitbit, garmin, manual),
  raw_data (jsonb)

NEW TABLE: pt_ai_recommendations  
  id, client_id, shop_id, type (program/class/trainer/upsell/community),
  content (jsonb), confidence, expires_at, created_at, acted_on

ALTER pt_client_fitness_scores:
  ADD wearable_boost jsonb DEFAULT '{}'

UPDATE compute_fitness_profile_scores:
  Read latest pt_biometric_history, apply modifiers
```

### Files to Create/Edit

| File | Change |
|------|--------|
| `supabase/functions/pt-ai-assistant/index.ts` | Add 5 new actions with taxonomy-aware prompts |
| New migration | `pt_biometric_history`, `pt_ai_recommendations` tables + scoring function update |
| `src/components/personal-trainer/AIInsightsPanel.tsx` (NEW) | Frontend card with tabbed AI recommendations |
| `src/hooks/usePTAIInsights.ts` (NEW) | Hooks for generating/fetching AI recommendations |
| `src/pages/personal-trainer/PersonalTrainerClientDetail.tsx` | Add AI Insights tab |
| `src/pages/personal-trainer/PersonalTrainerWearables.tsx` | Add "Sync to Profile" button that writes to `pt_biometric_history` |

### Example Flow

A client completes intake selecting: Functional Fitness (intermediate) + CrossFit (intermediate) + Running (beginner). Goals: Fat loss + Endurance. Environment: Commercial gym. Session: 45 min. Motivation: Competition + Accountability.

The scoring engine computes: Strength 60, Endurance 60, Competition 80, Coaching 90. Their Garmin syncs 8k steps/day, resting HR 68.

The AI then generates:
- **Program**: 4-day hybrid split (2 MetCon, 1 tempo run, 1 strength) with progressive overload
- **Classes**: HIIT, CrossFit WOD, Running club
- **Trainer match**: Coach with CrossFit + endurance specialization scores highest
- **Upsells**: Competition prep package, Hyrox challenge entry
- **Community**: Paired with other hybrid athletes for accountability group

