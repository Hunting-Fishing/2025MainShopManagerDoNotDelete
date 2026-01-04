import { Car, Droplets, Target, Anchor, Fuel, LucideIcon } from 'lucide-react';

export interface ModuleRouteConfig {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  dashboardRoute: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
}

export const MODULE_ROUTES: Record<string, ModuleRouteConfig> = {
  automotive: {
    slug: 'automotive',
    name: 'Automotive Repair',
    description: 'Full-service auto repair shop management',
    icon: Car,
    dashboardRoute: '/dashboard',
    color: 'hsl(var(--primary))',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-blue-600',
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
  },
};

export const getModuleRoute = (slug: string): ModuleRouteConfig | undefined => {
  return MODULE_ROUTES[slug];
};

export const getAllModuleRoutes = (): ModuleRouteConfig[] => {
  return Object.values(MODULE_ROUTES);
};
