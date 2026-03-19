

# Deep Condition Detail: Location, Injury Level, Weight Limits & Doctor's Orders

## Overview

When a condition like "Herniated Disc" is added, the system currently stores it as a flat record with severity and restrictions. This enhancement adds structured sub-detail so trainers and AI know *exactly* what's affected — which disc, injury grade, weight limits, and physician-imposed restrictions with expiry dates.

## Database Changes

Add 5 new columns to `pt_client_medical_conditions`:

| Column | Type | Purpose |
|--------|------|---------|
| `affected_area` | text | Specific location (e.g., "L4-L5", "Left Shoulder", "C5-C6") |
| `injury_grade` | text | Severity scale: Grade 1 (mild), Grade 2 (moderate), Grade 3 (severe/complete) |
| `weight_limit_lbs` | integer | Max weight the client is allowed to lift (null = no limit) |
| `physician_restrictions` | text | Free-text doctor's orders (e.g., "No spinal loading for 8 weeks, limit flexion to 30 degrees") |
| `physician_restriction_until` | date | When doctor's restrictions expire — triggers a review reminder |

## UI Changes (Edit Condition Dialog)

Add a new **"Condition Detail"** section between the Severity/Status row and the Notes field:

1. **Affected Area** — Text input with smart placeholder based on condition category:
   - Musculoskeletal: "e.g., L4-L5 disc, Left ACL, Right rotator cuff"
   - Cardiovascular: "e.g., Left ventricle, Mitral valve"
   - Default: "e.g., specific location or body part"

2. **Injury Grade** — Select dropdown: Grade 1 (Mild/Strain), Grade 2 (Moderate/Partial), Grade 3 (Severe/Complete), N/A

3. **Weight Limitation** — Number input with "lbs" suffix, placeholder "No limit if empty"

4. **Doctor's Restrictions** — Textarea with prominent styling (bordered, doctor icon), placeholder: "Enter physician-imposed limitations, e.g., No spinal loading for 8 weeks..."

5. **Restriction Valid Until** — Date picker, shown alongside the doctor's restrictions field. When the date passes, the card shows a "⚠️ Restrictions expired — review needed" badge

## Card Display Updates

- Show `affected_area` right after the condition name (e.g., "Herniated Disc — L4-L5")
- Show weight limit badge if set (e.g., "⚖️ Max 50 lbs")
- Show doctor icon + "Dr. restrictions until [date]" if physician restrictions exist
- In expanded view, show full physician restrictions text

## AI Integration

The `trainer_ai_notes` field already feeds into AI prompts. The new fields will be concatenated into the condition context that AI receives, so workout generation automatically accounts for:
- Exact location (avoid exercises targeting that area)
- Weight ceiling (cap all prescribed weights)
- Doctor's specific orders (time-bound restrictions)

## Files to Edit

| File | Change |
|------|--------|
| `pt_client_medical_conditions` table | Add 5 new columns via migration |
| `src/components/personal-trainer/ClientMedicalProfile.tsx` | Add detail section to edit dialog, update card display, update insert/save logic |

