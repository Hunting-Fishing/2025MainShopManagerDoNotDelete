

# Role-Based Access Control for Business Section

## What Changes

Filter the sidebar's `navSections` at render time so the **Business** section (Gym Staff, Time Tracking) only appears for users with `owner` or `admin` roles.

## How

1. **Import `useAllUserRoles`** in `PersonalTrainerSidebar.tsx`.
2. **Move `navSections` inside the component** (or filter it with `useMemo`) — check the user's roles and exclude the "Business" section if the user doesn't have `owner` or `admin`.
3. **Filter logic**: 
   ```
   const { data: roles = [] } = useAllUserRoles();
   const isOwnerOrAdmin = roles.some(r => ['owner', 'admin'].includes(r.name));
   const filteredSections = navSections.filter(s => s.title !== 'Business' || isOwnerOrAdmin);
   ```
4. Render `filteredSections` instead of `navSections` in the sidebar map.

## Files to Edit

| File | Change |
|------|--------|
| `PersonalTrainerSidebar.tsx` | Import `useAllUserRoles`, filter Business section by role |

No database changes needed — uses existing `user_roles` + `roles` tables.

