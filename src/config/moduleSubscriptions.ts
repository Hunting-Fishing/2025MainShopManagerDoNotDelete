// Module subscription configuration
// Maps module slugs to their Stripe product/price IDs

export interface ModuleConfig {
  slug: string;
  name: string;
  description: string;
  price: number;
  stripeProductId: string;
  stripePriceId: string;
  icon: string;
}

export const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  automotive: {
    slug: 'automotive',
    name: 'Large Repair Shop',
    description: 'Vehicle repair, maintenance, and diagnostic services',
    price: 49,
    stripeProductId: 'prod_TjQuamW7bXdlp9',
    stripePriceId: 'price_1Sly2TGapOfsltWt3PJVj6gu',
    icon: 'Car',
  },
  power_washing: {
    slug: 'power_washing',
    name: 'Power Washing',
    description: 'Residential and commercial pressure washing services',
    price: 39,
    stripeProductId: 'prod_TjQvjdaBkKsCDF',
    stripePriceId: 'price_1Sly3aGapOfsltWtWLPzXWiv',
    icon: 'Droplets',
  },
  gunsmith: {
    slug: 'gunsmith',
    name: 'Gunsmith',
    description: 'Firearm repair, customization, cleaning, and maintenance',
    price: 39,
    stripeProductId: 'prod_TjQv4acpfPjNlA',
    stripePriceId: 'price_1Sly46GapOfsltWtUKenA0jO',
    icon: 'Target',
  },
  marine: {
    slug: 'marine',
    name: 'Marine Services',
    description: 'Boat repair, maintenance, and marine equipment services',
    price: 49,
    stripeProductId: 'prod_TjQwLR1WwHrnDx',
    stripePriceId: 'price_1Sly4RGapOfsltWt3cOnn8yE',
    icon: 'Anchor',
  },
};

export const getModuleConfig = (slug: string): ModuleConfig | undefined => {
  return MODULE_CONFIGS[slug];
};

export const getAllPurchasableModules = (): ModuleConfig[] => {
  return Object.values(MODULE_CONFIGS);
};
