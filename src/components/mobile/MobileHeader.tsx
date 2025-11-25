import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bell, 
  Search, 
  Menu,
  X,
  Settings,
  User,
  LogOut,
  Plus,
  FileText,
  Receipt,
  Calendar,
  Wrench,
  Users,
  MessageSquare,
  Package,
  ClipboardList,
  Building,
  Truck,
  ShoppingCart,
  Store,
  BarChart3,
  Brain,
  LayoutDashboard,
  UserCircle,
  Hammer,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useUserRoles } from '@/hooks/useUserRoles';
import { hasRoutePermission } from '@/utils/routeGuards';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  showMenu?: boolean;
  onSearch?: () => void;
  rightAction?: React.ReactNode;
}

export function MobileHeader({
  title,
  showBack = false,
  showSearch = false,
  showNotifications = true,
  showMenu = true,
  onSearch,
  rightAction
}: MobileHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { user } = useAuthUser();
  const { data: userRoles = [] } = useUserRoles();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getPageTitle = () => {
    if (title) return title;
    
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/work-orders')) return 'Work Orders';
    if (path.startsWith('/customers')) return 'Customers';
    if (path.startsWith('/inventory')) return 'Inventory';
    if (path.startsWith('/invoices')) return 'Invoices';
    if (path.startsWith('/calendar')) return 'Calendar';
    if (path.startsWith('/shopping')) return 'Shop';
    if (path.startsWith('/ai')) return 'AI Hub';
    return 'Order Master';
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleNotifications = () => {
    navigate('/notifications');
  };

  // Quick Actions
  const quickActions = [
    { label: 'Create Work Order', icon: Plus, path: '/work-orders/new', requiredPath: '/work-orders' },
    { label: 'Create Quote', icon: FileText, path: '/quotes/new', requiredPath: '/quotes' },
    { label: 'Create Invoice', icon: Receipt, path: '/invoices/new', requiredPath: '/invoices' },
    { label: 'Schedule Appointment', icon: Calendar, path: '/calendar', requiredPath: '/calendar' },
  ].filter(item => hasRoutePermission(item.requiredPath, userRoles));

  // Categorized Navigation
  const navigationSections = [
    {
      title: 'Dashboard',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', requiredPath: '/dashboard' },
      ]
    },
    {
      title: 'Operations',
      items: [
        { label: 'Work Orders', icon: Wrench, path: '/work-orders', requiredPath: '/work-orders' },
        { label: 'Quotes', icon: FileText, path: '/quotes', requiredPath: '/quotes' },
        { label: 'Invoices', icon: Receipt, path: '/invoices', requiredPath: '/invoices' },
        { label: 'Service Board', icon: ClipboardList, path: '/service-board', requiredPath: '/service-board' },
      ]
    },
    {
      title: 'Customer Management',
      items: [
        { label: 'Customers', icon: Users, path: '/customers', requiredPath: '/customers' },
        { label: 'Calendar', icon: Calendar, path: '/calendar', requiredPath: '/calendar' },
        { label: 'Communications', icon: MessageSquare, path: '/customer-comms', requiredPath: '/customer-comms' },
      ]
    },
    {
      title: 'Inventory & Parts',
      items: [
        { label: 'Inventory', icon: Package, path: '/inventory', requiredPath: '/inventory' },
        { label: 'Inventory Manager', icon: ClipboardList, path: '/inventory/manager', requiredPath: '/inventory/manager' },
        { label: 'Orders', icon: Truck, path: '/inventory/orders', requiredPath: '/inventory/orders' },
      ]
    },
    {
      title: 'Equipment & Tools',
      items: [
        { label: 'Equipment Management', icon: Hammer, path: '/equipment-management', requiredPath: '/equipment-management' },
        { label: 'Maintenance Requests', icon: AlertCircle, path: '/maintenance-requests', requiredPath: '/maintenance-requests' },
      ]
    },
    {
      title: 'Company',
      items: [
        { label: 'Team', icon: Users, path: '/team', requiredPath: '/team' },
        { label: 'Training Overview', icon: Brain, path: '/training-overview', requiredPath: '/training-overview' },
        { label: 'Company Profile', icon: Building, path: '/company-profile', requiredPath: '/company-profile' },
      ]
    },
    {
      title: 'Store',
      items: [
        { label: 'Shopping', icon: ShoppingCart, path: '/shopping', requiredPath: '/shopping' },
        { label: 'Tools Shop', icon: Store, path: '/tools-shop', requiredPath: '/tools-shop' },
      ]
    },
    {
      title: 'Reports & Analytics',
      items: [
        { label: 'Reports', icon: BarChart3, path: '/reports', requiredPath: '/reports' },
      ]
    },
    {
      title: 'Administration',
      items: [
        { label: 'AI Hub', icon: Brain, path: '/developer', requiredPath: '/developer' },
      ]
    }
  ].map(section => ({
    ...section,
    items: section.items.filter(item => hasRoutePermission(item.requiredPath, userRoles))
  })).filter(section => section.items.length > 0);

  // User Profile items
  const profileItems = [
    { label: 'Profile', icon: UserCircle, path: '/profile' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleMenuItemClick = (path: string) => {
    console.log('📱 Mobile menu navigation clicked:', path);
    console.log('📍 Current location:', location.pathname);
    console.log('🔑 User roles:', userRoles);
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border safe-area-top">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left Section */}
        <div className="flex items-center flex-1 min-w-0">
          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mr-2 p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          
          <h1 className="text-lg font-semibold truncate">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {showSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSearch}
              className="p-2"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}

          {showNotifications && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNotifications}
              className="relative p-2"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
          )}

          {rightAction}

          {showMenu && (
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col h-full">
                  {/* User Info */}
                  <div className="border-b border-border pb-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {user?.email || 'User'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Order Master
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <nav className="flex-1 overflow-y-auto">
                    {/* Quick Actions */}
                    {quickActions.length > 0 && (
                      <div className="mb-6">
                        <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Quick Actions
                        </h3>
                        <div className="space-y-1">
                          {quickActions.map((item) => (
                            <button
                              key={item.path}
                              onClick={() => handleMenuItemClick(item.path)}
                              className="w-full flex items-center space-x-3 px-3 py-2.5 text-left rounded-md hover:bg-accent transition-colors"
                            >
                              <item.icon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Navigation Sections */}
                    {navigationSections.map((section, sectionIndex) => (
                      <div key={section.title} className="mb-6">
                        <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {section.title}
                        </h3>
                        <div className="space-y-1">
                          {section.items.map((item) => (
                            <button
                              key={item.path}
                              onClick={() => handleMenuItemClick(item.path)}
                              className="w-full flex items-center space-x-3 px-3 py-2.5 text-left rounded-md hover:bg-accent transition-colors"
                            >
                              <item.icon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Divider */}
                    <div className="border-t border-border my-4" />

                    {/* User Profile Section */}
                    <div className="mb-4">
                      <div className="space-y-1">
                        {profileItems.map((item) => (
                          <button
                            key={item.path}
                            onClick={() => handleMenuItemClick(item.path)}
                            className="w-full flex items-center space-x-3 px-3 py-2.5 text-left rounded-md hover:bg-accent transition-colors"
                          >
                            <item.icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </nav>

                  {/* Sign Out */}
                  <div className="border-t border-border pt-4">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-3 px-3 py-3 text-left rounded-md hover:bg-accent transition-colors text-destructive"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}