

# Client-Facing Medical Conditions in PT Portal

## What We're Building

Adding a "Health & Medical" tab to the client portal dashboard (`PTPortalDashboard.tsx`) so clients can self-report their medical conditions, injuries, and limitations. This data flows directly to trainers and the AI system for safe program generation.

## Approach

### 1. Create `ClientPortalMedical.tsx` (New Component)

A simplified, client-friendly version of the trainer's `ClientMedicalProfile.tsx`:

- **Searchable condition browser** with the same catalog + ICD-10 search tabs
- **Simplified UI** — no trainer-only fields like "cleared by physician" (read-only display if trainer has set it)
- For each condition: severity selector (mild/moderate/severe), status (active/recovered/chronic), optional notes
- Client can add conditions from both the local catalog and the ICD-10 API
- Client can remove conditions they added
- Shows existing conditions (including trainer-added ones) as read-only cards with an indicator of who added them
- Visual summary at top: count of active conditions, restriction badges

### 2. Update `PTPortalDashboard.tsx`

- Add a "Health" tab (with HeartPulse icon) to the existing TabsList
- Render `ClientPortalMedical` in the new tab, passing `client.id` and `client.shop_id`
- Add a dashboard summary card showing active medical condition count

### 3. RLS Policy Update

The existing `pt_client_medical_conditions` RLS policies likely only allow shop-level access. We need to add a policy allowing clients to INSERT/SELECT/UPDATE/DELETE their own conditions based on `client_id` matching their `pt_clients.user_id`:

```sql
-- Client can view their own conditions
CREATE POLICY "Clients can view own medical conditions"
ON pt_client_medical_conditions FOR SELECT
TO authenticated
USING (client_id IN (
  SELECT id FROM pt_clients WHERE user_id = auth.uid()
));

-- Client can add their own conditions  
CREATE POLICY "Clients can insert own medical conditions"
ON pt_client_medical_conditions FOR INSERT
TO authenticated
WITH CHECK (client_id IN (
  SELECT id FROM pt_clients WHERE user_id = auth.uid()
));

-- Client can update their own conditions
CREATE POLICY "Clients can update own medical conditions"  
ON pt_client_medical_conditions FOR UPDATE
TO authenticated
USING (client_id IN (
  SELECT id FROM pt_clients WHERE user_id = auth.uid()
));

-- Client can delete their own conditions
CREATE POLICY "Clients can delete own medical conditions"
ON pt_client_medical_conditions FOR DELETE
TO authenticated
USING (client_id IN (
  SELECT id FROM pt_clients WHERE user_id = auth.uid()
));
```

Also ensure the catalog table has a SELECT policy for all authenticated users.

## Files to Create/Edit

| File | Action |
|------|--------|
| `src/components/pt-portal/ClientPortalMedical.tsx` | **Create** — client-facing medical conditions manager |
| `src/pages/pt-portal/PTPortalDashboard.tsx` | **Edit** — add Health tab + dashboard card |
| `supabase/migrations/new.sql` | **Create** — RLS policies for client self-service access |

## Technical Notes

- Reuses the existing `useICD10Search` hook and `pt_medical_condition_catalog` table
- The `cleared_by_physician` field remains trainer-only (clients see it read-only)
- All conditions added by clients are immediately visible to trainers and the AI system since they share the same `pt_client_medical_conditions` table
- No changes needed to AI edge functions — they already pull all conditions for a client

