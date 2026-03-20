

# Supplements Section, About Page & Sponsors Tab

## Overview

Build a dedicated Supplements section within the PT module for browsing vitamins, minerals, and supplement products with brand information. Add an About page for the app with a Sponsors tab for future brand partnerships. Use the Open Food Facts API (free, no key required) for product/brand data, supplemented by a local curated vitamin/supplement database.

## Database — New Tables

### `pt_supplements`
Curated supplement catalog (seeded with common vitamins/minerals, expandable).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| shop_id | uuid FK → shops, nullable | null = global/shared |
| name | text NOT NULL | e.g. "Vitamin D3" |
| category | text | `vitamin`, `mineral`, `amino_acid`, `herb`, `protein`, `pre_workout`, `post_workout`, `fat_burner`, `joint_support`, `other` |
| description | text | Benefits, usage |
| recommended_dose | text | e.g. "1000 IU daily" |
| benefits | text[] | Array of benefit tags |
| warnings | text | Contraindications |
| image_url | text | Product image |
| barcode | text | For scanner integration |
| brand_id | uuid FK → pt_supplement_brands | |
| price | numeric | Retail price |
| affiliate_link | text | For sponsor products |
| is_sponsored | boolean DEFAULT false | |
| created_at | timestamptz | |

### `pt_supplement_brands`
Brand directory for supplements.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| name | text NOT NULL | e.g. "Optimum Nutrition" |
| logo_url | text | |
| website | text | |
| is_sponsor | boolean DEFAULT false | Sponsor badge |
| description | text | |
| created_at | timestamptz | |

### `pt_client_supplements`
Track which supplements a client is taking.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| client_id | uuid FK → pt_clients | |
| shop_id | uuid FK → shops | |
| supplement_id | uuid FK → pt_supplements, nullable | Linked product |
| custom_name | text | If not in catalog |
| dosage | text | |
| frequency | text | daily, twice_daily, as_needed |
| start_date | date | |
| end_date | date, nullable | |
| notes | text | |
| created_at | timestamptz | |

### `pt_sponsors`
Sponsor partnerships for the About page.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| shop_id | uuid FK → shops | |
| name | text NOT NULL | |
| logo_url | text | |
| website | text | |
| tier | text | `platinum`, `gold`, `silver`, `bronze` |
| description | text | |
| is_active | boolean DEFAULT true | |
| created_at | timestamptz | |

## API Integration

**Open Food Facts** (free, no key, already pattern-matched in project):
- Search: `https://world.openfoodfacts.org/cgi/search.pl?search_terms=whey+protein&json=1`
- Product by barcode: `https://world.openfoodfacts.org/api/v0/product/{barcode}.json`
- Use for browsing branded supplement products, pulling nutrition facts, images, and brand info

**Local Seeded Data**: Pre-populate `pt_supplements` with ~50 common vitamins/minerals/supplements (Vitamin A–K, Iron, Zinc, Magnesium, Creatine, Whey Protein, BCAAs, Fish Oil, etc.) with dosage recommendations and benefits.

## New Pages

### 1. Supplements Page (`/personal-trainer/supplements`)
- **Browse tab**: Searchable grid of supplements by category (Vitamins, Minerals, Amino Acids, Proteins, Herbs, etc.)
- **Search tab**: Search Open Food Facts API for branded products, import into local catalog
- **Client Stacks tab**: View/manage which supplements each client is taking with dosage tracking
- Each supplement card shows: name, category badge, brand, recommended dose, benefits tags, sponsor badge if applicable

### 2. About Page (`/personal-trainer/about`)
- **About tab**: App description, version, mission statement, features overview
- **Sponsors tab**: Grid of sponsor logos with tier badges (Platinum/Gold/Silver/Bronze), links, descriptions
- **Contact tab**: Support info, feedback form placeholder

## New Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `SupplementsPage.tsx` | `src/pages/personal-trainer/` | Main supplements page with tabs |
| `SupplementCard.tsx` | `src/components/personal-trainer/supplements/` | Product display card |
| `SupplementSearch.tsx` | `src/components/personal-trainer/supplements/` | Open Food Facts search |
| `ClientSupplementStack.tsx` | `src/components/personal-trainer/supplements/` | Client's supplement list with add/edit |
| `VitaminReferenceGrid.tsx` | `src/components/personal-trainer/supplements/` | A–Z vitamin/mineral reference |
| `AboutPage.tsx` | `src/pages/personal-trainer/` | About + Sponsors page |
| `SponsorCard.tsx` | `src/components/personal-trainer/about/` | Sponsor logo tile with tier |

## Sidebar Changes

Add to the **Training** section:
- "Supplements" with a `Pill` icon

Add to the **Configuration** section:
- "About" with an `Info` icon

## Route Changes

- `/personal-trainer/supplements`
- `/personal-trainer/about`

## Seeded Vitamin/Mineral Data

Pre-populate the supplements table with comprehensive entries including:
- **Vitamins**: A, B1–B12, C, D3, E, K1, K2
- **Minerals**: Iron, Zinc, Magnesium, Calcium, Potassium, Selenium, Chromium
- **Amino Acids**: BCAAs, L-Glutamine, L-Carnitine, Creatine
- **Sports**: Whey Protein, Casein, Pre-Workout, Post-Workout, Fish Oil
- **Herbs**: Ashwagandha, Turmeric, Green Tea Extract

Each with recommended dosage, benefits array, and category classification.

## Files to Create/Edit

| File | Action |
|------|--------|
| Migration SQL | Create 4 tables, seed ~50 supplements |
| `PersonalTrainerSupplements.tsx` | New page |
| `PersonalTrainerAbout.tsx` | New page with About + Sponsors tabs |
| `src/components/personal-trainer/supplements/` | New directory (5 components) |
| `src/components/personal-trainer/about/SponsorCard.tsx` | New |
| `PersonalTrainerSidebar.tsx` | Add Supplements + About nav items |
| `App.tsx` | Add routes |

