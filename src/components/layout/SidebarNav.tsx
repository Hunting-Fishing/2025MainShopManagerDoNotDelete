
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, LayoutDashboard, ClipboardList, Receipt, 
  Car, Package, Wrench, FileText, ShoppingBag, Cog,
  Hammer, Calendar, Bell, MessageCircle, BarChart3, Truck, 
  Mail, SendHorizontal, MessageSquare, MessagesSquare, Database, 
  UserCircle, Building
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
  submenu?: NavItem[];
  expanded?: boolean;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { title: 'Work Orders', href: '/work-orders', icon: <ClipboardList className="w-5 h-5" /> },
  { title: 'Invoices', href: '/invoices', icon: <Receipt className="w-5 h-5" /> },
  { 
    title: 'Customers', 
    href: '/customers', 
    icon: <Users className="w-5 h-5" />, 
    submenu: [
      { title: 'Customer List', href: '/customers' },
      { title: 'Customer Profiles', href: '/customer-profiles' },
    ] 
  },
  { title: 'Equipment', href: '/equipment', icon: <Car className="w-5 h-5" /> },
  { title: 'Inventory', href: '/inventory', icon: <Package className="w-5 h-5" /> },
  { title: 'Tools Shop', href: '/tools', icon: <Wrench className="w-5 h-5" /> },
  { title: 'Forms', href: '/forms', icon: <FileText className="w-5 h-5" /> },
  { title: 'Shopping', href: '/shopping', icon: <ShoppingBag className="w-5 h-5" /> },
  { title: 'Maintenance', href: '/maintenance', icon: <Hammer className="w-5 h-5" /> },
  { title: 'Calendar', href: '/calendar', icon: <Calendar className="w-5 h-5" /> },
  { title: 'Reminders', href: '/reminders', icon: <Bell className="w-5 h-5" /> },
  { title: 'Chat', href: '/chat', icon: <MessageCircle className="w-5 h-5" /> },
  { title: 'Reports', href: '/reports', icon: <BarChart3 className="w-5 h-5" /> },
  { title: 'Team', href: '/team', icon: <UserCircle className="w-5 h-5" /> },
  { 
    title: 'Marketing', 
    href: '/marketing', 
    icon: <Mail className="w-5 h-5" />,
    submenu: [
      { title: 'Overview', href: '/marketing' },
      { title: 'Email Templates', href: '/email-templates' },
      { title: 'Email Campaigns', href: '/email-campaigns' },
      { title: 'Email Sequences', href: '/email-sequences' },
      { title: 'SMS Templates', href: '/sms-templates' },
    ]
  },
  { 
    title: 'Developer', 
    href: '/developer', 
    icon: <Database className="w-5 h-5" />,
    submenu: [
      { title: 'Portal', href: '/developer' },
      { title: 'Shopping Controls', href: '/developer/shopping-controls' },
      { title: 'Service Management', href: '/developer/service-management' },
    ]
  },
  { title: 'Settings', href: '/settings', icon: <Cog className="w-5 h-5" /> },
];

export function SidebarNav() {
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({});

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const isExpanded = expandedItems[item.title];
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    
    return (
      <React.Fragment key={item.href}>
        <li className={depth > 0 ? 'pl-6' : ''}>
          {hasSubmenu ? (
            <button
              onClick={() => toggleExpanded(item.title)}
              className={cn(
                'flex items-center w-full py-2 px-3 rounded-lg text-sm font-medium',
                'hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
                'focus:outline-none',
                depth > 0 ? 'mt-1' : ''
              )}
            >
              {item.icon}
              <span className="ml-3 flex-1 text-left">{item.title}</span>
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          ) : (
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center py-2 px-3 rounded-lg text-sm font-medium',
                  'hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
                  isActive
                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-200',
                  depth > 0 ? 'mt-1' : ''
                )
              }
            >
              {item.icon}
              <span className="ml-3">{item.title}</span>
            </NavLink>
          )}
        </li>
        
        {hasSubmenu && isExpanded && (
          <ul className="space-y-1 mt-1">
            {item.submenu?.map((subItem) => renderNavItem(subItem, depth + 1))}
          </ul>
        )}
      </React.Fragment>
    );
  };

  return (
    <nav className="space-y-1 py-4">
      <ul className="space-y-1">
        {navItems.map((item) => renderNavItem(item))}
      </ul>
    </nav>
  );
}
