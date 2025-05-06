
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
  Gauge,
  MessageCircle,
  Bell,
  MegaphoneIcon
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { path: '/work-orders', name: 'Work Orders', icon: Wrench },
  { path: '/invoices', name: 'Invoices', icon: FileText },
  { path: '/customers', name: 'Customers', icon: Users },
  { path: '/equipment', name: 'Equipment', icon: Gauge },
  { path: '/inventory', name: 'Inventory', icon: Package },
  { path: '/forms', name: 'Forms', icon: ClipboardPenLine },
  { path: '/maintenance', name: 'Maintenance', icon: Wrench },
  { path: '/calendar', name: 'Calendar', icon: Calendar },
  { path: '/reminders', name: 'Reminders', icon: Bell },
  { path: '/chat', name: 'Chat', icon: MessageCircle },
  { path: '/shopping', name: 'Shopping', icon: ShoppingCart },
  { path: '/reports', name: 'Reports', icon: BarChart },
  { path: '/team', name: 'Team', icon: Users2 },
  { path: '/marketing', name: 'Marketing', icon: MegaphoneIcon },
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
