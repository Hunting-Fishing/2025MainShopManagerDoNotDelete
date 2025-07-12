
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard,
  Users,
  Wrench,
  Receipt,
  FileText,
  Package,
  Calendar,
  MessageSquare,
  Settings,
  BarChart3,
  ClipboardList,
  Phone,
  Star,
  Bell,
  Cog,
  Shield,
  HelpCircle,
  ShoppingCart,
  Building2,
  Truck,
  UserCog,
  FileBarChart,
  Building,
  Store,
  Code
} from 'lucide-react';
import { useSidebar } from '@/hooks/use-sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

const navigation = [
  {
    title: 'Dashboard',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Customers',
    items: [
      { name: 'Customers', href: '/customers', icon: Users },
    ],
  },
  {
    title: 'Inventory',
    items: [
      { name: 'Products', href: '/inventory', icon: Package },
      { name: 'Suppliers', href: '/inventory/suppliers', icon: Truck },
      { name: 'Stock Control', href: '/stock-control', icon: BarChart3 },
      { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart },
    ],
  },
  {
    title: 'Scheduling',
    items: [
      { name: 'Calendar', href: '/calendar', icon: Calendar },
      { name: 'Service Reminders', href: '/service-reminders', icon: Bell },
    ],
  },
  {
    title: 'Communications',
    items: [
      { name: 'Customer Comms', href: '/customer-comms', icon: MessageSquare },
      { name: 'Call Logger', href: '/call-logger', icon: Phone },
    ],
  },
  {
    title: 'Operations',
    items: [
      { name: 'Quotes', href: '/quotes', icon: FileText },
      { name: 'Work Orders', href: '/work-orders', icon: Wrench },
      { name: 'Invoices', href: '/invoices', icon: Receipt },
      { name: 'Service Board', href: '/service-board', icon: ClipboardList },
    ],
  },
  {
    title: 'Company',
    items: [
      { name: 'Company Profile', href: '/company-profile', icon: Building },
      { name: 'Staff Members', href: '/staff-members', icon: UserCog },
      { name: 'Vehicles', href: '/vehicles', icon: Truck },
      { name: 'Documents', href: '/documents', icon: FileBarChart },
    ],
  },
  {
    title: 'Services',
    items: [
      { name: 'Service Editor', href: '/service-editor', icon: Cog },
      { name: 'Service Library', href: '/service-library', icon: Star },
    ],
  },
  {
    title: 'E-Commerce',
    items: [
      { name: 'Shopping', href: '/shopping', icon: Store },
    ],
  },
  {
    title: 'Development',
    items: [
      { name: 'Developer Portal', href: '/developer', icon: Code },
    ],
  },
  {
    title: 'Settings',
    items: [
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
  },
  {
    title: 'Support',
    items: [
      { name: 'Help', href: '/help', icon: HelpCircle },
      { name: 'Security', href: '/security', icon: Shield },
    ],
  },
];

export function SidebarContent() {
  const location = useLocation();
  const { setIsOpen } = useSidebar();
  const isMobile = useIsMobile();

  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-indigo-700">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center px-6">
        <Link to="/dashboard" className="text-xl font-bold text-white" onClick={handleLinkClick}>
          ServicePro
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {navigation.map((section) => (
          <div key={section.title} className="mb-4">
            <h3 className="px-3 text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={handleLinkClick}
                    className={cn(
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-indigo-800 text-white'
                        : 'text-indigo-100 hover:bg-indigo-600 hover:text-white'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0',
                        isActive ? 'text-white' : 'text-indigo-300 group-hover:text-white'
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}
