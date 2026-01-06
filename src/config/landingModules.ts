import { LucideIcon } from 'lucide-react';
import {
  Anchor,
  Axe,
  Bike,
  Bird,
  Bug,
  Car,
  Cat,
  Cog,
  Compass,
  Dog,
  Droplets,
  Fish,
  Flame,
  Hammer,
  HardHat,
  Home,
  KeyRound,
  Mountain,
  PaintBucket,
  Palette,
  PawPrint,
  Power,
  Rat,
  Refrigerator,
  Sparkles,
  Target,
  Tent,
  Thermometer,
  Tractor,
  Trees,
  Truck,
  Waves,
  Wrench,
  Zap,
} from 'lucide-react';

export type LandingModule = {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  price?: string;
  available: boolean;
  coreFeatures: string[];
  extraFeatures: string[];
};

export type LandingComingSoonModule = {
  name: string;
  description: string;
  icon: LucideIcon;
};

export type LandingComingSoonCategory = {
  category: string;
  description: string;
  modules: LandingComingSoonModule[];
};

export const LANDING_MODULES: LandingModule[] = [
  {
    slug: 'repair-shop',
    name: 'Repair Shop',
    description: 'Complete automotive service management with work orders, parts, and more',
    icon: Car,
    color: 'bg-blue-500',
    price: '$49/mo',
    available: true,
    coreFeatures: [
      'Work orders with labor and parts',
      'Customer and vehicle history',
      'Estimates, invoices, and payments',
      'Scheduling and technician assignments',
    ],
    extraFeatures: [
      'Inventory forecasting and reorder alerts',
      'Digital inspection forms',
      'Service packages and pricing rules',
    ],
  },
  {
    slug: 'power-washing',
    name: 'Power Washing',
    description: 'Manage residential and commercial pressure washing jobs',
    icon: Droplets,
    color: 'bg-cyan-500',
    price: '$39/mo',
    available: true,
    coreFeatures: [
      'Job estimates and dispatch',
      'Route planning and scheduling',
      'Recurring services and subscriptions',
      'Photo capture and before/after',
    ],
    extraFeatures: [
      'Chemical mix calculators',
      'Weather-aware scheduling',
      'Customer portal for approvals',
    ],
  },
  {
    slug: 'gunsmith',
    name: 'Gunsmith',
    description: 'Firearm repair, maintenance tracking, and FFL compliance',
    icon: Target,
    color: 'bg-amber-500',
    price: '$49/mo',
    available: true,
    coreFeatures: [
      'Firearm intake and work orders',
      'Compliance tracking and transfers',
      'Parts inventory and serialized items',
      'Quotes, invoices, and payments',
    ],
    extraFeatures: [
      'License expiration alerts',
      'Consignment tracking',
      'Appointment scheduling',
    ],
  },
  {
    slug: 'marine-services',
    name: 'Marine Services',
    description: 'Boat repair, maintenance, and marina service management',
    icon: Anchor,
    color: 'bg-teal-500',
    price: '$49/mo',
    available: true,
    coreFeatures: [
      'Vessel profiles and history',
      'Job tracking with parts and labor',
      'Scheduling and dock planning',
      'Quotes, invoices, and payments',
    ],
    extraFeatures: [
      'Seasonal maintenance reminders',
      'Warranty and inspection tracking',
      'Service checklists for crews',
    ],
  },
  {
    slug: 'tattoo-shop',
    name: 'Tattoo Shop',
    description: 'Appointment booking, client portfolios, and consent management',
    icon: Palette,
    color: 'bg-purple-500',
    price: '$39/mo',
    available: true,
    coreFeatures: [
      'Appointment scheduling and deposits',
      'Client profiles and notes',
      'Consent forms and waivers',
      'Invoice and payment tracking',
    ],
    extraFeatures: [
      'Portfolio galleries',
      'Artist availability management',
      'Automated follow-ups',
    ],
  },
];

export const LANDING_COMING_SOON_CATEGORIES: LandingComingSoonCategory[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // HOME & PROPERTY SERVICES
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'Home & Property Services',
    description: 'Residential and commercial property maintenance',
    modules: [
      {
        name: 'HVAC Services',
        description: 'Heating, cooling, and ventilation with EPA 608 compliance',
        icon: Thermometer,
      },
      {
        name: 'Pool & Spa Services',
        description: 'Chemical tracking, water testing, and route management',
        icon: Waves,
      },
      {
        name: 'Plumbing Services',
        description: 'Residential and commercial plumbing with parts inventory',
        icon: Wrench,
      },
      {
        name: 'Electrical Services',
        description: 'Electrical contracting with permit and inspection tracking',
        icon: Zap,
      },
      {
        name: 'Roofing',
        description: 'Roof inspections, repairs, and project management',
        icon: HardHat,
      },
      {
        name: 'Painting Services',
        description: 'Interior/exterior painting with estimating and crew dispatch',
        icon: PaintBucket,
      },
      {
        name: 'Handyman Services',
        description: 'Multi-trade repairs with flexible pricing and scheduling',
        icon: Hammer,
      },
      {
        name: 'Fencing',
        description: 'Fence installation, repair, and material estimating',
        icon: Home,
      },
      {
        name: 'Landscaping',
        description: 'Lawn care, design, irrigation, and crew scheduling',
        icon: Trees,
      },
      {
        name: 'Pest Control',
        description: 'Route optimization, chemical compliance, and treatment plans',
        icon: Bug,
      },
      {
        name: 'Septic Services',
        description: 'Pumping schedules, inspections, and compliance tracking',
        icon: Droplets,
      },
      {
        name: 'Window Cleaning',
        description: 'Commercial and residential window and gutter cleaning',
        icon: Sparkles,
      },
      {
        name: 'Garage Door Services',
        description: 'Installation, repair, and opener programming',
        icon: Cog,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // AUTOMOTIVE & EQUIPMENT
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'Automotive & Equipment',
    description: 'Vehicle and machinery service specialists',
    modules: [
      {
        name: 'Auto Detailing',
        description: 'Mobile and shop-based detailing with photo documentation',
        icon: Sparkles,
      },
      {
        name: 'Towing Services',
        description: 'Dispatch management, fleet tracking, and impound operations',
        icon: Truck,
      },
      {
        name: 'Motorcycle Services',
        description: 'Motorcycle and powersports repair with parts tracking',
        icon: Bike,
      },
      {
        name: 'RV & Camper Services',
        description: 'Mobile and shop-based RV repair and winterization',
        icon: Truck,
      },
      {
        name: 'Golf Cart Repair',
        description: 'Electric and gas cart service for courses and communities',
        icon: Car,
      },
      {
        name: 'Small Engine Repair',
        description: 'Mower, chainsaw, and outdoor power equipment service',
        icon: Cog,
      },
      {
        name: 'Heavy Equipment',
        description: 'Construction and agricultural equipment maintenance',
        icon: Tractor,
      },
      {
        name: 'Generator Services',
        description: 'Standby generator installation, service, and monitoring',
        icon: Power,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SKILLED TRADES
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'Skilled Trades',
    description: 'Specialized craftsmanship and technical services',
    modules: [
      {
        name: 'Welding & Fabrication',
        description: 'Metal fabrication, repairs, and certification tracking',
        icon: Flame,
      },
      {
        name: 'Locksmith',
        description: 'Emergency dispatch, key cutting logs, and mobile service',
        icon: KeyRound,
      },
      {
        name: 'Appliance Repair',
        description: 'In-home service with parts tracking and warranty management',
        icon: Refrigerator,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // OUTDOOR & WILDLIFE
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'Outdoor & Wildlife',
    description: 'Hunting, trapping, and wildlife industry services',
    modules: [
      {
        name: 'Guide & Outfitter',
        description: 'Trip booking, client management, and license tracking',
        icon: Compass,
      },
      {
        name: 'Taxidermy',
        description: 'Specimen intake, project tracking, and client galleries',
        icon: Bird,
      },
      {
        name: 'Tannery',
        description: 'Hide processing, inventory, and order management',
        icon: PawPrint,
      },
      {
        name: 'Trapping Services',
        description: 'Trapline management, fur tracking, and harvest records',
        icon: Rat,
      },
      {
        name: 'Hunting Preserve',
        description: 'Booking, game management, and membership tracking',
        icon: Target,
      },
      {
        name: 'Fishing Charter',
        description: 'Trip scheduling, equipment tracking, and catch logs',
        icon: Fish,
      },
      {
        name: 'Camping & Outpost',
        description: 'Cabin rentals, equipment checkout, and guest management',
        icon: Tent,
      },
      {
        name: 'Wildlife Control',
        description: 'Nuisance animal removal, permits, and compliance',
        icon: Bug,
      },
      {
        name: 'Forestry Services',
        description: 'Timber management, logging, and land clearing',
        icon: Axe,
      },
      {
        name: 'Hunting Dog Training',
        description: 'Training programs, boarding, and progress tracking',
        icon: Dog,
      },
      {
        name: 'Wilderness Survival',
        description: 'Course scheduling, certifications, and equipment rentals',
        icon: Mountain,
      },
    ],
  },
];

// Flat list for backward compatibility
export const LANDING_COMING_SOON: LandingComingSoonModule[] = 
  LANDING_COMING_SOON_CATEGORIES.flatMap(cat => cat.modules);
