

# Remove Amazon Button from Supplement Card Front

## Change

Remove the Amazon buy button and price display from the `SupplementCard.tsx` front face. The "Buy on Amazon" link will only appear inside the `SupplementDetailDialog` when a card is opened.

## File: `src/components/personal-trainer/supplements/SupplementCard.tsx`

- Remove the `AmazonBuyButton` import
- Delete lines 118–128 (the Amazon button block and the price/affiliate block)
- Remove unused props from the interface if desired (`amazonAsin`, `affiliateTag`, `price`, `affiliateLink`) — though keeping them is harmless since they're passed through to the detail dialog elsewhere

## File: `src/main.tsx`

- Re-save with clean content to fix the recurring duplicate attribute build error

