import { LucideIcon } from 'lucide-react';
import {
  Anchor,
  Bike,
  Bug,
  Car,
  Cog,
  Droplets,
  Flame,
  Hammer,
  HardHat,
  Home,
  KeyRound,
  PaintBucket,
  Palette,
  Power,
  Refrigerator,
  Sparkles,
  Target,
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

export const LANDING_COMING_SOON: LandingComingSoonModule[] = [
  // ═══════════════════════════════════════════════
  // TIER 1: HIGHEST PRIORITY (Architecture Ready)
  // ═══════════════════════════════════════════════
  {
    name: 'HVAC Services',
    description: 'Heating, cooling, and ventilation with EPA 608 compliance tracking',
    icon: Thermometer,
  },
  {
    name: 'Pool & Spa Services',
    description: 'Chemical tracking, water testing logs, and route management',
    icon: Waves,
  },
  {
    name: 'Appliance Repair',
    description: 'In-home service with parts tracking and warranty management',
    icon: Refrigerator,
  },
  {
    name: 'Auto Detailing',
    description: 'Mobile and shop-based detailing with photo documentation',
    icon: Sparkles,
  },

  // ═══════════════════════════════════════════════
  // TIER 2: HIGH VALUE (Growing Markets)
  // ═══════════════════════════════════════════════
  {
    name: 'Pest Control',
    description: 'Route optimization, chemical compliance, and treatment plans',
    icon: Bug,
  },
  {
    name: 'Locksmith',
    description: 'Emergency dispatch, key cutting logs, and mobile service',
    icon: KeyRound,
  },
  {
    name: 'Small Engine Repair',
    description: 'Mower, chainsaw, and outdoor power equipment service',
    icon: Cog,
  },
  {
    name: 'Towing Services',
    description: 'Dispatch management, fleet tracking, and impound operations',
    icon: Truck,
  },

  // ═══════════════════════════════════════════════
  // TIER 3: NATURAL EXTENSIONS (Industry Synergies)
  // ═══════════════════════════════════════════════
  {
    name: 'Landscaping',
    description: 'Lawn care, design, irrigation, and crew scheduling',
    icon: Trees,
  },
  {
    name: 'Welding & Fabrication',
    description: 'Metal fabrication, repairs, and certification tracking',
    icon: Flame,
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

  // ═══════════════════════════════════════════════
  // TIER 4: NICHE/SPECIALTY (High-Value Verticals)
  // ═══════════════════════════════════════════════
  {
    name: 'Golf Cart Repair',
    description: 'Electric and gas cart service for courses and communities',
    icon: Car,
  },
  {
    name: 'RV & Camper Services',
    description: 'Mobile and shop-based RV repair and winterization',
    icon: Truck,
  },
  {
    name: 'Motorcycle Services',
    description: 'Motorcycle and powersports repair with parts tracking',
    icon: Bike,
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
  {
    name: 'Septic Services',
    description: 'Pumping schedules, inspections, and compliance tracking',
    icon: Droplets,
  },
  {
    name: 'Window Cleaning',
    description: 'Commercial and residential window and gutter cleaning',
    icon: Home,
  },
  {
    name: 'Garage Door Services',
    description: 'Installation, repair, and opener programming',
    icon: Cog,
  },
];
