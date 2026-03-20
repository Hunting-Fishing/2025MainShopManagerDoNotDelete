

# Fix Developer Section Visibility & Personal Trainer Navigation for Non-Developer Users

## Problems Identified

1. **`/personal-trainer` missing from `moduleRoutePatterns`** (line 59 of `SidebarContent.tsx`): The sidebar doesn't recognize `/personal-trainer` as a module route, so when Chrissy is on any PT page, all generic dashboard sections (Dashboard, Customers, Inventory, etc.) still show instead of being hidden.

2. **`/export` also missing** from the patterns — minor but should be added for consistency.

3. **Post-login destination**: The `getPostLoginDestination` logic looks correct (single module → redirect to that module's route). If Chrissy has only `personal-trainer` enabled, she should land on `/personal-trainer`. She may be navigating to `/dashboard` manually or via a cached route. The fix to `moduleRoutePatterns` will ensure that even if she visits `/dashboard`, the sidebar shows the correct module-scoped navigation.

4. **Developer section**: The `isPlatformDeveloper` guard (line 121) is already correctly checking `allRoles.some(r => r.source === 'developer')`. If Chrissy is seeing Developer links, it means either:
   - The `is_platform_developer` RPC is returning true for her (needs DB check), OR
   - She was seeing a cached/stale page before the fix was deployed

## Fix

### File: `src/components/layout/sidebar/SidebarContent.tsx`

**Line 59** — Add `/personal-trainer` and `/export` to `moduleRoutePatterns`:

```typescript
const moduleRoutePatterns = [
  '/gunsmith', '/automotive', '/powersports', '/marine-services', 
  '/power-washing', '/water-delivery', '/fuel-delivery', '/septic',
  '/personal-trainer', '/export'
];
```

This single change ensures that when Chrissy (or any user) is on a Personal Trainer page, the generic dashboard/inventory/customers sections are hidden, and only the PT module navigation shows.

### Verification: `is_platform_developer` RPC

Run a quick DB query to confirm the `platform_developers` table doesn't accidentally include Chrissy's user ID. If it does, remove her entry.

### File: `src/main.tsx`

Re-save to clear the recurring duplicate attribute build error.

## Expected Result

- Chrissy logs in → redirected to `/personal-trainer` (her only module)
- Sidebar shows only: All Modules link + Personal Trainer module sections
- No Developer section visible (she's not a platform developer)
- No Dashboard/Customers/Inventory sections visible (hidden when in a module route)

