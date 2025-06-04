
import { ServiceMainCategory } from '@/types/serviceHierarchy';

export const comprehensiveServices: ServiceMainCategory[] = [
  {
    id: 'oil-maintenance',
    name: 'Oil Change & Maintenance',
    description: 'Regular maintenance services',
    display_order: 1,
    is_active: true,
    position: 1,
    subcategories: [
      {
        id: 'oil-changes',
        name: 'Oil Changes',
        category_id: 'oil-maintenance',
        display_order: 1,
        jobs: [
          { 
            id: 'standard-oil', 
            name: 'Standard Oil Change', 
            estimatedTime: 30, 
            price: 35,
            subcategory_id: 'oil-changes',
            category_id: 'oil-maintenance',
            base_price: 35,
            estimated_duration: 30,
            skill_level: 'beginner',
            display_order: 1,
            is_active: true
          },
          { 
            id: 'synthetic-oil', 
            name: 'Synthetic Oil Change', 
            estimatedTime: 30, 
            price: 65,
            subcategory_id: 'oil-changes',
            category_id: 'oil-maintenance',
            base_price: 65,
            estimated_duration: 30,
            skill_level: 'beginner',
            display_order: 2,
            is_active: true
          },
          { 
            id: 'high-mileage-oil', 
            name: 'High Mileage Oil Change', 
            estimatedTime: 30, 
            price: 45,
            subcategory_id: 'oil-changes',
            category_id: 'oil-maintenance',
            base_price: 45,
            estimated_duration: 30,
            skill_level: 'beginner',
            display_order: 3,
            is_active: true
          }
        ]
      },
      {
        id: 'filter-services',
        name: 'Filter Services',
        category_id: 'oil-maintenance',
        display_order: 2,
        jobs: [
          { 
            id: 'air-filter', 
            name: 'Air Filter Replacement', 
            estimatedTime: 15, 
            price: 25,
            subcategory_id: 'filter-services',
            category_id: 'oil-maintenance',
            base_price: 25,
            estimated_duration: 15,
            skill_level: 'beginner',
            display_order: 1,
            is_active: true
          },
          { 
            id: 'cabin-filter', 
            name: 'Cabin Filter Replacement', 
            estimatedTime: 20, 
            price: 30,
            subcategory_id: 'filter-services',
            category_id: 'oil-maintenance',
            base_price: 30,
            estimated_duration: 20,
            skill_level: 'beginner',
            display_order: 2,
            is_active: true
          },
          { 
            id: 'fuel-filter', 
            name: 'Fuel Filter Replacement', 
            estimatedTime: 45, 
            price: 65,
            subcategory_id: 'filter-services',
            category_id: 'oil-maintenance',
            base_price: 65,
            estimated_duration: 45,
            skill_level: 'intermediate',
            display_order: 3,
            is_active: true
          }
        ]
      }
    ]
  },
  {
    id: 'brakes',
    name: 'Brakes',
    description: 'Brake system services',
    display_order: 2,
    is_active: true,
    position: 2,
    subcategories: [
      {
        id: 'brake-pads',
        name: 'Brake Pads',
        category_id: 'brakes',
        display_order: 1,
        jobs: [
          { 
            id: 'front-brake-pads', 
            name: 'Front Brake Pad Replacement', 
            description: 'Replace front brake pads and inspect rotors',
            estimatedTime: 90, 
            price: 150,
            subcategory_id: 'brake-pads',
            category_id: 'brakes',
            base_price: 150,
            estimated_duration: 90,
            skill_level: 'intermediate',
            display_order: 1,
            is_active: true
          },
          { 
            id: 'rear-brake-pads', 
            name: 'Rear Brake Pad Replacement', 
            description: 'Replace rear brake pads and inspect rotors',
            estimatedTime: 90, 
            price: 140,
            subcategory_id: 'brake-pads',
            category_id: 'brakes',
            base_price: 140,
            estimated_duration: 90,
            skill_level: 'intermediate',
            display_order: 2,
            is_active: true
          },
          { 
            id: 'brake-rotor-replacement', 
            name: 'Brake Rotor Replacement', 
            description: 'Replace brake rotors and pads',
            estimatedTime: 120, 
            price: 300,
            subcategory_id: 'brake-pads',
            category_id: 'brakes',
            base_price: 300,
            estimated_duration: 120,
            skill_level: 'intermediate',
            display_order: 3,
            is_active: true
          },
          { 
            id: 'brake-fluid-flush', 
            name: 'Brake Fluid Flush', 
            description: 'Complete brake fluid system flush',
            estimatedTime: 60, 
            price: 80,
            subcategory_id: 'brake-pads',
            category_id: 'brakes',
            base_price: 80,
            estimated_duration: 60,
            skill_level: 'intermediate',
            display_order: 4,
            is_active: true
          },
          { 
            id: 'brake-caliper-service', 
            name: 'Brake Caliper Service', 
            description: 'Service or replace brake calipers',
            estimatedTime: 180, 
            price: 250,
            subcategory_id: 'brake-pads',
            category_id: 'brakes',
            base_price: 250,
            estimated_duration: 180,
            skill_level: 'advanced',
            display_order: 5,
            is_active: true
          },
          { 
            id: 'brake-line-replacement', 
            name: 'Brake Line Replacement', 
            description: 'Replace damaged brake lines',
            estimatedTime: 150, 
            price: 200,
            subcategory_id: 'brake-pads',
            category_id: 'brakes',
            base_price: 200,
            estimated_duration: 150,
            skill_level: 'advanced',
            display_order: 6,
            is_active: true
          }
        ]
      }
    ]
  },
  {
    id: 'tires',
    name: 'Tires',
    description: 'Tire services',
    display_order: 3,
    is_active: true,
    position: 3,
    subcategories: [
      {
        id: 'tire-installation',
        name: 'Tire Installation',
        category_id: 'tires',
        display_order: 1,
        jobs: [
          { 
            id: 'tire-mount-balance', 
            name: 'Tire Mount & Balance', 
            estimatedTime: 60, 
            price: 80,
            subcategory_id: 'tire-installation',
            category_id: 'tires',
            base_price: 80,
            estimated_duration: 60,
            skill_level: 'intermediate',
            display_order: 1,
            is_active: true
          },
          { 
            id: 'tire-rotation', 
            name: 'Tire Rotation', 
            estimatedTime: 30, 
            price: 25,
            subcategory_id: 'tire-installation',
            category_id: 'tires',
            base_price: 25,
            estimated_duration: 30,
            skill_level: 'beginner',
            display_order: 2,
            is_active: true
          }
        ]
      }
    ]
  },
  {
    id: 'engine',
    name: 'Engine Services',
    description: 'Engine maintenance and repair',
    display_order: 4,
    is_active: true,
    position: 4,
    subcategories: [
      {
        id: 'tune-up',
        name: 'Tune-Up Services',
        category_id: 'engine',
        display_order: 1,
        jobs: [
          { 
            id: 'basic-tune-up', 
            name: 'Basic Tune-Up', 
            estimatedTime: 120, 
            price: 150,
            subcategory_id: 'tune-up',
            category_id: 'engine',
            base_price: 150,
            estimated_duration: 120,
            skill_level: 'intermediate',
            display_order: 1,
            is_active: true
          },
          { 
            id: 'complete-tune-up', 
            name: 'Complete Tune-Up', 
            estimatedTime: 180, 
            price: 250,
            subcategory_id: 'tune-up',
            category_id: 'engine',
            base_price: 250,
            estimated_duration: 180,
            skill_level: 'intermediate',
            display_order: 2,
            is_active: true
          }
        ]
      },
      {
        id: 'engine-repair',
        name: 'Engine Repair',
        category_id: 'engine',
        display_order: 2,
        jobs: [
          { 
            id: 'timing-belt', 
            name: 'Timing Belt Replacement', 
            description: 'Replace timing belt and inspect related components',
            estimatedTime: 240, 
            price: 400,
            subcategory_id: 'engine-repair',
            category_id: 'engine',
            base_price: 400,
            estimated_duration: 240,
            skill_level: 'advanced',
            display_order: 1,
            is_active: true
          },
          { 
            id: 'water-pump', 
            name: 'Water Pump Replacement', 
            description: 'Replace water pump and coolant system service',
            estimatedTime: 180, 
            price: 300,
            subcategory_id: 'engine-repair',
            category_id: 'engine',
            base_price: 300,
            estimated_duration: 180,
            skill_level: 'advanced',
            display_order: 2,
            is_active: true
          },
          { 
            id: 'head-gasket', 
            name: 'Head Gasket Replacement', 
            description: 'Engine head gasket replacement',
            estimatedTime: 480, 
            price: 1200,
            subcategory_id: 'engine-repair',
            category_id: 'engine',
            base_price: 1200,
            estimated_duration: 480,
            skill_level: 'expert',
            display_order: 3,
            is_active: true
          },
          { 
            id: 'engine-rebuild', 
            name: 'Engine Rebuild', 
            description: 'Complete engine rebuild service',
            estimatedTime: 960, 
            price: 3000,
            subcategory_id: 'engine-repair',
            category_id: 'engine',
            base_price: 3000,
            estimated_duration: 960,
            skill_level: 'expert',
            display_order: 4,
            is_active: true
          },
          { 
            id: 'transmission-service', 
            name: 'Transmission Service', 
            description: 'Transmission fluid change and inspection',
            estimatedTime: 90, 
            price: 120,
            subcategory_id: 'engine-repair',
            category_id: 'engine',
            base_price: 120,
            estimated_duration: 90,
            skill_level: 'intermediate',
            display_order: 5,
            is_active: true
          },
          { 
            id: 'transmission-rebuild', 
            name: 'Transmission Rebuild', 
            description: 'Complete transmission rebuild',
            estimatedTime: 720, 
            price: 2500,
            subcategory_id: 'engine-repair',
            category_id: 'engine',
            base_price: 2500,
            estimated_duration: 720,
            skill_level: 'expert',
            display_order: 6,
            is_active: true
          }
        ]
      }
    ]
  },
  {
    id: 'electrical',
    name: 'Electrical',
    description: 'Electrical system services',
    display_order: 5,
    is_active: true,
    position: 5,
    subcategories: [
      {
        id: 'battery-alternator',
        name: 'Battery & Alternator',
        category_id: 'electrical',
        display_order: 1,
        jobs: [
          { 
            id: 'battery-replacement', 
            name: 'Battery Replacement', 
            estimatedTime: 30, 
            price: 120,
            subcategory_id: 'battery-alternator',
            category_id: 'electrical',
            base_price: 120,
            estimated_duration: 30,
            skill_level: 'beginner',
            display_order: 1,
            is_active: true
          },
          { 
            id: 'alternator-replacement', 
            name: 'Alternator Replacement', 
            estimatedTime: 120, 
            price: 300,
            subcategory_id: 'battery-alternator',
            category_id: 'electrical',
            base_price: 300,
            estimated_duration: 120,
            skill_level: 'intermediate',
            display_order: 2,
            is_active: true
          }
        ]
      }
    ]
  }
];

