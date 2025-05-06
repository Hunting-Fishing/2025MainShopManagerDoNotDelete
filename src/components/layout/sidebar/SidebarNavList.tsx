
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Wrench,
  Package,
  Calendar,
  BarChart,
  Users2,
  ClipboardPenLine,
  Settings2,
  ShoppingCart,
  FileText,
  MessageSquare,
  AlarmClock,
  LineChart,
  Hammer,
  LucideIcon
} from 'lucide-react';

// Enhanced navItems array with all the items shown in the UI
const navItems = [
  { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { path: '/customers', name: 'Customers', icon: Users },
  { path: '/work-orders', name: 'Work Orders', icon: Wrench },
  { path: '/equipment', name: 'Equipment', icon: Hammer },
  { path: '/inventory', name: 'Inventory', icon: Package },
  { path: '/invoices', name: 'Invoices', icon: FileText },
  { path: '/calendar', name: 'Calendar', icon: Calendar },
  { path: '/maintenance', name: 'Maintenance', icon: AlarmClock },
  { path: '/chat', name: 'Chat', icon: MessageSquare },
  { path: '/forms', name: 'Forms', icon: ClipboardPenLine },
  { path: '/shopping', name: 'Shopping', icon: ShoppingCart },
  { path: '/reports', name: 'Reports', icon: LineChart },
  { path: '/team', name: 'Team', icon: Users2 },
  { path: '/marketing', name: 'Marketing', icon: BarChart },
  { path: '/settings', name: 'Settings', icon: Settings2 },
];

export function SidebarNavList() {
  return (
    <nav className="space-y-1 px-2">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              'flex items-center px-3 py-2 rounded-lg transition-colors hover:bg-white/10',
              isActive ? 'bg-white/20 text-white' : 'text-white/80'
            )
          }
        >
          <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
}
