import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Fuel,
  LayoutDashboard,
  ClipboardList,
  Users,
  MapPin,
  Package,
  Truck,
  UserCheck,
  Route,
  Receipt,
  BarChart3,
  Container,
  Droplets,
  Settings,
  Filter,
  FileText,
  DollarSign,
  Home,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', href: '/fuel-delivery', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Orders & Deliveries',
    items: [
      { title: 'Orders', href: '/fuel-delivery/orders', icon: ClipboardList },
      { title: 'Routes', href: '/fuel-delivery/routes', icon: Route },
      { title: 'Deliveries', href: '/fuel-delivery/deliveries', icon: Truck },
      { title: 'Quotes', href: '/fuel-delivery/quotes', icon: FileText },
    ],
  },
  {
    title: 'Customers & Locations',
    items: [
      { title: 'Customers', href: '/fuel-delivery/customers', icon: Users },
      { title: 'Locations', href: '/fuel-delivery/locations', icon: MapPin },
    ],
  },
  {
    title: 'Fleet Management',
    items: [
      { title: 'Trucks', href: '/fuel-delivery/trucks', icon: Truck },
      { title: 'Drivers', href: '/fuel-delivery/drivers', icon: UserCheck },
      { title: 'Driver App', href: '/fuel-delivery/driver-app', icon: Fuel },
    ],
  },
  {
    title: 'Tanks & Equipment',
    items: [
      { title: 'Customer Tanks', href: '/fuel-delivery/tanks', icon: Container },
      { title: 'Tidy Tanks', href: '/fuel-delivery/tidy-tanks', icon: Package },
      { title: 'Tank Fills', href: '/fuel-delivery/tank-fills', icon: Droplets },
      { title: 'Equipment', href: '/fuel-delivery/equipment', icon: Settings },
      { title: 'Filters', href: '/fuel-delivery/equipment-filters', icon: Filter },
    ],
  },
  {
    title: 'Inventory & Products',
    items: [
      { title: 'Products', href: '/fuel-delivery/products', icon: Package },
      { title: 'Inventory', href: '/fuel-delivery/inventory', icon: BarChart3 },
      { title: 'Pricing', href: '/fuel-delivery/pricing', icon: DollarSign },
    ],
  },
  {
    title: 'Billing',
    items: [
      { title: 'Invoices', href: '/fuel-delivery/invoices', icon: Receipt },
    ],
  },
];

interface FuelDeliverySidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function FuelDeliverySidebar({ collapsed = false, onToggle }: FuelDeliverySidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const isActive = (href: string) => {
    if (href === '/fuel-delivery') {
      return currentPath === '/fuel-delivery';
    }
    return currentPath.startsWith(href);
  };

  return (
    <div
      className={cn(
        'fixed top-0 left-0 z-40 h-full bg-card border-r border-border transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Fuel className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Fuel Delivery</h2>
                <p className="text-xs text-muted-foreground">Module</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto p-2 rounded-lg bg-orange-500/10">
              <Fuel className="h-5 w-5 text-orange-500" />
            </div>
          )}
        </div>
      </div>

      {/* Back to Main */}
      <div className="p-2 border-b border-border">
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'sm'}
          className={cn('w-full', collapsed ? 'justify-center' : 'justify-start')}
          onClick={() => navigate('/dashboard')}
        >
          <Home className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Back to Main</span>}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-4">
          {navSections.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <h3 className="px-3 mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <Button
                    key={item.href}
                    variant={isActive(item.href) ? 'secondary' : 'ghost'}
                    size={collapsed ? 'icon' : 'sm'}
                    className={cn(
                      'w-full',
                      collapsed ? 'justify-center' : 'justify-start',
                      isActive(item.href) && 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 hover:text-orange-700'
                    )}
                    onClick={() => navigate(item.href)}
                    title={collapsed ? item.title : undefined}
                  >
                    <item.icon className={cn('h-4 w-4', isActive(item.href) && 'text-orange-500')} />
                    {!collapsed && <span className="ml-2">{item.title}</span>}
                  </Button>
                ))}
              </div>
              {!collapsed && <Separator className="mt-3" />}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Toggle Button */}
      <div className="p-2 border-t border-border">
        <Button
          variant="ghost"
          size="icon"
          className="w-full"
          onClick={onToggle}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
