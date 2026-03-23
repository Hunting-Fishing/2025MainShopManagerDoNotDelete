

# Fix: Service Orders Not Showing on Customer Details Page

## Root Cause

Two issues working together:

1. **Cache invalidation mismatch**: When a service order is created in `SepticOrderForm.tsx`, it invalidates `queryKey: ['septic']`. But the customer details page uses `queryKey: ['septic-customer-orders', id, shopId]`. React Query's partial matching requires the key prefix to match as array elements — `'septic'` (string) does not match `'septic-customer-orders'` (string), so the customer details cache is never invalidated after order creation.

2. **No `staleTime` set**: If the user visited the customer details page before creating the order, the cached empty result persists and won't automatically refetch on re-navigation.

## Fix

### File: `src/pages/septic/SepticOrderForm.tsx` (line 94)

Broaden the cache invalidation after order creation to also invalidate customer-specific queries:

```ts
onSuccess: () => {
  toast.success('Service order created successfully');
  queryClient.invalidateQueries({ queryKey: ['septic'] });
  queryClient.invalidateQueries({ queryKey: ['septic-customer-orders'] });
  queryClient.invalidateQueries({ queryKey: ['septic-customer-invoices'] });
  navigate('/septic/orders');
},
```

### File: `src/pages/septic/SepticCustomerDetails.tsx` (orders query, ~line 53)

Add `staleTime: 0` and `refetchOnMount: 'always'` to ensure fresh data every time the page is visited:

```ts
const { data: orders = [] } = useQuery({
  queryKey: ['septic-customer-orders', id, shopId],
  queryFn: async () => { ... },
  enabled: !!id && !!shopId,
  staleTime: 0,
  refetchOnMount: 'always',
});
```

Apply the same to all queries on the customer details page (customer, tanks, invoices, notes, environmental, recommendations).

### Summary

Two small changes — broader invalidation on order creation and always-fresh queries on the customer details page. No database changes needed.

