

# Supplements Enhancement — Amazon Affiliate, Vitamin Education & Brand Tracking

## Overview

Transform the supplements section into a comprehensive vitamin education and affiliate revenue platform. Add Amazon Associates affiliate links to every supplement, build a vitamin interaction/timing guide, and enhance brand capture across the catalog.

## Database Changes

### Alter `pt_supplements` — add new columns

| Column | Type | Notes |
|--------|------|-------|
| amazon_asin | text | Amazon product ASIN for affiliate link generation |
| amazon_affiliate_tag | text | Shop's Amazon Associates tag (stored per-shop in settings) |
| best_time_to_take | text | e.g. "Morning with food", "Before bed" |
| take_with | text[] | Vitamins/supplements that pair well |
| avoid_with | text[] | Vitamins/supplements to NOT take together |
| food_sources | text[] | Natural food sources of this vitamin |
| deficiency_signs | text[] | Signs of deficiency |
| health_guide | text | Extended educational content about the vitamin |

### New table: `pt_shop_affiliate_settings`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| shop_id | uuid FK → shops, UNIQUE | |
| amazon_associate_tag | text | e.g. "mygym-20" |
| created_at | timestamptz | |

RLS: Scoped by `shop_id = get_current_user_shop_id()`.

### Update seed data

Update all ~45 existing supplement seed records to include `best_time_to_take`, `take_with`, `avoid_with`, `food_sources`, `deficiency_signs`, and `amazon_asin` (popular ASINs for top vitamin brands like Nature Made, NOW Foods, Garden of Life).

## Amazon Affiliate Link Generation

Links will be constructed as:
```
https://www.amazon.com/dp/{ASIN}?tag={ASSOCIATE_TAG}
```

If no shop-level `amazon_associate_tag` is set, a default placeholder is used with a prompt to configure it. The tag is stored per-shop so each gym earns their own commissions.

## UI Changes

### 1. Enhanced Supplement Card
- Add "Buy on Amazon" button with Amazon icon linking to `amazon.com/dp/{asin}?tag={tag}`
- Show brand name prominently
- Add timing badge ("Morning", "Evening", "Pre-Workout")

### 2. Supplement Detail Dialog (new)
When clicking a supplement card, open a detailed dialog with tabs:
- **Overview**: Description, dose, benefits, brand, price
- **Health Guide**: Extended educational content about the vitamin
- **When to Take**: Best time, with meals or empty stomach
- **Interactions**: What to take it WITH (green list) and what to AVOID (red list)
- **Food Sources**: Natural dietary sources
- **Deficiency Signs**: Symptoms of low levels
- **Buy**: Amazon affiliate link with prominent CTA button

### 3. New "Vitamin Guide" Tab on Supplements Page
Add a fourth tab alongside Browse/Search/Stacks:
- **Vitamin Guide**: Educational grid showing all vitamins with interaction matrix
- Visual chart showing which vitamins pair well together and which conflict
- Timing guide showing morning vs evening vs with-meals recommendations
- Searchable/filterable by benefit (e.g. "immune", "energy", "sleep")

### 4. Affiliate Settings (in About or Settings)
Simple form for the shop owner to enter their Amazon Associates tag, stored in `pt_shop_affiliate_settings`.

## New Components

| Component | Purpose |
|-----------|---------|
| `SupplementDetailDialog.tsx` | Full detail view with tabs for education, interactions, buying |
| `VitaminGuide.tsx` | Educational vitamin reference with interaction matrix |
| `VitaminInteractionChart.tsx` | Visual take-with / avoid-with display |
| `VitaminTimingGuide.tsx` | When-to-take visual guide |
| `AmazonBuyButton.tsx` | Styled Amazon affiliate CTA with tracking |
| `AffiliateSettingsCard.tsx` | Shop owner enters Amazon Associates tag |

All in `src/components/personal-trainer/supplements/`.

## Files to Create/Edit

| File | Action |
|------|--------|
| Migration SQL | Add columns to `pt_supplements`, create `pt_shop_affiliate_settings`, update seed data with education content and ASINs |
| `SupplementCard.tsx` | Add Amazon buy button, timing badge, brand display |
| `PersonalTrainerSupplements.tsx` | Add "Vitamin Guide" tab, click-to-detail on cards |
| `SupplementDetailDialog.tsx` | New — tabbed detail with education + affiliate |
| `VitaminGuide.tsx` | New — educational reference grid |
| `VitaminInteractionChart.tsx` | New — interaction pairing display |
| `VitaminTimingGuide.tsx` | New — timing recommendations |
| `AmazonBuyButton.tsx` | New — Amazon affiliate CTA |
| `AffiliateSettingsCard.tsx` | New — Associates tag configuration |
| `PersonalTrainerAbout.tsx` | Add Affiliate Settings section |
| `src/main.tsx` | Fix duplicate attribute build error |

## Interaction Data Examples

| Vitamin | Take With | Avoid With |
|---------|-----------|------------|
| Vitamin D3 | Vitamin K2, Magnesium, Fat-containing meal | High-dose Calcium alone |
| Iron | Vitamin C | Calcium, Zinc, Coffee/Tea |
| Vitamin C | Iron, Collagen | High-dose B12 (same time) |
| Calcium | Vitamin D3, Vitamin K2 | Iron, Zinc, Magnesium (same time) |
| Zinc | Empty stomach or with protein | Iron, Calcium, Copper (same time) |
| Magnesium | Vitamin D3, B6 | Calcium (same time) |
| B12 | Folate | Vitamin C (high dose, same time) |

This interaction data will be seeded directly into the database for all ~45 supplements.

