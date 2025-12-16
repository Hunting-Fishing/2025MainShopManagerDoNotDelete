import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bell, 
  Search, 
  Menu,
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
  AlertCircle,
  Phone,
  Star,
  Cog,
  HelpCircle,
  Shield,
  Heart,
  Mail,
  Send,
  MessagesSquare,
  MessageCircle,
  Archive,
  FileBarChart,
  FileBarChart2,
  FormInput,
  Code,
  UserCog,
  Boxes,
  Gauge,
  TrendingDown,
  Smartphone,
  GraduationCap,
  ShoppingBag,
  Award,
  CalendarClock,
  HardHat,
  ClipboardCheck
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
    if (path.startsWith('/calendar')) return 'Service Calendar';
    if (path.startsWith('/scheduling')) return 'Staff Scheduling';
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

  // Categorized Navigation - Synced with sidebar navigation.ts
  const navigationSections = [
    {
      title: 'Dashboard',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', requiredPath: '/dashboard' },
      ]
    },
    {
      title: 'Customers',
      items: [
        { label: 'Customers', icon: Users, path: '/customers', requiredPath: '/customers' },
      ]
    },
    {
      title: 'Inventory',
      items: [
        { label: 'Inventory Overview', icon: Package, path: '/inventory', requiredPath: '/inventory' },
        { label: 'Service Packages', icon: Boxes, path: '/service-packages', requiredPath: '/service-packages' },
        { label: 'Asset Work Orders', icon: ClipboardList, path: '/work-orders', requiredPath: '/work-orders' },
        { label: 'Asset Usage', icon: Gauge, path: '/asset-usage', requiredPath: '/asset-usage' },
        { label: 'Consumption Tracking', icon: TrendingDown, path: '/consumption-tracking', requiredPath: '/consumption-tracking' },
        { label: 'Mobile Scanner', icon: Smartphone, path: '/mobile-inventory', requiredPath: '/mobile-inventory' },
        { label: 'Inventory Analytics', icon: BarChart3, path: '/inventory-analytics', requiredPath: '/inventory-analytics' },
        { label: 'Inventory Manager', icon: Settings, path: '/inventory-manager', requiredPath: '/inventory-manager' },
        { label: 'Maintenance Planning', icon: Wrench, path: '/maintenance-planning', requiredPath: '/maintenance-planning' },
      ]
    },
    {
      title: 'Scheduling',
      items: [
        { label: 'Service Calendar', icon: Calendar, path: '/calendar', requiredPath: '/calendar' },
        { label: 'Staff Scheduling', icon: UserCog, path: '/scheduling', requiredPath: '/scheduling' },
        { label: 'Service Reminders', icon: Bell, path: '/service-reminders', requiredPath: '/service-reminders' },
      ]
    },
    {
      title: 'Communications',
      items: [
        { label: 'Team Chat', icon: MessageCircle, path: '/chat', requiredPath: '/chat' },
        { label: 'Customer Comms', icon: MessageSquare, path: '/customer-comms', requiredPath: '/customer-comms' },
        { label: 'Call Logger', icon: Phone, path: '/call-logger', requiredPath: '/call-logger' },
      ]
    },
    {
      title: 'Marketing',
      items: [
        { label: 'Email Campaigns', icon: Mail, path: '/email-campaigns', requiredPath: '/email-campaigns' },
        { label: 'Email Sequences', icon: Send, path: '/email-sequences', requiredPath: '/email-sequences' },
        { label: 'Email Templates', icon: FileText, path: '/email-templates', requiredPath: '/email-templates' },
        { label: 'SMS Management', icon: MessagesSquare, path: '/sms-management', requiredPath: '/sms-management' },
        { label: 'SMS Templates', icon: MessageSquare, path: '/sms-templates', requiredPath: '/sms-templates' },
      ]
    },
    {
      title: 'Operations',
      items: [
        { label: 'Quotes', icon: FileText, path: '/quotes', requiredPath: '/quotes' },
        { label: 'Work Orders', icon: Wrench, path: '/work-orders', requiredPath: '/work-orders' },
        { label: 'Invoices', icon: Receipt, path: '/invoices', requiredPath: '/invoices' },
        { label: 'Service Board', icon: ClipboardList, path: '/service-board', requiredPath: '/service-board' },
        { label: 'Payments', icon: ShoppingBag, path: '/payments', requiredPath: '/payments' },
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
        { label: 'Company Profile', icon: Building, path: '/company-profile', requiredPath: '/company-profile' },
        { label: 'Team', icon: UserCog, path: '/team', requiredPath: '/team' },
        { label: 'Training Overview', icon: GraduationCap, path: '/training-overview', requiredPath: '/training-overview' },
        { label: 'Vehicles', icon: Truck, path: '/vehicles', requiredPath: '/vehicles' },
        { label: 'Documents', icon: FileBarChart, path: '/documents', requiredPath: '/documents' },
      ]
    },
    {
      title: 'Safety & Compliance',
      items: [
        { label: 'Safety Dashboard', icon: Shield, path: '/safety', requiredPath: '/safety' },
        { label: 'Incidents', icon: AlertCircle, path: '/safety/incidents', requiredPath: '/safety/incidents' },
        { label: 'Daily Inspections', icon: ClipboardCheck, path: '/safety/inspections', requiredPath: '/safety/inspections' },
        { label: 'DVIR Reports', icon: Truck, path: '/safety/dvir', requiredPath: '/safety/dvir' },
        { label: 'Lift Inspections', icon: Package, path: '/safety/equipment', requiredPath: '/safety/equipment' },
        { label: 'Certifications', icon: Award, path: '/safety/certifications', requiredPath: '/safety/certifications' },
        { label: 'Safety Documents', icon: FileText, path: '/safety/documents', requiredPath: '/safety/documents' },
        { label: 'Schedules & Reminders', icon: CalendarClock, path: '/safety/schedules', requiredPath: '/safety/schedules' },
        { label: 'Reports', icon: FileText, path: '/safety/reports', requiredPath: '/safety/reports' },
        { label: 'Corrective Actions', icon: ClipboardCheck, path: '/safety/corrective-actions', requiredPath: '/safety/corrective-actions' },
        { label: 'Near Miss', icon: AlertCircle, path: '/safety/near-miss', requiredPath: '/safety/near-miss' },
        { label: 'Training', icon: GraduationCap, path: '/safety/training', requiredPath: '/safety/training' },
        { label: 'Meetings', icon: Users, path: '/safety/meetings', requiredPath: '/safety/meetings' },
      ]
    },
    {
      title: 'Services',
      items: [
        { label: 'Service Editor', icon: Cog, path: '/service-editor', requiredPath: '/service-editor' },
        { label: 'Service Library', icon: Star, path: '/services', requiredPath: '/services' },
        { label: 'Repair Plans', icon: Archive, path: '/repair-plans', requiredPath: '/repair-plans' },
      ]
    },
    {
      title: 'Store',
      items: [
        { label: 'Shopping', icon: Store, path: '/shopping', requiredPath: '/shopping' },
        { label: 'Shopping Cart', icon: ShoppingCart, path: '/shopping/cart', requiredPath: '/shopping/cart' },
        { label: 'Wishlist', icon: Heart, path: '/wishlist', requiredPath: '/wishlist' },
        { label: 'Orders', icon: ShoppingBag, path: '/orders', requiredPath: '/orders' },
      ]
    },
    {
      title: 'Tools',
      items: [
        { label: 'AI Hub', icon: Brain, path: '/ai-hub', requiredPath: '/ai-hub' },
        { label: 'Reports', icon: FileBarChart2, path: '/reports', requiredPath: '/reports' },
        { label: 'Forms', icon: FormInput, path: '/forms', requiredPath: '/forms' },
        { label: 'Feedback', icon: Star, path: '/feedback', requiredPath: '/feedback' },
        { label: 'Developer', icon: Code, path: '/developer', requiredPath: '/developer' },
      ]
    },
    {
      title: 'Support',
      items: [
        { label: 'Help', icon: HelpCircle, path: '/help', requiredPath: '/help' },
        { label: 'Security', icon: Shield, path: '/security', requiredPath: '/security' },
      ]
    }
  ].map(section => ({
    ...section,
    items: section.items.filter(item => hasRoutePermission(item.requiredPath, userRoles))
  })).filter(section => section.items.length > 0);

  // User Profile items
  const profileItems = [
    { label: 'Profile', icon: UserCircle, path: '/profile' },
    { label: 'Notifications', icon: Bell, path: '/notifications' },
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
              <SheetContent side="right" className="w-72 overflow-y-auto">
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
                    {navigationSections.map((section) => (
                      <div key={section.title} className="mb-6">
                        <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {section.title}
                        </h3>
                        <div className="space-y-1">
                          {section.items.map((item) => (
                            <button
                              key={item.path}
                              onClick={() => handleMenuItemClick(item.path)}
                              className={cn(
                                "w-full flex items-center space-x-3 px-3 py-2.5 text-left rounded-md hover:bg-accent transition-colors",
                                location.pathname === item.path && "bg-accent text-accent-foreground"
                              )}
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
                            className={cn(
                              "w-full flex items-center space-x-3 px-3 py-2.5 text-left rounded-md hover:bg-accent transition-colors",
                              location.pathname === item.path && "bg-accent text-accent-foreground"
                            )}
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