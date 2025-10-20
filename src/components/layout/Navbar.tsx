import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Plus, FileText, Wrench, Receipt, ClipboardList, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useUserRoles } from '@/hooks/useUserRoles';
import { hasRoutePermission } from '@/utils/routeGuards';

// Quick action items for creating new records
const quickActions = [
  { name: 'Create Work Order', href: '/work-orders/new', icon: Plus, requiredPath: '/work-orders' },
  { name: 'Create Quote', href: '/quotes/new', icon: FileText, requiredPath: '/quotes' },
  { name: 'Create Invoice', href: '/invoices/new', icon: Receipt, requiredPath: '/invoices' },
  { name: 'Schedule Appointment', href: '/calendar', icon: Calendar, requiredPath: '/calendar' },
];

// Main navigation organized by category
const navigationCategories = [
  {
    title: 'Dashboard',
    items: [
      { name: 'Dashboard', href: '/dashboard', requiredPath: '/dashboard' },
    ]
  },
  {
    title: 'Operations',
    items: [
      { name: 'Work Orders', href: '/work-orders', requiredPath: '/work-orders' },
      { name: 'Quotes', href: '/quotes', requiredPath: '/quotes' },
      { name: 'Invoices', href: '/invoices', requiredPath: '/invoices' },
      { name: 'Service Board', href: '/service-board', requiredPath: '/service-board' },
    ]
  },
  {
    title: 'Customer Management',
    items: [
      { name: 'Customers', href: '/customers', requiredPath: '/customers' },
      { name: 'Calendar', href: '/calendar', requiredPath: '/calendar' },
      { name: 'Customer Communications', href: '/customer-comms', requiredPath: '/customer-comms' },
    ]
  },
  {
    title: 'Inventory & Parts',
    items: [
      { name: 'Inventory', href: '/inventory', requiredPath: '/inventory' },
      { name: 'Inventory Manager', href: '/inventory/manager', requiredPath: '/inventory/manager' },
      { name: 'Orders', href: '/inventory/orders', requiredPath: '/inventory/orders' },
    ]
  },
  {
    title: 'Company',
    items: [
      { name: 'Team', href: '/team', requiredPath: '/team' },
      { name: 'Company Profile', href: '/company-profile', requiredPath: '/company-profile' },
      { name: 'Vehicles', href: '/vehicles', requiredPath: '/vehicles' },
      { name: 'Equipment', href: '/equipment', requiredPath: '/equipment' },
    ]
  },
  {
    title: 'Store',
    items: [
      { name: 'Shopping', href: '/shopping', requiredPath: '/shopping' },
      { name: 'Tools Shop', href: '/tools', requiredPath: '/tools' },
    ]
  },
  {
    title: 'Reports & Analytics',
    items: [
      { name: 'Reports', href: '/reports', requiredPath: '/reports' },
    ]
  },
  {
    title: 'Administration',
    items: [
      { name: 'Developer', href: '/developer', requiredPath: '/developer' },
    ]
  },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { data: userRoles = [] } = useUserRoles();
  
  // Function to check if a navigation item is active based on the current URL path
  const isNavItemActive = (href: string) => {
    const currentPath = location.pathname;
    
    // Special case for root path
    if (href === '/') {
      return currentPath === '/';
    }
    
    // For other paths, we consider it active if:
    // 1. The current path exactly matches the href, or
    // 2. The current path starts with the href followed by a slash or nothing
    // This ensures that '/shopping/categories' will highlight the 'Shopping' nav item
    return currentPath === href || 
           currentPath.startsWith(`${href}/`);
  };
  
  // Get desktop navigation items (just show main categories)
  const desktopNavItems = [
    { name: 'Dashboard', href: '/dashboard', requiredPath: '/dashboard' },
    { name: 'Work Orders', href: '/work-orders', requiredPath: '/work-orders' },
    { name: 'Customers', href: '/customers', requiredPath: '/customers' },
    { name: 'Inventory', href: '/inventory', requiredPath: '/inventory' },
    { name: 'Reports', href: '/reports', requiredPath: '/reports' },
  ];
  
  return (
    <header className="bg-white shadow-sm dark:bg-slate-800 dark:border-slate-700 border-b border-slate-200">
      <nav className="mx-auto flex max-w-full items-center justify-between px-6 py-3 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link to="/dashboard" className="-m-1.5 p-1.5">
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              Service Manager
            </span>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-slate-700 dark:text-slate-300"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-8">
          {desktopNavItems.map((item) => (
            hasRoutePermission(item.requiredPath, userRoles) && (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium ${
                  isNavItemActive(item.href) 
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
                }`}
              >
                {item.name}
              </Link>
            )
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="hidden lg:block"
              asChild
            >
              <Link to="/settings">
                Settings
              </Link>
            </Button>
          </div>
        </div>
      </nav>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-slate-800 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link to="/dashboard" className="-m-1.5 p-1.5">
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  Service Manager
                </span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-slate-700 dark:text-slate-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10 dark:divide-slate-600">
                {/* Quick Actions */}
                <div className="py-6">
                  <h3 className="px-3 mb-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Quick Actions
                  </h3>
                  <div className="space-y-1">
                    {quickActions.map((action) => (
                      hasRoutePermission(action.requiredPath, userRoles) && (
                        <Link
                          key={action.name}
                          to={action.href}
                          className="flex items-center gap-3 -mx-3 rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-700"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <action.icon className="h-5 w-5" />
                          {action.name}
                        </Link>
                      )
                    ))}
                  </div>
                </div>

                {/* Categorized Navigation */}
                {navigationCategories.map((category) => {
                  const visibleItems = category.items.filter(item => 
                    hasRoutePermission(item.requiredPath, userRoles)
                  );
                  
                  if (visibleItems.length === 0) return null;
                  
                  return (
                    <div key={category.title} className="py-6">
                      <h3 className="px-3 mb-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {category.title}
                      </h3>
                      <div className="space-y-1">
                        {visibleItems.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            className={`-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 ${
                              isNavItemActive(item.href) 
                                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-700'
                                : 'text-slate-700 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-slate-700'
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Settings */}
                <div className="py-6">
                  <Link
                    to="/settings"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-slate-700 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-slate-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
