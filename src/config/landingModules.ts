import { LucideIcon } from 'lucide-react';
import {
  Anchor,
  Car,
  Droplets,
  Flame,
  Home,
  Palette,
  Scissors,
  Sparkles,
  Target,
  TreePine,
  Trees,
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
  {
    name: 'Housekeeping',
    description: 'Residential and commercial cleaning service management',
    icon: Home,
  },
  {
    name: 'Carpet Cleaning',
    description: 'Professional carpet and upholstery care scheduling',
    icon: Sparkles,
  },
  {
    name: 'Firewood',
    description: 'Firewood sales, delivery, and inventory tracking',
    icon: TreePine,
  },
  {
    name: 'Seamstress',
    description: 'Alterations, repairs, and custom clothing orders',
    icon: Scissors,
  },
  {
    name: 'Welding',
    description: 'Metal fabrication and repair service management',
    icon: Flame,
  },
  {
    name: 'Landscaping',
    description: 'Lawn care, design, and maintenance scheduling',
    icon: Trees,
  },
];
