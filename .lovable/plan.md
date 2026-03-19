

# Integrate NLM Clinical Tables ICD-10-CM API

## What We're Building

Adding live medical condition search via the free **NLM Clinical Tables API** (no API key required) to the existing Add Condition dialog. Trainers can search thousands of ICD-10 coded conditions beyond the seeded 121, with results mapped to exercise restrictions when possible.

---

## Changes

### 1. Update `ClientMedicalProfile.tsx`

Enhance the Add Condition dialog with two search sources:

- **Tab 1: "Our Catalog"** — existing local catalog search (unchanged behavior)
- **Tab 2: "Medical Database (ICD-10)"** — live search against NLM API with debounced input
  - Calls `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms={query}&maxList=25`
  - Displays results with ICD-10 code + condition name
  - When selected, saves with the ICD-10 code as `condition_code`, auto-maps to known restrictions if the code/name matches a catalog entry, otherwise saves with empty restrictions for manual override
  - Shows a note prompting the trainer to set restrictions manually for non-catalog conditions

### 2. Add `useICD10Search.ts` Hook

A small custom hook that:
- Takes a search string, debounces it (300ms)
- Fetches from the NLM Clinical Tables API (direct client-side call — it's a public CORS-enabled API, no edge function needed)
- Returns `{ results, isLoading }` where results are `{ code: string, name: string }[]`
- Parses the NLM response format: `[totalCount, codeArray, extraFields, [code, name][] ]`

### 3. Update `pt_client_medical_conditions` Insert Logic

When adding a condition from ICD-10 search (not from local catalog):
- `condition_code` = ICD-10 code (e.g., `M23.51`)
- `condition_name` = condition name from API
- `category` = auto-detect from ICD-10 code prefix (M = Musculoskeletal, I = Cardiovascular, etc.) or default to "Other"
- `exercise_restrictions` and `dietary_implications` = check if a catalog entry has a similar name match; if so, copy defaults; otherwise empty arrays for trainer to fill in

---

## Files to Create/Edit

| File | Action |
|------|--------|
| `src/hooks/useICD10Search.ts` | **Create** — debounced NLM API search hook |
| `src/components/personal-trainer/ClientMedicalProfile.tsx` | **Edit** — add ICD-10 search tab to Add Condition dialog |

---

## Technical Details

**NLM API Response Format:**
```text
GET https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms=knee&maxList=25

Response: [totalCount, ["M17.0","M17.1",...], null, [["M17.0","Primary osteoarthritis, knee"],["M17.1","..."]]]
```

**ICD-10 Category Mapping** (first letter of code):
- A-B → Infectious, C-D → Neoplasms/Blood, E → Metabolic, F → Mental Health
- G → Neurological, I → Cardiovascular, J → Respiratory, K → Digestive
- M → Musculoskeletal, O → Pregnancy & Postpartum, R → Symptoms, S-T → Injuries

No API key, no edge function, no secrets needed — the NLM API is fully public with CORS support.

