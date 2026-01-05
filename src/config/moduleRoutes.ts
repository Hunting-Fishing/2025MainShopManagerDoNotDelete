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
  ClipboardList,
  Gauge,
  Receipt,
  Ship,
  MapPin,
  Droplet
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
      { title: 'Dashboard', href: '/automotive', icon: Gauge },
      { title: 'All Jobs', href: '/work-orders', icon: Briefcase },
      { title: 'Vehicles', href: '/vehicles', icon: Car },
      { title: 'Parts', href: '/inventory', icon: Package },
      { title: 'Quotes', href: '/quotes', icon: FileText },
      { title: 'Invoices', href: '/invoices', icon: Receipt },
      { title: 'Payments', href: '/payments', icon: CreditCard },
      { title: 'Appointments', href: '/booking-management', icon: Calendar },
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
      { title: 'Dashboard', href: '/power-washing', icon: Gauge },
      { title: 'All Jobs', href: '/power-washing/jobs', icon: Briefcase },
      { title: 'Customers', href: '/customers', icon: Users },
      { title: 'Equipment', href: '/equipment-management', icon: Wrench },
      { title: 'Quotes', href: '/quotes', icon: FileText },
      { title: 'Invoices', href: '/invoices', icon: Receipt },
      { title: 'Payments', href: '/payments', icon: CreditCard },
      { title: 'Scheduling', href: '/booking-management', icon: Calendar },
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
      { title: 'Dashboard', href: '/marine-services', icon: Gauge },
      { title: 'All Jobs', href: '/marine-services/jobs', icon: Briefcase },
      { title: 'Vessels', href: '/marine-services/vessels', icon: Ship },
      { title: 'Parts', href: '/marine-services/parts', icon: Package },
      { title: 'Quotes', href: '/quotes', icon: FileText },
      { title: 'Invoices', href: '/invoices', icon: Receipt },
      { title: 'Payments', href: '/payments', icon: CreditCard },
      { title: 'Dock Schedule', href: '/marine-services/schedule', icon: Calendar },
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
      { title: 'Dashboard', href: '/fuel-delivery', icon: Gauge },
      { title: 'Deliveries', href: '/fuel-delivery/deliveries', icon: Truck },
      { title: 'Tanks', href: '/fuel-delivery/tanks', icon: Gauge },
      { title: 'Customers', href: '/customers', icon: Users },
      { title: 'Routes', href: '/fuel-delivery/routes', icon: MapPin },
      { title: 'Inventory', href: '/fuel-delivery/inventory', icon: Droplet },
      { title: 'Invoices', href: '/invoices', icon: Receipt },
      { title: 'Payments', href: '/payments', icon: CreditCard },
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
