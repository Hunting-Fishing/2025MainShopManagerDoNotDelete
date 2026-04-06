

# Add Module Screenshots Gallery to Detail Pages

## Overview
Add a visual screenshot gallery section to each module's detail page (`/modules/:slug`) so prospective users can see what the module looks like before purchasing. I'll take live screenshots of each module's dashboard from the preview, save them to `public/screenshots/`, and display them in an interactive gallery.

## Approach

Since the dashboards require authentication, I'll need you to be logged in on the preview first. Then I'll navigate to each module's dashboard, take screenshots, and save them.

## Changes

### 1. Take screenshots of all live module dashboards
Navigate to each module's dashboard route and capture screenshots:
- `/automotive` (Repair Shop)
- `/power-washing` (Power Washing)
- `/gunsmith` (Gunsmith)
- `/marine-services` (Marine Services)
- `/fuel-delivery` (Fuel Delivery)
- `/water-delivery` (Water Delivery)
- `/septic` (Septic Services)
- `/export` (Vehicle Export)
- `/personal-trainer` (Personal Trainer)
- `/welding` (Welding & Fabrication)

Save each as `public/screenshots/{slug}-dashboard.png`

### 2. Add `screenshots` field to `LandingModule` type
In `src/config/landingModules.ts`:
- Add `screenshots?: { src: string; alt: string }[]` to the `LandingModule` type
- Populate each module's config with its screenshot paths

### 3. Add Screenshot Gallery section to `ModuleLearnMore.tsx`
Insert a new section after the hero (before "Built For Your Business") with:
- Section title: "See It In Action"
- A responsive image gallery showing thumbnails
- Click-to-expand: clicking a screenshot opens it in a lightbox/modal at full size
- Smooth animations consistent with the rest of the page (framer-motion)
- On mobile: horizontal scroll carousel; on desktop: grid layout

### 4. Create a `ScreenshotGallery` component
In `src/components/landing/ScreenshotGallery.tsx`:
- Accepts array of `{ src, alt }` screenshots
- Renders thumbnails in a grid (2 cols mobile, 3 cols desktop)
- Lightbox modal with left/right navigation arrows
- Keyboard navigation (arrow keys, Escape to close)

## Technical Details
- Screenshots saved as optimized PNGs in `public/screenshots/`
- Images loaded via standard `<img>` tags with lazy loading
- Lightbox uses Dialog from shadcn/ui for accessibility
- No external dependencies needed

## Prerequisite
**You need to be logged in on the preview** so I can access the module dashboards to take screenshots. Please log in first, then approve this plan.

