## Recommended Path: B now → A later → (skip C)

Yes — B is the safest starting point, and it does **not** block doing A afterward. C should stay off the table; it would break the app and undo work from A.

### Why this order works

- **B (now)** establishes a documented baseline: which always-true policies and SECURITY DEFINER functions are *intentional* (audit logs, system inserts, multi-tenant helpers like `has_role`, `get_current_user_shop_id`). Without this baseline, A risks "hardening" policies that are supposed to be permissive and breaking logging/affiliate tracking/email flows.
- **A (later)** then becomes a surgical pass: each remaining always-true policy is reviewed against the baseline and tightened only where it's clearly wrong. Much lower risk because we already know what to leave alone.
- **C** is never the right move here — mass-revoking SECURITY DEFINER EXECUTE would break RLS itself (the whole multi-tenant model depends on `get_current_user_shop_id()` etc.).

---

## Phase B — Plan (this step)

### 1. Fix the 3 dashboard/platform items
These are real findings, unrelated to RLS policy semantics, and safe to fix immediately:

| Finding | Action | Where |
|---|---|---|
| Leaked Password Protection disabled | Enable HaveIBeenPwned check | Supabase Dashboard → Authentication → Providers → Email |
| Extension in `public` schema (e.g. `pg_trgm`, `uuid-ossp`) | Migration: move to `extensions` schema | SQL migration |
| Public bucket allows listing | Either flip bucket to private, or add a restrictive `storage.objects` SELECT policy | Storage settings + policy |

The first one is a dashboard toggle (I'll instruct, you click). The other two I can do via migration once you approve.

### 2. Record accepted posture in security memory
Write the rationale into `update_memory` so future scans (and future-me) don't re-flag the same items:

- Always-true INSERT policies on logging/audit tables (`audit_logs`, `audit_trail`, `discount_audit_log`, `affiliate_link_clicks`, `email_events`, etc.) are **intentional** — required for system-side telemetry.
- `SECURITY DEFINER` on tenant helpers (`has_role`, `get_current_user_shop_id`, `convert_*`, `generate_*`) is **intentional** — it's the foundation of the multi-tenant RLS design, per project memory `mem://security/multi-tenant-isolation-pattern`.
- Document what would still be a real vulnerability (e.g. always-true SELECT on a tenant table like `customers`, `work_orders`, `invoices`).

### 3. Mark scanner findings as accepted (with explanation)
For each scanner finding that falls under the accepted categories above, call `manage_security_finding` with `ignore` + a clear reason referencing the memory note. Real issues stay open.

### 4. Deliverable from Phase B
- 3 platform items resolved
- Clean security memory document
- Scanner inbox shows only *real* findings (the ones Phase A will target)

---

## Phase A — Plan (next session, after B is done)

Scoped, table-by-table review using the Phase B baseline:

1. List remaining always-true INSERT/UPDATE/DELETE policies after the accepted ones are filtered out.
2. For each: classify as **owner-scoped**, **role-scoped**, or **auth-only**, and rewrite with `auth.uid() IS NOT NULL` / `has_role(...)` / `shop_id = get_current_user_shop_id()` as appropriate.
3. One migration per logical group (e.g. "tighten cart/wishlist writes", "tighten customer communications writes"), so any regression is easy to bisect.
4. Smoke-test affected flows after each group.

---

## What I need from you to proceed with B

Just a "go" — then I'll:
1. Open the migration for the extension move + storage policy.
2. Write the security memory update.
3. Mark the accepted scanner findings as ignored.
4. Give you the 1-click dashboard instruction for the leaked-password toggle.

Best way forward: **approve B now, ship it, then green-light A as a follow-up.**
