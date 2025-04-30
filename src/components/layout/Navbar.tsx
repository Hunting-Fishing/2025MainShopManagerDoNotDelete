
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Customers', href: '/customers' },
  { name: 'Work Orders', href: '/work-orders' },
  { name: 'Equipment', href: '/equipment' },
  { name: 'Inventory', href: '/inventory' },
  { name: 'Shopping', href: '/shopping' },
  { name: 'Team', href: '/team' },
  { name: 'Reports', href: '/reports' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
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
          {navigation.map((item) => (
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
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 ${
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
