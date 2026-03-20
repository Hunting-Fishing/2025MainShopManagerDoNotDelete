

# Fix Preferred Workout Days in Edit Client Dialog

## Problem
The Edit Client Profile dialog uses a plain text `<Input>` for "Preferred Workout Days" (type it in as "Mon, Wed, Fri"), while the Add Client form and the Clients filter page already use toggleable day buttons. The edit form also stores it as a comma-joined string instead of an array.

## Changes

### File: `src/pages/personal-trainer/PersonalTrainerClientDetail.tsx`

1. **Add `WORKOUT_DAYS` constant** at the top of the file (same as in `ClientIntakeForm.tsx` and `PersonalTrainerClients.tsx`):
   ```
   const WORKOUT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
   ```

2. **Fix initialization** (line 131): Store `preferred_workout_days` as the raw array instead of joining to a string:
   ```
   preferred_workout_days: client.preferred_workout_days || [],
   ```

3. **Replace the Input on line 333** with toggleable day buttons matching the Add Client form pattern:
   ```tsx
   <div>
     <Label>Preferred Workout Days</Label>
     <div className="flex flex-wrap gap-2 mt-1">
       {WORKOUT_DAYS.map(day => (
         <Button key={day} type="button" size="sm"
           variant={editForm.preferred_workout_days?.includes(day) ? 'default' : 'outline'}
           className="text-xs h-7"
           onClick={() => setEditForm(f => ({
             ...f,
             preferred_workout_days: f.preferred_workout_days?.includes(day)
               ? f.preferred_workout_days.filter(d => d !== day)
               : [...(f.preferred_workout_days || []), day]
           }))}
         >{day.slice(0, 3)}</Button>
       ))}
     </div>
   </div>
   ```

This makes the Edit dialog consistent with the Add Client form and the Clients filter page — all three use the same toggleable button pattern for workout days.

