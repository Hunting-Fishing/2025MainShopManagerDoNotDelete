
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  ClipboardList,
  Calendar,
  MessageSquare,
  User,
  Settings,
  Car,
  FileText,
  CreditCard 
} from 'lucide-react';

const menuItems = [
  {
    title: 'Work Orders',
    icon: <ClipboardList className="h-5 w-5" />,
    path: '/customer-portal/work-orders',
  },
  {
    title: 'Vehicles',
    icon: <Car className="h-5 w-5" />,
    path: '/customer-portal/vehicles',
  },
  {
    title: 'Appointments',
    icon: <Calendar className="h-5 w-5" />,
    path: '/customer-portal/appointments',
  },
  {
    title: 'Messages',
    icon: <MessageSquare className="h-5 w-5" />,
    path: '/customer-portal/messages',
  },
  {
    title: 'Invoices',
    icon: <FileText className="h-5 w-5" />,
    path: '/customer-portal/invoices',
  },
  {
    title: 'Payments',
    icon: <CreditCard className="h-5 w-5" />,
    path: '/customer-portal/payments',
  },
  {
    title: 'Profile',
    icon: <User className="h-5 w-5" />,
    path: '/customer-portal/profile',
  },
  {
    title: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    path: '/customer-portal/settings',
  },
];

export function CustomerPortalSidebar() {
  const location = useLocation();

  return (
    <div className="hidden border-r bg-white md:block">
      <div className="flex h-16 items-center border-b px-6">
        <Link to="/customer-portal" className="flex items-center gap-2 font-semibold">
          <span className="text-xl font-bold">Auto Shop</span>
        </Link>
      </div>
      <div className="py-4">
        <nav className="grid gap-1 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-gray-100",
                location.pathname === item.path ? "bg-gray-100 text-blue-600" : "text-gray-500 hover:text-gray-900"
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
