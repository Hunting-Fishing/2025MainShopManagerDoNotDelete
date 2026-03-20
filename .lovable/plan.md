

# Expand Supplements: Brands Tab, Essential Oils, Nutrition Breakdown & doTERRA Products

## Overview

Add a Brands tab for browsing/managing supplement brands (starting with doTERRA USA & Canada), add Essential Oils as a new category, expand supplement detail to show nutrition percentages (daily value %), and seed doTERRA products with real vitamin/mineral content data.

## Database Changes

### 1. Alter `pt_supplement_brands` — add columns

| Column | Type | Notes |
|--------|------|-------|
| country | text | e.g. "USA", "Canada" — supports regional brand variants |
| category | text | `supplements`, `essential_oils`, `both` |
| shop_id | uuid FK, nullable | null = global brand, set = shop-specific |

### 2. Alter `pt_supplements` — add columns

| Column | Type | Notes |
|--------|------|-------|
| nutrition_facts | jsonb | Structured vitamin/mineral % daily value per serving, e.g. `{"vitamin_a": {"amount": "900mcg", "daily_value_percent": 100}, ...}` |
| serving_size | text | e.g. "1 capsule", "2 softgels" |
| product_type | text DEFAULT 'supplement' | `supplement`, `essential_oil`, `blend` |

### 3. Add `essential_oil` to category options

New categories: `essential_oil`, `oil_blend` (in addition to existing ones).

### 4. Seed data

**Brands** — Insert into `pt_supplement_brands`:
- doTERRA USA (website: doterra.com, country: USA, category: both)
- doTERRA Canada (website: doterra.com/CA, country: Canada, category: both)

**Products** — Insert doTERRA supplements into `pt_supplements`:
- **Microplex VMz** (Food Nutrient Complex) — with full nutrition_facts JSON: Vitamin A 100%, Vitamin C 133%, Vitamin D 500%, Vitamin E 100%, B1/B2/B3/B6/B12, Folate, Biotin, Calcium, Iron, Magnesium, Zinc, etc.
- **Alpha CRS+** (Cellular Vitality Complex) — with botanical/antioxidant breakdown
- **xEO Mega** (Essential Oil Omega Complex) — with EPA/DHA amounts
- **TerraZyme** (Digestive Enzyme Complex)
- **PB Assist+** (Probiotic Defense)
- **Deep Blue Polyphenol Complex**
- **Lifelong Vitality Pack** (bundle reference)

**Essential Oils** — Insert popular doTERRA oils:
- Lavender, Peppermint, Lemon, Tea Tree (Melaleuca), Frankincense, On Guard Blend, Deep Blue Blend, DigestZen Blend
- Each with: benefits, best_time_to_take (usage guidance), health_guide (therapeutic properties), warnings

### 5. RLS

Add `shop_id`-scoped policies for `pt_supplement_brands` if not already present. Global records (shop_id = null) readable by all.

## UI Changes

### 1. New "Brands" Tab on Supplements Page

Add between "Browse Catalog" and "Vitamin Guide":

- Grid of brand cards showing: logo, name, country flag, product count, sponsor badge
- Click a brand → filters Browse Catalog to that brand's products
- "Add Brand" button for trainers to add custom brands (name, website, country, category)

### 2. New Categories in Browse Catalog

Add to the category filter dropdown:
- `essential_oil` → "Essential Oils"
- `oil_blend` → "Oil Blends"

Add category color styling for essential oils (purple tones).

### 3. Enhanced Supplement Detail Dialog — Nutrition Tab

Replace the current basic "Nutrition" tab content with a proper nutrition facts panel:
- If `nutrition_facts` JSON exists, render a "Nutrition Facts" style table showing each vitamin/mineral with amount and % Daily Value
- Progress bars for each nutrient showing % DV visually
- Serving size displayed at top
- This lets trainers see exactly what % of daily intake a single doTERRA pill provides

### 4. Product Type Badge

Show "Essential Oil" or "Blend" badge on cards for non-supplement products.

## New Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `BrandCard.tsx` | supplements/ | Brand display tile with logo, name, country |
| `BrandsTab.tsx` | supplements/ | Full brands browser with add functionality |
| `NutritionFactsPanel.tsx` | supplements/ | % Daily Value table with progress bars |
| `AddBrandDialog.tsx` | supplements/ | Form to add new brand |

## Files to Create/Edit

| File | Action |
|------|--------|
| Migration SQL | Alter tables, add seed data for doTERRA brands + products + oils |
| `PersonalTrainerSupplements.tsx` | Add Brands tab, essential oil categories |
| `SupplementCard.tsx` | Add product_type badge for essential oils |
| `SupplementDetailDialog.tsx` | Add NutritionFactsPanel to nutrition tab |
| `BrandsTab.tsx` | New |
| `BrandCard.tsx` | New |
| `AddBrandDialog.tsx` | New |
| `NutritionFactsPanel.tsx` | New |

## Nutrition Facts JSON Structure

```json
{
  "vitamin_a": { "amount": "900mcg", "dv": 100 },
  "vitamin_c": { "amount": "200mg", "dv": 222 },
  "vitamin_d": { "amount": "50mcg", "dv": 250 },
  "calcium": { "amount": "100mg", "dv": 8 },
  "iron": { "amount": "5mg", "dv": 28 },
  "vitamin_b12": { "amount": "100mcg", "dv": 4167 }
}
```

This structure supports any nutrient and renders dynamically in the NutritionFactsPanel.

