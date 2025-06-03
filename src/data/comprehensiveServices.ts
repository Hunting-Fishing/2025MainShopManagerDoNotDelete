
import { ServiceMainCategory } from '@/types/serviceHierarchy';

export const comprehensiveAutomotiveServices: ServiceMainCategory[] = [
  {
    id: '1',
    name: 'Oil Change & Maintenance',
    description: 'Regular maintenance services',
    position: 1,
    subcategories: [
      {
        id: '1-1',
        name: 'Oil Changes',
        jobs: [
          { id: '1-1-1', name: 'Standard Oil Change', estimatedTime: 30, price: 35 },
          { id: '1-1-2', name: 'Synthetic Oil Change', estimatedTime: 30, price: 65 },
          { id: '1-1-3', name: 'High Mileage Oil Change', estimatedTime: 30, price: 45 }
        ]
      },
      {
        id: '1-2',
        name: 'Filter Services',
        jobs: [
          { id: '1-2-1', name: 'Air Filter Replacement', estimatedTime: 15, price: 25 },
          { id: '1-2-2', name: 'Cabin Filter Replacement', estimatedTime: 20, price: 30 },
          { id: '1-2-3', name: 'Fuel Filter Replacement', estimatedTime: 45, price: 65 }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Brakes & Wheels',
    description: 'Complete brake system and wheel services',
    position: 2,
    subcategories: [
      {
        id: '2-1',
        name: 'Brake Pads',
        jobs: [
          { id: '2-1-1', name: 'Front Brake Pad Replacement', estimatedTime: 90, price: 150 },
          { id: '2-1-2', name: 'Rear Brake Pad Replacement', estimatedTime: 90, price: 140 }
        ]
      },
      {
        id: '2-2',
        name: 'Brake Lines & Hydraulics',
        description: 'Brake line, hose, and hydraulic system services',
        jobs: [
          { id: '2-2-1', name: 'Brake Line Repair', description: 'Repair damaged brake lines', estimatedTime: 120, price: 180 },
          { id: '2-2-2', name: 'Brake Line Replacement', description: 'Replace worn or damaged brake lines', estimatedTime: 180, price: 250 },
          { id: '2-2-3', name: 'Brake Hose Replacement', description: 'Replace flexible brake hoses', estimatedTime: 90, price: 120 },
          { id: '2-2-4', name: 'Brake Fluid Line Service', description: 'Service and flush brake fluid lines', estimatedTime: 60, price: 85 },
          { id: '2-2-5', name: 'Master Cylinder Line Service', description: 'Service brake lines connected to master cylinder', estimatedTime: 150, price: 200 },
          { id: '2-2-6', name: 'Brake Line Inspection', description: 'Comprehensive brake line inspection', estimatedTime: 30, price: 45 }
        ]
      },
      {
        id: '2-3',
        name: 'Brake Rotors',
        jobs: [
          { id: '2-3-1', name: 'Rotor Resurfacing', estimatedTime: 60, price: 80 },
          { id: '2-3-2', name: 'Rotor Replacement', estimatedTime: 90, price: 200 }
        ]
      }
    ]
  },
  {
    id: '3',
    name: 'Tires & Wheels',
    description: 'Tire and wheel services',
    position: 3,
    subcategories: [
      {
        id: '3-1',
        name: 'Tire Installation',
        jobs: [
          { id: '3-1-1', name: 'Tire Mount & Balance', estimatedTime: 60, price: 80 },
          { id: '3-1-2', name: 'Tire Rotation', estimatedTime: 30, price: 25 }
        ]
      }
    ]
  },
  {
    id: '4',
    name: 'Engine Services',
    description: 'Engine repair and maintenance',
    position: 4,
    subcategories: [
      {
        id: '4-1',
        name: 'Engine Repair',
        jobs: [
          { id: '4-1-1', name: 'Timing Belt Replacement', estimatedTime: 240, price: 450 },
          { id: '4-1-2', name: 'Spark Plug Replacement', estimatedTime: 60, price: 120 }
        ]
      },
      {
        id: '4-2',
        name: 'Belts & Cooling System',
        description: 'Belt services and cooling system maintenance',
        jobs: [
          { id: '4-2-1', name: 'Serpentine Belt Replacement', description: 'R&R serpentine belt replacement service', estimatedTime: 45, price: 85 },
          { id: '4-2-2', name: 'Serpentine Belt Adjustment', description: 'Adjust serpentine belt tension', estimatedTime: 20, price: 35 },
          { id: '4-2-3', name: 'Serpentine Belt Inspection', description: 'Inspect serpentine belt condition', estimatedTime: 15, price: 25 },
          { id: '4-2-4', name: 'Belt Tensioner Replacement', description: 'Replace serpentine belt tensioner', estimatedTime: 60, price: 120 },
          { id: '4-2-5', name: 'Drive Belt Replacement', description: 'Replace accessory drive belt', estimatedTime: 40, price: 75 },
          { id: '4-2-6', name: 'V-Belt Replacement', description: 'Replace V-belt', estimatedTime: 35, price: 65 }
        ]
      }
    ]
  },
  {
    id: '5',
    name: 'Transmission',
    description: 'Transmission services and repair',
    position: 5,
    subcategories: [
      {
        id: '5-1',
        name: 'Transmission Service',
        jobs: [
          { id: '5-1-1', name: 'Transmission Fluid Change', estimatedTime: 60, price: 120 },
          { id: '5-1-2', name: 'Transmission Repair', estimatedTime: 480, price: 1200 }
        ]
      }
    ]
  }
];

// Enhanced search synonyms for better automotive repair terminology recognition
export const serviceSearchSynonyms: Record<string, string[]> = {
  'brake line': ['brake hose', 'hydraulic line', 'brake tubing', 'fluid line', 'brake pipe'],
  'brake fluid': ['hydraulic fluid', 'brake oil'],
  'brake pad': ['brake shoe', 'friction pad'],
  'brake rotor': ['brake disc', 'rotor disc'],
  'oil change': ['lube service', 'oil service'],
  'tire': ['wheel', 'rim'],
  'transmission': ['trans', 'gearbox'],
  'serpentine belt': ['drive belt', 'accessory belt', 'belt', 'serpentine', 'fan belt'],
  'belt': ['serpentine belt', 'drive belt', 'accessory belt', 'v-belt', 'fan belt'],
  'replace': ['replacement', 'r&r', 'r & r', 'install', 'change', 'swap'],
  'replacement': ['replace', 'r&r', 'r & r', 'install', 'change', 'swap'],
  'r&r': ['replace', 'replacement', 'remove and replace', 'install', 'change'],
  'r & r': ['replace', 'replacement', 'remove and replace', 'install', 'change'],
  'service': ['repair', 'maintenance', 'check', 'inspect'],
  'repair': ['service', 'fix', 'maintenance'],
  'inspection': ['inspect', 'check', 'examine', 'test'],
  'tensioner': ['belt tensioner', 'serpentine tensioner', 'drive belt tensioner']
};

