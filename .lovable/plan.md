

# Upgrade Client Intake Form

## Current State
The "Add New Client" dialog has 4 sections: Personal Info, Membership, Preferred Workout Days, and Health & Goals. It only captures ~15 of the 30+ available `pt_clients` columns.

## What Changes

### 1. Restructure into 6 clear sections with better layout

**Personal Info** (existing — add profile photo upload)
- First Name, Last Name, Email, Phone, Date of Birth, Sex, Height, Weight — keep as-is
- Add Body Fat % field (already in DB)

**Membership & Training** (expand existing)
- Membership Type, Assign Trainer — keep
- Preferred Workout Days — keep
- Add Join Date field (already in DB as `join_date`)

**Health & Medical** (rename from "Health & Goals")
- Goals — keep
- Injuries/Limitations — keep  
- Medical Warnings / Health Conditions — keep
- Add a note: "Detailed medical conditions can be added from the client profile after creation"

**Nutrition & Diet** (new section — all columns exist in DB)
- Calorie Target (number)
- Protein Target (g), Carb Target (g), Fat Target (g) — 3-col row
- Hydration Target (ml)
- Food Habits (textarea — e.g., "Vegetarian, no dairy")
- Supplement Notes (textarea)
- Meal Guidance (textarea)

**Emergency Contact** (existing — keep as-is)
- Contact Name, Contact Phone

**Additional Notes** (new section)
- Notes textarea (already in DB as `notes`)

### 2. Update form state and mutation payload
- Add new fields to the `form` state object: `body_fat_percent`, `join_date`, `calorie_target`, `protein_target_g`, `carb_target_g`, `fat_target_g`, `hydration_target_ml`, `food_habits`, `supplement_notes`, `meal_guidance`, `notes`
- Map all new fields into the insert payload

### 3. Extract form into its own component
The dialog content is getting large. Extract the form body into `src/components/personal-trainer/ClientIntakeForm.tsx` to keep `PersonalTrainerClients.tsx` manageable.

## Files to Edit

| File | Change |
|------|--------|
| `src/components/personal-trainer/ClientIntakeForm.tsx` | New component — extracted form with all 6 sections |
| `src/pages/personal-trainer/PersonalTrainerClients.tsx` | Replace inline form with `<ClientIntakeForm>`, pass trainers + onSubmit props |

