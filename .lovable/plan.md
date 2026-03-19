

# Medical Conditions & Health Restrictions System

## What We're Building

A structured medical conditions system that replaces free-text "injuries" and "health_conditions" fields with a comprehensive, categorized medical profile. This data feeds into AI program generation, nutrition planning, and trainer decision-making across the entire PT module.

---

## Database Design

### New Table: `pt_client_medical_conditions`

Stores individual medical conditions per client with structured metadata:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | |
| client_id | UUID FK → pt_clients | |
| shop_id | UUID | Multi-tenant isolation |
| condition_code | TEXT | Standardized identifier (e.g. `knee_acl_tear`) |
| condition_name | TEXT | Display name |
| category | TEXT | Category grouping (see below) |
| severity | TEXT | mild / moderate / severe / managed |
| status | TEXT | active / recovered / chronic / monitoring |
| diagnosed_date | DATE | Optional |
| notes | TEXT | Trainer/client notes |
| exercise_restrictions | TEXT[] | e.g. `['no_impact', 'no_heavy_squat']` |
| dietary_implications | TEXT[] | e.g. `['low_sodium', 'anti_inflammatory']` |
| cleared_by_physician | BOOLEAN | Medical clearance flag |
| clearance_date | DATE | |
| created_at / updated_at | TIMESTAMPTZ | |

**Categories** (seeded as reference data in `pt_medical_condition_catalog`):

- **Musculoskeletal**: ACL tear, meniscus injury, rotator cuff, herniated disc, scoliosis, arthritis, tendinitis, carpal tunnel, plantar fasciitis, hip replacement, knee replacement
- **Amputations**: Above-knee, below-knee, above-elbow, below-elbow, partial hand/foot, bilateral
- **Cardiovascular**: Heart disease, hypertension, arrhythmia, post-bypass, pacemaker, DVT history
- **Respiratory**: Asthma, COPD, exercise-induced bronchospasm, post-COVID lung issues
- **Neurological**: MS, Parkinson's, stroke recovery, epilepsy, neuropathy, vertigo
- **Metabolic**: Type 1/2 diabetes, thyroid disorders, PCOS, metabolic syndrome
- **Pregnancy & Postpartum**: Trimester 1/2/3, postpartum recovery, diastasis recti, pelvic floor dysfunction
- **Mental Health**: Anxiety (exercise-related), PTSD, eating disorder history
- **Post-Surgical**: Post-cardiac surgery, joint replacement rehab, spinal fusion, bariatric surgery recovery
- **Chronic Pain**: Fibromyalgia, chronic fatigue, chronic back pain, migraines
- **Other**: Osteoporosis, cancer recovery, autoimmune conditions, vision/hearing impairment

### New Table: `pt_medical_condition_catalog`

A reference/lookup table with ~120 pre-seeded conditions:

| Column | Type |
|--------|------|
| id | UUID PK |
| code | TEXT UNIQUE |
| name | TEXT |
| category | TEXT |
| default_restrictions | TEXT[] |
| default_dietary_implications | TEXT[] |
| description | TEXT |

This catalog provides the selectable options and auto-populates restriction suggestions when a condition is added to a client.

---

## Frontend Components

### 1. `ClientMedicalProfile.tsx` (New)

A dedicated medical conditions manager, shown in the Client Detail page:

- Categorized condition browser using the existing `MultiSelectDialog` pattern
- For each added condition: severity selector, status, notes, restriction overrides
- Visual indicators: red badges for active severe conditions, amber for moderate, green for managed
- "Cleared by physician" toggle with date
- Custom condition entry with category assignment (same pattern as nutrition allergies)

### 2. Update `PersonalTrainerClientDetail.tsx`

- Add a "Medical & Health" tab/section showing the medical profile component
- Replace the free-text "Injuries / Limitations" and "Health Conditions" textareas with links to the structured medical profile
- Show a summary badge count of active conditions

### 3. Update `ProgramCreatorDialog.tsx`

- In both Manual and AI tabs, replace the free-text "Limitations" textarea with an auto-populated summary from the selected client's medical conditions
- When a client is selected, fetch and display their active conditions as badges
- Pass structured condition data (not free text) to the AI generator

### 4. Update `NutritionProfile.tsx`

- Add a read-only section showing dietary implications from the client's medical conditions (e.g., diabetes → diabetic_friendly diet suggestion, heart disease → low_sodium)
- These show as suggested badges that can be accepted into the dietary profile

---

## AI Integration

### Update `pt-ai-assistant/index.ts`

- `fetchClientContext` now also queries `pt_client_medical_conditions` for the client
- `buildProfileSummary` includes a structured "Medical Conditions" section with condition names, severities, statuses, and exercise restrictions
- The `generate_program_template` action uses restriction data to instruct the AI (e.g., "Client has active moderate ACL tear — avoid high-impact plyometrics, heavy squats")

### Update `pt-ai-chat/index.ts`

- Include medical conditions in the client context block so Coach and Chef personas are aware of health restrictions

---

## Files to Create/Edit

| File | Action |
|------|--------|
| `supabase/migrations/new.sql` | Create `pt_medical_condition_catalog` + `pt_client_medical_conditions` tables, seed ~120 conditions, RLS policies |
| `src/components/personal-trainer/ClientMedicalProfile.tsx` | **Create** — categorized condition manager |
| `src/pages/personal-trainer/PersonalTrainerClientDetail.tsx` | **Edit** — add medical profile section |
| `src/components/personal-trainer/ProgramCreatorDialog.tsx` | **Edit** — use structured conditions instead of free-text |
| `src/components/nutrition/NutritionProfile.tsx` | **Edit** — show dietary implications from medical conditions |
| `supabase/functions/pt-ai-assistant/index.ts` | **Edit** — include medical data in context + program generation |
| `supabase/functions/pt-ai-chat/index.ts` | **Edit** — include medical data in chat context |

---

## Technical Details

**RLS**: Both new tables use `shop_id = public.get_current_user_shop_id()` for tenant isolation. The catalog table allows public reads (`SELECT` for all authenticated users) since it's global reference data.

**Catalog seeding**: ~120 conditions across 11 categories, each with sensible `default_restrictions` and `default_dietary_implications` arrays. When a trainer adds a condition to a client, these defaults pre-populate but can be overridden.

**No external medical API needed initially** — the catalog is comprehensive and user-extensible. This avoids API costs and compliance concerns while delivering the same structured data. If a formal medical API (ICD-10, SNOMED) is desired later, the `condition_code` field is ready for mapping.

