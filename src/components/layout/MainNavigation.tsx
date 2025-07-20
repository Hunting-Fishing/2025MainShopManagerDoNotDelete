import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Settings,
  Package,
  FileText,
  Calendar,
  BarChart3,
  Heart,
  User,
  Star
} from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Shopping',
    href: '/shopping',
    icon: ShoppingBag,
  },
  {
    name: 'My Profile',
    href: '/profile',
    icon: User,
  },
  {
    name: 'Wishlist',
    href: '/wishlist',
    icon: Heart,
  },
  {
    name: 'Orders',
    href: '/orders',
    icon: Package,
  },
  {
    name: 'Reviews',
    href: '/my-reviews',
    icon: Star,
  },
  // Admin/Staff sections
  {
    name: 'Customers',
    href: '/customers',
    icon: Users,
    roles: ['admin', 'owner', 'manager', 'service_advisor', 'reception']
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: Package,
    roles: ['admin', 'owner', 'manager', 'parts_manager']
  },
  {
    name: 'Work Orders',
    href: '/work-orders',
    icon: FileText,
    roles: ['admin', 'owner', 'manager', 'service_advisor', 'technician']
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    roles: ['admin', 'owner', 'manager', 'service_advisor', 'reception']
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['admin', 'owner', 'manager']
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function MainNavigation() {
  const { userRole } = useUserRole();

  const isItemVisible = (item: NavigationItem) => {
    if (!item.roles) return true;
    if (!userRole) return false;
    return item.roles.includes(userRole.name);
  };

  return (
    <nav className="flex-1 space-y-1 px-2 py-4">
      {navigationItems.filter(isItemVisible).map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          className={({ isActive }) =>
            cn(
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )
          }
        >
          <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
          {item.name}
        </NavLink>
      ))}
    </nav>
  );
}