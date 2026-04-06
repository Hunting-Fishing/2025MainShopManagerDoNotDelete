

# Add "Back to Modules" Button at Top of Module Detail Pages

## Problem
When users click "View" on a module card from the landing page, they land on `/modules/:slug` (the ModuleLearnMore page). There is a "View All Modules" button in the hero area and an "Explore Other Modules" button at the very bottom, but no sticky/prominent back button at the top of the page. Users may feel trapped, especially on long pages.

## Changes

### `src/pages/ModuleLearnMore.tsx`
Add a fixed top navigation bar with a back button, inserted at the very top of the page (before the hero section):

- A slim sticky header bar (`sticky top-0 z-50 bg-background/80 backdrop-blur border-b`) containing:
  - A "Back to Modules" button (left-aligned) using `ArrowLeft` icon, linking to `/#modules`
  - The module name displayed in the center for context
- This gives users an always-visible escape route at the top of the page

The existing "View All Modules" button in the hero and "Explore Other Modules" at the bottom remain unchanged.

## Technical Details
- Import `ArrowLeft` from `lucide-react`
- The sticky bar sits inside the component's root div, above the hero `<section>`
- Uses `backdrop-blur` for a modern frosted-glass look matching the app's style

