

# Fix: Septic Customer Detail "Customer Not Found"

## Root Cause

Route parameter mismatch. The route is defined as:
```
/customers/:customerId
```

But the component destructures the wrong param name:
```ts
const { id } = useParams<{ id: string }>();
```

Since `id` is always `undefined`, the query never executes, and the page renders "Customer not found".

## Fix

**File: `src/pages/septic/SepticCustomerDetails.tsx`** (line 13)

Change:
```ts
const { id } = useParams<{ id: string }>();
```
To:
```ts
const { customerId: id } = useParams<{ customerId: string }>();
```

This single-line fix maps the route param `customerId` to the local variable `id` used throughout the component. No other changes needed — all queries already reference `id` correctly.

## Secondary Fix

Line 21 uses `.single()` which throws if no row is found. Change to `.maybeSingle()` so a missing customer shows the "not found" message gracefully instead of an error.

