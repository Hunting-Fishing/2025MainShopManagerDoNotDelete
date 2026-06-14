## Diagnostic findings

- The exact text **“Loading your workspace...”** is rendered only by `ShopGuard`, which runs inside `ProtectedRoute` after authentication is considered complete.
- The public `/` page currently loads, but it still downloads far too much app code: browser profiling showed ~204 scripts, ~2MB JS, ~7.2s DOMContentLoaded, and protected-shell files loading on the landing page.
- `AuthContext` still has a hang path: the 8s auth timeout is cleared before `fetchUserRoles()` finishes. If `user_roles` or fallback `profiles` lookup hangs, `isLoading` can stay true forever.
- `useShopId` now has a timeout, but it still depends on `authLoading`; if auth role loading never resolves, workspace guards remain blocked.
- Startup Supabase tables currently show **no explicit Data API grants** in `information_schema.role_table_grants` for critical tables like `profiles`, `shops`, `user_roles`, `roles`, `shop_enabled_modules`, `business_modules`, and `shop_hours`. RLS exists, but missing grants can still break client access.
- The logged-in user data exists: profile, shop, owner role, and enabled modules are present in the database.
- Module Hub still calls subscription/platform checks at startup, including an edge function that can involve Stripe. That should not block the main workspace from rendering.

## Plan to fix

1. **Harden auth bootstrap**
   - Update `AuthContext` so session loading ends once the session is known.
   - Load roles separately with a strict timeout and safe fallback to an empty role list.
   - Ensure `isRolesLoading` always resolves and can never hold the app indefinitely.

2. **Harden shop lookup**
   - Keep `useShopId` on the AuthContext singleton.
   - Add proper timeout cleanup and consistent error handling.
   - Ensure `ShopGuard` always transitions to either content, retryable error, or setup-required state.

3. **Add missing startup grants via migration**
   - Add explicit authenticated/service-role grants for startup tables required by the browser:
     - `profiles`, `shops`, `user_roles`, `roles`, `shop_enabled_modules`, `business_modules`, `module_subscriptions`, `platform_developers`, `shop_hours`
   - Do not add anonymous access unless an existing public policy requires it.
   - Leave RLS protections intact.

4. **Stop loading protected workspace code on the public homepage**
   - Move authenticated routes into a lazy protected shell component.
   - Lazy-load `Layout`, `AuthGate`, `AuthenticatedProviders`, and protected route groups only after the user enters the app.
   - Keep `/` focused on the landing page so public visitors do not download sidebar/module/workspace logic.

5. **Stop blocking Module Hub on billing checks**
   - Render the workspace from live `business_modules` and `shop_enabled_modules` first.
   - Move `check-module-subscriptions`/Stripe checks into a background billing status query with timeout and error fallback.
   - Never let billing/subscription status keep the workspace stuck on loading.

6. **Validate the fix**
   - Verify `/` loads with fewer initial scripts and no protected-shell imports.
   - Verify authenticated `/module-hub` reaches usable UI.
   - Verify a protected route cannot stay on “Loading your workspace...” longer than the timeout.
   - Check console, network, Supabase logs, and slow-query signals after the change.

<presentation-actions>
<presentation-link url="https://docs.lovable.dev/tips-tricks/troubleshooting">Troubleshooting docs</presentation-link>
</presentation-actions>