

# Fix: Submission Review Dialog — Scrolling + Auto-Populate

## Problems

1. **No scroll**: `DialogContent` has `max-w-2xl` but no `max-height` or `overflow-y-auto`, so when content exceeds viewport height the dialog overflows and buttons are unreachable.
2. **Manual data entry**: Admin must manually visit the product URL, find the image, write a description, and enter the price — tedious at scale.

## Fix

### 1. Make Dialog Scrollable

**File: `src/components/developer/SubmissionReviewDialog.tsx`** (line 287)

Add `max-h-[85vh] overflow-y-auto` to the `DialogContent` wrapper so the entire dialog scrolls within the viewport. The footer buttons remain accessible.

### 2. Auto-Populate Product Details

Add a "Fetch Product Info" button next to the product URL that uses an edge function to scrape/extract metadata from the submitted URL:

- **Title confirmation** (pre-filled from submission)
- **Description** — extracted from page `meta[name="description"]` or OG description
- **Image URL** — extracted from `og:image` meta tag
- **Price** — extracted from product structured data or price meta tags

**New Edge Function: `fetch-product-meta`**
- Accepts a URL
- Fetches the page HTML (server-side to avoid CORS)
- Parses `og:image`, `og:description`, `meta description`, and price from JSON-LD or meta tags
- Returns `{ description, imageUrl, price }`

**UI Changes in `SubmissionReviewDialog.tsx`:**
- Add "Auto-Fill from URL" button below the product URL
- On click, calls the edge function with the submission URL
- Populates `productDescription`, `imageUrl`, and `productPrice` fields
- Shows loading state during fetch
- Falls back gracefully if metadata can't be extracted (fields remain editable)

## Files

| File | Action |
|---|---|
| `src/components/developer/SubmissionReviewDialog.tsx` | **Edit** — add scrolling, add auto-fill button + logic |
| `supabase/functions/fetch-product-meta/index.ts` | **Create** — edge function to scrape URL metadata |

## Technical Notes

- Edge function uses `fetch()` to get HTML, then regex/string parsing for meta tags (no DOM parser needed in Deno)
- Extracts: `og:image`, `og:description`, `product:price:amount`, JSON-LD price
- Auto-fill is best-effort — fields remain manually editable after population
- Scroll fix uses `max-h-[85vh] overflow-y-auto` on the content div inside DialogContent

