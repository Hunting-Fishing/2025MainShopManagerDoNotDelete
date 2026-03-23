

# Fix: Service Order Detail Page — Column Name Mismatch

## Root Cause

The `SepticOrderDetail.tsx` query joins `septic_tanks` using **wrong column names**:

| Used in query | Actual column |
|---|---|
| `capacity_gallons` | `tank_size_gallons` |
| `location_description` | `location_address` |

PostgREST returns an error when selecting non-existent columns from a joined table. Since the error is caught and treated as "no data," the page shows "Service order not found" even though the order exists.

## Fix

### File: `src/pages/septic/SepticOrderDetail.tsx`

**Line 41** — Fix the `septic_tanks` select columns:

```ts
// Before
septic_tanks(id, tank_type, capacity_gallons, location_description)

// After
septic_tanks(id, tank_type, tank_size_gallons, location_address)
```

**Line 178** — Update the rendering to use the correct field names:

```ts
// Before
<p>Tank: {tank.tank_type} — {tank.capacity_gallons} gal</p>
{tank.location_description && <p>Location: {tank.location_description}</p>}

// After
<p>Tank: {tank.tank_type} — {tank.tank_size_gallons} gal</p>
{tank.location_address && <p>Location: {tank.location_address}</p>}
```

## Summary

Two-line fix in one file. Wrong column names in the PostgREST join cause the entire query to error out silently.

