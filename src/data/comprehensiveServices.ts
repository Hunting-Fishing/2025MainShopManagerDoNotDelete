
import { ServiceMainCategory } from '@/types/serviceHierarchy';

// Export the missing serviceSearchSynonyms
export const serviceSearchSynonyms: Record<string, string[]> = {
  "oil change": ["oil", "lube", "lubrication", "motor oil", "engine oil"],
  "brake": ["brakes", "brake pads", "brake service", "brake repair", "brake fluid"],
  "tire": ["tires", "tire service", "tire repair", "tire rotation", "wheel"],
  "transmission": ["trans", "transmission service", "transmission repair", "gear box"],
  "battery": ["battery service", "battery replacement", "battery test", "electrical"],
  "tune up": ["tuneup", "tune-up", "maintenance", "service"],
  "air filter": ["filter", "air cleaner", "engine filter"],
  "serpentine belt": ["belt", "drive belt", "v-belt", "accessory belt"],
  "spark plug": ["plugs", "ignition", "spark plugs"],
  "coolant": ["antifreeze", "radiator fluid", "cooling system"]
};

// Updated comprehensive service data with proper typing
export const comprehensiveServiceCategories: ServiceMainCategory[] = [
  {
    id: "oil-maintenance",
    name: "Oil Change & Maintenance",
    description: "Regular maintenance services to keep your vehicle running smoothly",
    display_order: 1,
    is_active: true,
    subcategories: [
      {
        id: "oil-changes",
        name: "Oil Changes",
        description: "Professional oil change services",
        category_id: "oil-maintenance",
        display_order: 1,
        jobs: [
          {
            id: "standard-oil-change",
            name: "Standard Oil Change",
            description: "Conventional oil change with filter replacement",
            subcategory_id: "oil-changes",
            category_id: "oil-maintenance",
            base_price: 35,
            estimated_duration: 30,
            skill_level: "basic",
            display_order: 1,
            is_active: true,
            estimatedTime: 30,
            price: 35
          },
          {
            id: "synthetic-oil-change", 
            name: "Synthetic Oil Change",
            description: "Full synthetic oil change with premium filter",
            subcategory_id: "oil-changes",
            category_id: "oil-maintenance",
            base_price: 65,
            estimated_duration: 30,
            skill_level: "basic", 
            display_order: 2,
            is_active: true,
            estimatedTime: 30,
            price: 65
          },
          {
            id: "high-mileage-oil-change",
            name: "High Mileage Oil Change", 
            description: "Special oil blend for vehicles with high mileage",
            subcategory_id: "oil-changes",
            category_id: "oil-maintenance",
            base_price: 45,
            estimated_duration: 30,
            skill_level: "basic",
            display_order: 3,
            is_active: true,
            estimatedTime: 30,
            price: 45
          }
        ]
      }
    ]
  }
];
