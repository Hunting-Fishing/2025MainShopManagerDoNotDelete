import { LucideIcon } from 'lucide-react';
import {
  Anchor,
  Apple,
  Axe,
  Baby,
  Beef,
  Bike,
  Bird,
  Bone,
  BookOpen,
  Briefcase,
  Bug,
  Cake,
  Camera,
  Car,
  Cat,
  ChefHat,
  Church,
  Cigarette,
  CircleDot,
  Clover,
  Cog,
  Coffee,
  Compass,
  Cookie,
  Crown,
  Dice1,
  Dog,
  Dumbbell,
  Droplets,
  Feather,
  Fish,
  Flame,
  Flower2,
  Footprints,
  Gem,
  Gift,
  Grape,
  Guitar,
  Hammer,
  HandHeart,
  HardHat,
  HeartPulse,
  Home,
  IceCream,
  KeyRound,
  Leaf,
  Mic2,
  Mountain,
  Move,
  Music,
  PaintBucket,
  Palette,
  PartyPopper,
  PawPrint,
  Pen,
  Phone,
  Pizza,
  Plane,
  Power,
  Printer,
  Rat,
  Refrigerator,
  Ruler,
  Salad,
  Scale,
  Scissors,
  Shield,
  Shirt,
  ShoppingBag,
  Shovel,
  Snowflake,
  Sofa,
  Sparkles,
  Speaker,
  Sprout,
  Stethoscope,
  Store,
  Sun,
  Sword,
  Syringe,
  Target,
  Tent,
  Thermometer,
  Ticket,
  Tractor,
  Trees,
  Truck,
  Tv,
  Umbrella,
  Users,
  Utensils,
  Wallet,
  Waves,
  Wheat,
  Wine,
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
  // HOME & PROPERTY SERVICES (15 modules)
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'Home & Property Services',
    description: 'Residential and commercial property maintenance',
    modules: [
      { name: 'HVAC Services', description: 'Heating, cooling, and ventilation with EPA 608 compliance', icon: Thermometer },
      { name: 'Pool & Spa Services', description: 'Chemical tracking, water testing, and route management', icon: Waves },
      { name: 'Plumbing Services', description: 'Residential and commercial plumbing with parts inventory', icon: Wrench },
      { name: 'Electrical Services', description: 'Electrical contracting with permit and inspection tracking', icon: Zap },
      { name: 'Roofing', description: 'Roof inspections, repairs, and project management', icon: HardHat },
      { name: 'Painting Services', description: 'Interior/exterior painting with estimating and crew dispatch', icon: PaintBucket },
      { name: 'Handyman Services', description: 'Multi-trade repairs with flexible pricing and scheduling', icon: Hammer },
      { name: 'Fencing', description: 'Fence installation, repair, and material estimating', icon: Home },
      { name: 'Landscaping', description: 'Lawn care, design, irrigation, and crew scheduling', icon: Trees },
      { name: 'Pest Control', description: 'Route optimization, chemical compliance, and treatment plans', icon: Bug },
      { name: 'Septic Services', description: 'Pumping schedules, inspections, and compliance tracking', icon: Droplets },
      { name: 'Window Cleaning', description: 'Commercial and residential window and gutter cleaning', icon: Sparkles },
      { name: 'Garage Door Services', description: 'Installation, repair, and opener programming', icon: Cog },
      { name: 'Chimney Services', description: 'Cleaning, inspection, and masonry repair', icon: Flame },
      { name: 'Disaster Restoration', description: 'Water, fire, and mold damage remediation', icon: Shield },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // AUTOMOTIVE & EQUIPMENT (12 modules)
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'Automotive & Equipment',
    description: 'Vehicle and machinery service specialists',
    modules: [
      { name: 'Auto Detailing', description: 'Mobile and shop-based detailing with photo documentation', icon: Sparkles },
      { name: 'Towing Services', description: 'Dispatch management, fleet tracking, and impound operations', icon: Truck },
      { name: 'Motorcycle Services', description: 'Motorcycle and powersports repair with parts tracking', icon: Bike },
      { name: 'RV & Camper Services', description: 'Mobile and shop-based RV repair and winterization', icon: Truck },
      { name: 'Golf Cart Repair', description: 'Electric and gas cart service for courses and communities', icon: CircleDot },
      { name: 'Small Engine Repair', description: 'Mower, chainsaw, and outdoor power equipment service', icon: Cog },
      { name: 'Heavy Equipment', description: 'Construction and agricultural equipment maintenance', icon: Tractor },
      { name: 'Generator Services', description: 'Standby generator installation, service, and monitoring', icon: Power },
      { name: 'ATV/UTV Repair', description: 'Off-road vehicle service and parts management', icon: Car },
      { name: 'Snowmobile Services', description: 'Winter vehicle repair and seasonal maintenance', icon: Snowflake },
      { name: 'Bicycle Shop', description: 'Bike sales, repair, and custom builds', icon: Bike },
      { name: 'Classic Car Restoration', description: 'Vintage vehicle restoration and documentation', icon: Car },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SKILLED TRADES (8 modules)
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'Skilled Trades',
    description: 'Specialized craftsmanship and technical services',
    modules: [
      { name: 'Welding & Fabrication', description: 'Metal fabrication, repairs, and certification tracking', icon: Flame },
      { name: 'Locksmith', description: 'Emergency dispatch, key cutting logs, and mobile service', icon: KeyRound },
      { name: 'Appliance Repair', description: 'In-home service with parts tracking and warranty management', icon: Refrigerator },
      { name: 'Upholstery', description: 'Furniture and vehicle upholstery repair and restoration', icon: Sofa },
      { name: 'Glass & Mirror', description: 'Residential and auto glass installation and repair', icon: Sparkles },
      { name: 'Safe & Vault', description: 'Safe installation, moving, and combination changes', icon: Shield },
      { name: 'Clock Repair', description: 'Antique and modern clock restoration and service', icon: Cog },
      { name: 'Instrument Repair', description: 'Musical instrument repair and restoration', icon: Music },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // OUTDOOR & WILDLIFE (11 modules)
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'Outdoor & Wildlife',
    description: 'Hunting, trapping, and wildlife industry services',
    modules: [
      { name: 'Guide & Outfitter', description: 'Trip booking, client management, and license tracking', icon: Compass },
      { name: 'Taxidermy', description: 'Specimen intake, project tracking, and client galleries', icon: Bird },
      { name: 'Tannery', description: 'Hide processing, inventory, and order management', icon: PawPrint },
      { name: 'Trapping Services', description: 'Trapline management, fur tracking, and harvest records', icon: Rat },
      { name: 'Hunting Preserve', description: 'Booking, game management, and membership tracking', icon: Target },
      { name: 'Fishing Charter', description: 'Trip scheduling, equipment tracking, and catch logs', icon: Fish },
      { name: 'Camping & Outpost', description: 'Cabin rentals, equipment checkout, and guest management', icon: Tent },
      { name: 'Wildlife Control', description: 'Nuisance animal removal, permits, and compliance', icon: Bug },
      { name: 'Forestry Services', description: 'Timber management, logging, and land clearing', icon: Axe },
      { name: 'Hunting Dog Training', description: 'Training programs, boarding, and progress tracking', icon: Dog },
      { name: 'Wilderness Survival', description: 'Course scheduling, certifications, and equipment rentals', icon: Mountain },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // AGRICULTURE & FARMING (12 modules)
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'Agriculture & Farming',
    description: 'Farm operations, growing, and agricultural services',
    modules: [
      { name: 'Farm Operations', description: 'Crop planning, equipment tracking, and harvest management', icon: Wheat },
      { name: 'Greenhouse Management', description: 'Climate control, inventory, and growing schedules', icon: Sprout },
      { name: 'Gardening Services', description: 'Residential garden design, planting, and maintenance', icon: Flower2 },
      { name: 'Nursery & Plant Sales', description: 'Plant inventory, orders, and customer management', icon: Leaf },
      { name: 'Beekeeping & Apiary', description: 'Hive management, honey production, and pollination services', icon: Bug },
      { name: 'Hydroponics', description: 'Indoor growing systems, nutrient tracking, and harvests', icon: Droplets },
      { name: 'Mushroom Farming', description: 'Cultivation cycles, substrate tracking, and sales', icon: Clover },
      { name: 'Christmas Tree Farm', description: 'Tree inventory, lot sales, and seasonal operations', icon: Trees },
      { name: 'Vineyard & Winery', description: 'Grape production, wine making, and tasting room management', icon: Grape },
      { name: 'Orchard Management', description: 'Fruit tree care, harvest tracking, and sales', icon: Apple },
      { name: 'Hay & Feed Services', description: 'Hay production, delivery scheduling, and inventory', icon: Wheat },
      { name: 'Farm Equipment Rental', description: 'Equipment booking, maintenance, and billing', icon: Tractor },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // FOOD & BEVERAGE (12 modules)
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'Food & Beverage',
    description: 'Food production, service, and specialty operations',
    modules: [
      { name: 'Bakery', description: 'Order management, recipe tracking, and production scheduling', icon: Cake },
      { name: 'Food Truck', description: 'Location scheduling, menu management, and mobile POS', icon: Truck },
      { name: 'Catering Services', description: 'Event booking, menu planning, and staff coordination', icon: Utensils },
      { name: 'Coffee Roastery', description: 'Roast profiles, inventory, and wholesale management', icon: Coffee },
      { name: 'Butcher Shop', description: 'Meat processing, custom cuts, and order tracking', icon: Beef },
      { name: 'Cheese Making', description: 'Aging schedules, batch tracking, and sales', icon: Cookie },
      { name: 'Brewery & Distillery', description: 'Batch tracking, TTB compliance, and taproom management', icon: Wine },
      { name: 'Meal Prep Service', description: 'Subscription management, menu planning, and delivery', icon: Salad },
      { name: 'Ice Cream & Gelato', description: 'Flavor inventory, production batches, and seasonal menus', icon: IceCream },
      { name: 'Specialty Foods', description: 'Artisan product inventory and wholesale distribution', icon: ChefHat },
      { name: 'Pizza Shop', description: 'Order management, delivery tracking, and recipe costing', icon: Pizza },
      { name: 'Juice Bar & Smoothies', description: 'Ingredient inventory, recipe management, and POS', icon: Apple },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // PET & ANIMAL SERVICES (10 modules)
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'Pet & Animal Services',
    description: 'Pet care, training, and animal-related businesses',
    modules: [
      { name: 'Pet Grooming', description: 'Appointment scheduling, breed profiles, and grooming notes', icon: PawPrint },
      { name: 'Pet Boarding & Kennel', description: 'Reservation management, feeding schedules, and health tracking', icon: Dog },
      { name: 'Veterinary Clinic', description: 'Patient records, appointments, and prescription tracking', icon: Stethoscope },
      { name: 'Pet Training', description: 'Class scheduling, progress tracking, and certifications', icon: PawPrint },
      { name: 'Pet Sitting & Walking', description: 'Visit scheduling, GPS tracking, and client updates', icon: Footprints },
      { name: 'Aquarium Services', description: 'Tank maintenance, water testing, and livestock inventory', icon: Fish },
      { name: 'Horse Boarding & Training', description: 'Stall management, training programs, and billing', icon: PawPrint },
      { name: 'Farrier Services', description: 'Shoeing schedules, client tracking, and inventory', icon: Hammer },
      { name: 'Pet Photography', description: 'Session booking, gallery delivery, and print orders', icon: Camera },
      { name: 'Animal Rescue & Shelter', description: 'Intake, adoption, and foster management', icon: HandHeart },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // HEALTH & WELLNESS (14 modules)
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'Health & Wellness',
    description: 'Healthcare, therapy, and wellness practitioners',
    modules: [
      { name: 'Massage Therapy', description: 'Appointment booking, SOAP notes, and package sales', icon: HandHeart },
      { name: 'Chiropractic', description: 'Patient management, treatment plans, and billing', icon: HeartPulse },
      { name: 'Physical Therapy', description: 'Exercise programs, progress tracking, and insurance billing', icon: Dumbbell },
      { name: 'Acupuncture', description: 'Treatment protocols, patient history, and scheduling', icon: Syringe },
      { name: 'Yoga & Pilates Studio', description: 'Class scheduling, memberships, and instructor management', icon: Sun },
      { name: 'Personal Training', description: 'Client programs, session tracking, and progress photos', icon: Dumbbell },
      { name: 'Nutrition Coaching', description: 'Meal plans, client tracking, and supplement sales', icon: Salad },
      { name: 'Med Spa', description: 'Treatment scheduling, consent forms, and product sales', icon: Sparkles },
      { name: 'Dental Practice', description: 'Patient scheduling, treatment plans, and insurance', icon: Stethoscope },
      { name: 'Optometry', description: 'Eye exams, prescription tracking, and frame inventory', icon: CircleDot },
      { name: 'Wellness Coaching', description: 'Goal tracking, habit monitoring, check-ins, and program sales', icon: HeartPulse },
      { name: 'Breathwork & Meditation', description: 'Class scheduling, retreat booking, and practitioner management', icon: Sun },
      { name: 'Functional Medicine', description: 'Advanced lab tracking, root cause protocols, and supplement stacks', icon: Stethoscope },
      { name: 'Float Therapy & Sensory', description: 'Pod booking, water quality logs, and membership management', icon: Waves },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // HOLISTIC & ALTERNATIVE MEDICINE (12 modules)
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'Holistic & Alternative Medicine',
    description: 'Natural healing, energy work, and alternative therapies',
    modules: [
      { name: 'Essential Oils & Aromatherapy', description: 'Product inventory, custom blends, client profiles, and education tracking', icon: Droplets },
      { name: 'Holistic Medicine Practice', description: 'Patient intake, treatment protocols, remedy tracking, and HIPAA-compliant notes', icon: Leaf },
      { name: 'Naturopathic Clinic', description: 'Patient management, lab ordering, supplement dispensary, and treatment plans', icon: Sprout },
      { name: 'Herbalism & Botanical', description: 'Herb inventory, tincture batching, client consultations, and compliance', icon: Leaf },
      { name: 'Reiki & Energy Healing', description: 'Session booking, client notes, practitioner scheduling, and certifications', icon: Sun },
      { name: 'Homeopathy Practice', description: 'Remedy inventory, case management, potency tracking, and follow-ups', icon: Droplets },
      { name: 'Ayurvedic Services', description: 'Dosha assessments, treatment protocols, product sales, and meal planning', icon: Flower2 },
      { name: 'Crystal Healing & Metaphysical', description: 'Inventory management, session booking, and product sales', icon: Gem },
      { name: 'Sound & Vibrational Therapy', description: 'Session scheduling, instrument inventory, and treatment protocols', icon: Music },
      { name: 'Hypnotherapy', description: 'Client intake, session notes, program tracking, and recordings', icon: CircleDot },
      { name: 'Reflexology', description: 'Appointment booking, foot maps, treatment notes, and package sales', icon: Footprints },
      { name: 'Craniosacral Therapy', description: 'Session booking, treatment history, and practitioner notes', icon: HandHeart },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CREATIVE & ARTISAN (12 modules)
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'Creative & Artisan',
    description: 'Handcrafted goods and creative service businesses',
    modules: [
      { name: 'Photography Studio', description: 'Session booking, gallery proofing, and print fulfillment', icon: Camera },
      { name: 'Jewelry Making', description: 'Custom orders, gemstone inventory, and repair tracking', icon: Gem },
      { name: 'Custom Furniture', description: 'Project quotes, material tracking, and delivery scheduling', icon: Sofa },
      { name: 'Pottery & Ceramics', description: 'Class scheduling, kiln bookings, and inventory', icon: Palette },
      { name: 'Leatherwork', description: 'Custom orders, material inventory, and pattern library', icon: Briefcase },
      { name: 'Candle Making', description: 'Batch tracking, fragrance inventory, and wholesale orders', icon: Flame },
      { name: 'Soap & Cosmetics', description: 'Recipe management, batch tracking, and compliance', icon: Sparkles },
      { name: 'Screen Printing', description: 'Order management, screen inventory, and production queue', icon: Shirt },
      { name: 'Embroidery & Monogramming', description: 'Design library, order tracking, and machine scheduling', icon: Scissors },
      { name: 'Sign Making', description: 'Custom quotes, material tracking, and installation scheduling', icon: Pen },
      { name: 'Herbal Product Making', description: 'Salve batches, ingredient sourcing, and labeling compliance', icon: Leaf },
      { name: 'Incense & Smudge Crafting', description: 'Batch tracking, ingredient inventory, and wholesale orders', icon: Flame },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // EVENTS & ENTERTAINMENT (10 modules)
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'Events & Entertainment',
    description: 'Event planning, entertainment, and party services',
    modules: [
      { name: 'DJ Services', description: 'Booking, music library, and equipment tracking', icon: Music },
      { name: 'Wedding Planning', description: 'Vendor coordination, timeline management, and budgets', icon: Crown },
      { name: 'Party Rentals', description: 'Inventory management, delivery scheduling, and damage tracking', icon: PartyPopper },
      { name: 'Photo Booth', description: 'Event booking, prop inventory, and print packages', icon: Camera },
      { name: 'Live Entertainment', description: 'Artist booking, contracts, and performance scheduling', icon: Mic2 },
      { name: 'Sound & Lighting Rental', description: 'Equipment inventory, crew scheduling, and setup plans', icon: Speaker },
      { name: 'Bounce House Rental', description: 'Inventory, delivery routes, and safety checklists', icon: Baby },
      { name: 'Balloon & Decor', description: 'Order management, design mockups, and delivery', icon: Gift },
      { name: 'Videography', description: 'Project booking, editing workflow, and delivery', icon: Tv },
      { name: 'Event Venue', description: 'Space booking, catering coordination, and staff scheduling', icon: Home },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLEANING & MOVING (8 modules)
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'Cleaning & Moving',
    description: 'Residential and commercial cleaning and relocation',
    modules: [
      { name: 'Housekeeping', description: 'Recurring schedules, team dispatch, and supply tracking', icon: Home },
      { name: 'Carpet Cleaning', description: 'Job scheduling, equipment tracking, and chemical logs', icon: Sparkles },
      { name: 'Junk Removal', description: 'Pickup scheduling, load pricing, and disposal tracking', icon: Truck },
      { name: 'Moving Services', description: 'Quote estimation, crew scheduling, and inventory lists', icon: Move },
      { name: 'Storage Facility', description: 'Unit management, access logs, and billing', icon: Home },
      { name: 'Mold Remediation', description: 'Testing, treatment protocols, and compliance documentation', icon: Shield },
      { name: 'Biohazard Cleanup', description: 'Safety protocols, disposal tracking, and certification', icon: Shield },
      { name: 'Laundry & Dry Cleaning', description: 'Order tracking, garment tagging, and delivery routes', icon: Shirt },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SPECIALTY RETAIL (8 modules)
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'Specialty Retail',
    description: 'Niche retail and resale businesses',
    modules: [
      { name: 'Antique Shop', description: 'Inventory with provenance, consignment, and appraisals', icon: Crown },
      { name: 'Pawn Shop', description: 'Loan tracking, inventory, and compliance reporting', icon: Scale },
      { name: 'Consignment Store', description: 'Consignor accounts, sales tracking, and payouts', icon: ShoppingBag },
      { name: 'Vape & Smoke Shop', description: 'Age verification, inventory, and compliance', icon: Cigarette },
      { name: 'Florist', description: 'Arrangement orders, delivery scheduling, and inventory', icon: Flower2 },
      { name: 'Gift Shop', description: 'Inventory, seasonal planning, and wholesale orders', icon: Gift },
      { name: 'Comic & Card Shop', description: 'Grading, collection management, and event scheduling', icon: Dice1 },
      { name: 'Music Store', description: 'Instrument inventory, rentals, and lesson scheduling', icon: Guitar },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // PROFESSIONAL SERVICES (8 modules)
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'Professional Services',
    description: 'Business, legal, and consulting services',
    modules: [
      { name: 'Notary Services', description: 'Appointment scheduling, document tracking, and mobile notary', icon: Pen },
      { name: 'Tax Preparation', description: 'Client management, document collection, and e-filing', icon: Wallet },
      { name: 'Bookkeeping', description: 'Client accounts, transaction categorization, and reporting', icon: BookOpen },
      { name: 'IT Services', description: 'Ticket management, asset tracking, and remote support', icon: Cog },
      { name: 'Tutoring Services', description: 'Session scheduling, progress tracking, and billing', icon: BookOpen },
      { name: 'Translation Services', description: 'Project management, linguist assignment, and delivery', icon: Feather },
      { name: 'Printing Services', description: 'Order management, proofing workflow, and production queue', icon: Printer },
      { name: 'Courier & Delivery', description: 'Route optimization, tracking, and proof of delivery', icon: Truck },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // RECREATION & FITNESS (8 modules)
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'Recreation & Fitness',
    description: 'Sports, fitness, and entertainment venues',
    modules: [
      { name: 'Gym & Fitness Center', description: 'Membership management, class scheduling, and equipment maintenance', icon: Dumbbell },
      { name: 'Martial Arts Studio', description: 'Belt tracking, class management, and tournament registration', icon: Sword },
      { name: 'Dance Studio', description: 'Class scheduling, recital planning, and costume tracking', icon: Music },
      { name: 'Shooting Range', description: 'Lane booking, membership, and safety certifications', icon: Target },
      { name: 'Escape Room', description: 'Booking management, game scheduling, and team tracking', icon: KeyRound },
      { name: 'Bowling Alley', description: 'Lane reservations, league management, and POS', icon: CircleDot },
      { name: 'Mini Golf', description: 'Tee time booking, party packages, and maintenance', icon: CircleDot },
      { name: 'Go-Kart Track', description: 'Session booking, safety waivers, and race timing', icon: Car },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // PERSONAL SERVICES (8 modules)
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'Personal Services',
    description: 'Individual care and specialty personal services',
    modules: [
      { name: 'Barber Shop', description: 'Appointment booking, walk-ins, and loyalty programs', icon: Scissors },
      { name: 'Nail Salon', description: 'Service scheduling, artist assignments, and retail sales', icon: Sparkles },
      { name: 'Seamstress & Alterations', description: 'Measurement tracking, order management, and fittings', icon: Scissors },
      { name: 'Shoe Repair', description: 'Repair tickets, material inventory, and pickup alerts', icon: Footprints },
      { name: 'Watch Repair', description: 'Service tickets, parts tracking, and authentication', icon: Cog },
      { name: 'Phone Repair', description: 'Intake, parts inventory, and warranty tracking', icon: Phone },
      { name: 'Computer Repair', description: 'Ticket management, diagnostics, and parts ordering', icon: Cog },
      { name: 'Funeral Services', description: 'Arrangement planning, scheduling, and family coordination', icon: Church },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // TRAVEL & TOURISM (6 modules)
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'Travel & Tourism',
    description: 'Travel, hospitality, and tourism businesses',
    modules: [
      { name: 'Tour Operator', description: 'Trip scheduling, group management, and booking', icon: Compass },
      { name: 'Bed & Breakfast', description: 'Room reservations, guest management, and housekeeping', icon: Home },
      { name: 'Vacation Rentals', description: 'Property management, booking calendar, and cleaning dispatch', icon: Home },
      { name: 'Shuttle Service', description: 'Reservation management, driver scheduling, and routes', icon: Truck },
      { name: 'Travel Agency', description: 'Booking management, itinerary building, and vendor coordination', icon: Plane },
      { name: 'Adventure Tours', description: 'Activity booking, equipment tracking, and waivers', icon: Mountain },
    ],
  },
];

// Flat list for backward compatibility
export const LANDING_COMING_SOON: LandingComingSoonModule[] = 
  LANDING_COMING_SOON_CATEGORIES.flatMap(cat => cat.modules);
