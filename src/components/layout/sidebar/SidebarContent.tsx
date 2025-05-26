
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Package, 
  Wrench, 
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  UserCircle,
  Code,
  ShoppingCart,
  Hammer,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Work Orders', href: '/work-orders', icon: Wrench },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Equipment', href: '/equipment', icon: Hammer },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Shopping', href: '/shopping', icon: ShoppingCart },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Team', href: '/team', icon: UserCircle },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Developer', href: '/developer', icon: Code },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function SidebarContent() {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-center py-6 border-b border-indigo-600">
        <h1 className="text-xl font-bold text-white">Easy Shop Manager</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
                          (item.href !== '/' && location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-indigo-100 hover:bg-indigo-600 hover:text-white'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-indigo-600">
        <p className="text-xs text-indigo-200 text-center">
          Easy Shop Manager v1.0
        </p>
      </div>
    </div>
  );
}
