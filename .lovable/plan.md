

# Fix Septic Service Order Detail + Route Stop Actions

## Problems Found

### Problem 1: Service Order Detail Shows "Service order not found"

**Root Cause**: The `SepticOrderDetail.tsx` query filters by both `orderId` AND `shopId`. The `useShopId()` hook is asynchronous — if `shopId` hasn't resolved yet when the query runs with `enabled: !!orderId && !!shopId`, it works correctly. However, the real issue is that `shopId` is loaded but the RLS policy on `septic_service_orders` uses a subquery (`profiles.id = auth.uid()`), and the `useShopId()` hook separately also queries profiles. The query itself double-filters: `.eq('shop_id', shopId)` is redundant since RLS already enforces shop isolation. If there's any timing mismatch between the shop ID resolved by the hook and the one in the database, it returns nothing.

**Verified**: The order exists in the database (id: `5f296746...`, shop_id: `d5c507f2...`, status: `pending`). The user's profile has the correct `shop_id`. The RLS policy alone is sufficient — the `.eq('shop_id', shopId)` filter is redundant and can cause issues if `shopId` is stale.

**Fix**: Remove the `.eq('shop_id', shopId)` filter from `SepticOrderDetail.tsx` since RLS handles shop isolation. Also remove `shopId` from the `enabled` check so the query runs as soon as `orderId` is available.

### Problem 2: Route Stops Are Not Clickable/Actionable

**Root Cause**: In `SepticRoutes.tsx`, route stop rows (lines 640-663) render address text and a status icon, but have no `onClick` handler, no status change controls, and no action buttons (arrived, skip, complete, navigate). They're purely visual.

**Fix**: Add actionable controls to each route stop:
- Click stop to view linked service order
- Status dropdown (Pending / Arrived / In Progress / Completed / Skipped)
- "Navigate" button opening Google Maps directions
- "Skip" action that removes the stop from the route and sets the service order back to unassigned (pending)
- "View Customer" link to customer details page

### Problem 3: No Route-Level Stop Data Enrichment

The route stops query (`select('*')`) doesn't join to `septic_service_orders` or `septic_customers`, so stop cards have no order number or customer name.

**Fix**: Join `septic_service_orders` and `septic_customers` in the route stops query to show order numbers and customer names on stop cards.

## Changes

### File: `src/pages/septic/SepticOrderDetail.tsx`

**Line 43-44**: Remove `.eq('shop_id', shopId)` — RLS handles this.
**Line 49**: Change `enabled` to `!!orderId` only (remove `shopId` dependency).
Remove `shopId` from `queryKey` to avoid cache misses during loading.

### File: `src/pages/septic/SepticRoutes.tsx`

**Route Stops Query (~line 302-313)**: Add joins to fetch service order and customer data:
```ts
.select('*, septic_service_orders(id, order_number, status, customer_id, septic_customers(id, first_name, last_name))')
```

**Stop Rendering (~lines 640-663)**: Replace static stop rows with actionable cards:
- Show customer name and order number from joined data
- Add a status dropdown (Pending / Arrived / In Progress / Completed / Skipped)
- Add "Navigate" button (Google Maps link using stop lat/lng)
- Add "Skip" button that:
  1. Deletes the route stop
  2. Updates the service order status back to `pending` (so it re-appears in unassigned)
  3. Invalidates route stops and unassigned orders queries
- Make stop address clickable → navigates to `/septic/orders/:serviceOrderId`

**New mutation**: `updateStopStatus` — updates `septic_route_stops.status` and sets `actual_arrival` when status = 'arrived'.

**New mutation**: `skipStop` — deletes the route stop, decrements `total_jobs` on the route, and updates the service order status to `pending`.

**`transformedStops` (~line 495-506)**: Include joined order_number and customer name from the query result.

### Summary

Two targeted fixes:
1. Remove redundant `shop_id` filter from order detail query so it loads correctly via RLS
2. Make route stops interactive with status controls, navigation, skip/remove, and click-to-view-order

No database changes needed — all tables and columns already exist.

