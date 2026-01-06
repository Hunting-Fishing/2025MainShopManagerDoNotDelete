import { 
  Car, 
  Droplets, 
  Target, 
  Anchor, 
  Fuel, 
  LucideIcon,
  Briefcase,
  Crosshair,
  Package,
  BarChart3,
  FileText,
  CreditCard,
  Calendar,
  Shield,
  ArrowRightLeft,
  ShoppingBag,
  Wrench,
  Truck,
  Users,
  Gauge,
  Receipt,
  Ship,
  MapPin,
  Droplet,
  Link,
  Beaker,
  DollarSign,
  Route,
  CloudSun,
  Camera,
  Star,
  UserPlus,
  Calculator,
  Repeat,
  ClipboardList,
  Bell,
  Globe,
  Activity,
  History,
  FileSearch,
  Compass,
  Snowflake,
  CircleDollarSign,
  Smartphone,
  Container,
  PackageCheck,
  UserCheck,
  FolderOpen
} from 'lucide-react';

export interface ModuleSectionItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export interface ModuleRouteConfig {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  dashboardRoute: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  sections?: ModuleSectionItem[];
}

export const MODULE_ROUTES: Record<string, ModuleRouteConfig> = {
  automotive: {
    slug: 'automotive',
    name: 'Automotive Repair',
    description: 'Full-service auto repair shop management',
    icon: Car,
    dashboardRoute: '/automotive',
    color: 'hsl(var(--primary))',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-blue-600',
    sections: [
      // Core Operations
      { title: 'Dashboard', href: '/automotive', icon: Gauge, description: 'Module overview and KPIs' },
      { title: 'All Jobs', href: '/work-orders', icon: Briefcase, description: 'Work orders and repairs' },
      { title: 'Vehicles', href: '/vehicles', icon: Car, description: 'Customer vehicles' },
      { title: 'Parts', href: '/inventory', icon: Package, description: 'Parts inventory' },
      { title: 'Quotes', href: '/quotes', icon: FileText, description: 'Estimates and quotes' },
      { title: 'Invoices', href: '/invoices', icon: Receipt, description: 'Billing and invoices' },
      { title: 'Payments', href: '/payments', icon: CreditCard, description: 'Payment processing' },
      { title: 'Appointments', href: '/booking-management', icon: Calendar, description: 'Scheduling' },
      // Automotive-Specific Features
      { title: 'Vehicle History', href: '/automotive/vehicle-history', icon: History, description: 'Complete vehicle service history' },
      { title: 'Diagnostics', href: '/automotive/diagnostics', icon: Activity, description: 'Diagnostic tools and codes' },
      { title: 'Labor Rates', href: '/automotive/labor-rates', icon: DollarSign, description: 'Labor rate management' },
      { title: 'TSB & Recalls', href: '/automotive/recalls', icon: FileSearch, description: 'Technical bulletins and recalls' },
    ],
  },
  power_washing: {
    slug: 'power_washing',
    name: 'Power Washing',
    description: 'Pressure washing business management',
    icon: Droplets,
    dashboardRoute: '/power-washing',
    color: 'hsl(var(--chart-2))',
    gradientFrom: 'from-cyan-500',
    gradientTo: 'to-cyan-600',
    sections: [
      // Core Operations
      { title: 'Dashboard', href: '/power-washing', icon: Gauge, description: 'Module overview and KPIs' },
      { title: 'All Jobs', href: '/power-washing/jobs', icon: Briefcase, description: 'Job management' },
      { title: 'Customers', href: '/power-washing/customers', icon: Users, description: 'Customer management' },
      { title: 'Quotes', href: '/power-washing/quotes', icon: FileText, description: 'Estimates and quotes' },
      { title: 'Invoices', href: '/power-washing/invoices', icon: Receipt, description: 'Billing and invoices' },
      { title: 'Payments', href: '/power-washing/payments', icon: CreditCard, description: 'Payment processing' },
      { title: 'Schedule', href: '/power-washing/schedule', icon: Calendar, description: 'Job scheduling' },
      // Power Washing-Specific Features
      { title: 'Chemicals', href: '/power-washing/chemicals', icon: Beaker, description: 'Chemical inventory and SDS' },
      { title: 'Formulas', href: '/power-washing/formulas', icon: Calculator, description: 'Mix ratios and formulas' },
      { title: 'Price Book', href: '/power-washing/price-book', icon: DollarSign, description: 'Service pricing' },
      { title: 'Routes', href: '/power-washing/routes', icon: Route, description: 'Route optimization' },
      { title: 'Weather', href: '/power-washing/weather', icon: CloudSun, description: 'Weather forecasts' },
      { title: 'Equipment', href: '/power-washing/equipment', icon: Wrench, description: 'Equipment management' },
      { title: 'Fleet', href: '/power-washing/fleet', icon: Truck, description: 'Vehicle fleet' },
      { title: 'Photos', href: '/power-washing/photos', icon: Camera, description: 'Before/after photos' },
      { title: 'Reviews', href: '/power-washing/reviews', icon: Star, description: 'Customer reviews' },
      { title: 'Leads', href: '/power-washing/leads', icon: UserPlus, description: 'Lead management' },
      { title: 'Recurring', href: '/power-washing/recurring', icon: Repeat, description: 'Recurring schedules' },
      { title: 'Subscriptions', href: '/power-washing/subscriptions', icon: CreditCard, description: 'Subscription plans' },
      { title: 'Reports', href: '/power-washing/reports', icon: BarChart3, description: 'Analytics and reports' },
      { title: 'Field View', href: '/power-washing/field-view', icon: Smartphone, description: 'Mobile field app' },
      { title: 'Customer Portal', href: '/power-washing/portal', icon: Globe, description: 'Customer self-service' },
    ],
  },
  gunsmith: {
    slug: 'gunsmith',
    name: 'Gunsmith',
    description: 'Firearms service and compliance tracking',
    icon: Target,
    dashboardRoute: '/gunsmith',
    color: 'hsl(var(--chart-4))',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-amber-600',
    sections: [
      { title: 'Dashboard', href: '/gunsmith', icon: Gauge },
      { title: 'All Jobs', href: '/gunsmith/jobs', icon: Briefcase },
      { title: 'Customers', href: '/gunsmith/customers', icon: Users },
      { title: 'Firearms', href: '/gunsmith/firearms', icon: Crosshair },
      { title: 'Parts', href: '/gunsmith/parts', icon: Package },
      { title: 'Parts on Order', href: '/gunsmith/parts-on-order', icon: ShoppingBag },
      { title: 'Inventory', href: '/gunsmith/inventory', icon: BarChart3 },
      { title: 'Quotes', href: '/gunsmith/quotes', icon: FileText },
      { title: 'Invoices', href: '/gunsmith/invoices', icon: Receipt },
      { title: 'Payments', href: '/gunsmith/payments', icon: CreditCard },
      { title: 'Appointments', href: '/gunsmith/appointments', icon: Calendar },
      { title: 'Compliance', href: '/gunsmith/compliance', icon: Shield },
      { title: 'Transfers', href: '/gunsmith/transfers', icon: ArrowRightLeft },
      { title: 'Consignments', href: '/gunsmith/consignments', icon: ShoppingBag },
      { title: 'Resources', href: '/gunsmith/resources', icon: Link },
    ],
  },
  marine: {
    slug: 'marine',
    name: 'Marine Services',
    description: 'Boat and watercraft maintenance',
    icon: Anchor,
    dashboardRoute: '/marine-services',
    color: 'hsl(var(--chart-3))',
    gradientFrom: 'from-teal-500',
    gradientTo: 'to-teal-600',
    sections: [
      // Core Operations
      { title: 'Dashboard', href: '/marine-services', icon: Gauge, description: 'Module overview and KPIs' },
      { title: 'All Jobs', href: '/marine-services/jobs', icon: Briefcase, description: 'Work orders' },
      { title: 'Vessels', href: '/marine-services/vessels', icon: Ship, description: 'Vessel registry' },
      { title: 'Parts', href: '/marine-services/parts', icon: Package, description: 'Parts inventory' },
      { title: 'Quotes', href: '/marine-services/quotes', icon: FileText, description: 'Estimates and quotes' },
      { title: 'Invoices', href: '/marine-services/invoices', icon: Receipt, description: 'Billing and invoices' },
      { title: 'Payments', href: '/marine-services/payments', icon: CreditCard, description: 'Payment processing' },
      { title: 'Dock Schedule', href: '/marine-services/schedule', icon: Calendar, description: 'Dock scheduling' },
      // Marine-Specific Features
      { title: 'Sea Trials', href: '/marine-services/sea-trials', icon: Compass, description: 'Sea trial scheduling and logs' },
      { title: 'Haul-Outs', href: '/marine-services/haul-outs', icon: Anchor, description: 'Haul-out scheduling' },
      { title: 'Winterization', href: '/marine-services/winterization', icon: Snowflake, description: 'Winterization tracking' },
      { title: 'Compliance', href: '/marine-services/compliance', icon: Shield, description: 'Coast Guard compliance' },
    ],
  },
  fuel_delivery: {
    slug: 'fuel_delivery',
    name: 'Fuel Delivery',
    description: 'Fuel delivery and tank management',
    icon: Fuel,
    dashboardRoute: '/fuel-delivery',
    color: 'hsl(var(--chart-5))',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-orange-600',
    sections: [
      // Core Operations
      { title: 'Dashboard', href: '/fuel-delivery', icon: Gauge, description: 'Module overview and KPIs' },
      { title: 'Orders', href: '/fuel-delivery/orders', icon: ClipboardList, description: 'Delivery orders' },
      { title: 'Customers', href: '/fuel-delivery/customers', icon: Users, description: 'Customer management' },
      { title: 'Quotes', href: '/fuel-delivery/quotes', icon: FileText, description: 'Estimates and quotes' },
      { title: 'Invoices', href: '/fuel-delivery/invoices', icon: Receipt, description: 'Billing and invoices' },
      // Tank Management
      { title: 'Tanks', href: '/fuel-delivery/tanks', icon: Container, description: 'Tank registry' },
      { title: 'Tidy Tanks', href: '/fuel-delivery/tidy-tanks', icon: PackageCheck, description: 'Tank maintenance' },
      { title: 'Tank Fills', href: '/fuel-delivery/tank-fills', icon: Droplet, description: 'Fill history' },
      { title: 'Locations', href: '/fuel-delivery/locations', icon: MapPin, description: 'Delivery locations' },
      // Fleet & Delivery
      { title: 'Routes', href: '/fuel-delivery/routes', icon: Route, description: 'Route optimization' },
      { title: 'Trucks', href: '/fuel-delivery/trucks', icon: Truck, description: 'Delivery trucks' },
      { title: 'Drivers', href: '/fuel-delivery/drivers', icon: UserCheck, description: 'Driver management' },
      { title: 'Equipment', href: '/fuel-delivery/equipment', icon: Wrench, description: 'Equipment tracking' },
      { title: 'Completions', href: '/fuel-delivery/completions', icon: FolderOpen, description: 'Completed deliveries' },
      // Products & Pricing
      { title: 'Products', href: '/fuel-delivery/products', icon: Fuel, description: 'Fuel products' },
      { title: 'Pricing', href: '/fuel-delivery/pricing', icon: CircleDollarSign, description: 'Price management' },
      { title: 'Inventory', href: '/fuel-delivery/inventory', icon: BarChart3, description: 'Fuel inventory' },
      // Mobile
      { title: 'Driver App', href: '/fuel-delivery/driver-app', icon: Smartphone, description: 'Mobile driver app' },
    ],
  },
};

export const getModuleRoute = (slug: string): ModuleRouteConfig | undefined => {
  return MODULE_ROUTES[slug];
};

export const getAllModuleRoutes = (): ModuleRouteConfig[] => {
  return Object.values(MODULE_ROUTES);
};

export const getModuleSections = (slug: string): ModuleSectionItem[] => {
  return MODULE_ROUTES[slug]?.sections || [];
};
