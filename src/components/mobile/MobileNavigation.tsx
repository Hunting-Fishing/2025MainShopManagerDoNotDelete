import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  ClipboardList, 
  Users, 
  Package, 
  Calendar,
  MoreHorizontal,
  FileText,
  Wrench,
  Receipt,
  Bell,
  Settings,
  MessageSquare,
  Truck,
  Ship,
  UserCog,
  BarChart3,
  X,
  ChevronRight,
  CalendarDays,
  Shield,
  AlertTriangle,
  ClipboardCheck,
  Award,
  HardHat,
  Clock,
  MapPin,
  Brain,
  Phone,
  Mail,
  Send,
  MessageCircle,
  Building2,
  GraduationCap,
  FolderOpen,
  Library,
  Edit3,
  ClipboardCopy,
  ShoppingCart,
  Heart,
  ShoppingBag,
  FormInput,
  ThumbsUp,
  Code,
  User,
  Lock,
  HelpCircle,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useWorkOrdersCount } from '@/hooks/useWorkOrdersCount';
import { useNotifications } from '@/hooks/useNotifications';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
}

interface MoreMenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  description?: string;
}

interface MoreMenuSection {
  title: string;
  items: MoreMenuItem[];
}

export function MobileNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeCount } = useWorkOrdersCount();
  const { unreadCount } = useNotifications();
  const [moreOpen, setMoreOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: Home,
      path: '/dashboard'
    },
    {
      id: 'daily-logs',
      label: 'Logs',
      icon: FileText,
      path: '/daily-logs'
    },
    {
      id: 'calendar',
      label: 'Service',
      icon: Calendar,
      path: '/calendar'
    },
    {
      id: 'staff-scheduling',
      label: 'Staff',
      icon: CalendarDays,
      path: '/scheduling'
    },
    {
      id: 'more',
      label: 'More',
      icon: MoreHorizontal,
      path: ''
    }
  ];

  const moreMenuSections: MoreMenuSection[] = [
    {
      title: 'Operations',
      items: [
        { id: 'work-orders', label: 'Work Orders', icon: ClipboardList, path: '/work-orders', description: 'Manage work orders' },
        { id: 'service-board', label: 'Service Board', icon: ClipboardCheck, path: '/service-board', description: 'Visual service workflow' },
        { id: 'quotes', label: 'Quotes', icon: FileText, path: '/quotes', description: 'Estimates and quotes' },
        { id: 'invoices', label: 'Invoices', icon: Receipt, path: '/invoices', description: 'View and manage invoices' },
        { id: 'payments', label: 'Payments', icon: DollarSign, path: '/payments', description: 'Payment processing' },
      ]
    },
    {
      title: 'Scheduling',
      items: [
        { id: 'service-reminders', label: 'Service Reminders', icon: Bell, path: '/service-reminders', description: 'Upcoming service alerts' },
        { id: 'timesheet', label: 'Timesheet', icon: Clock, path: '/timesheet', description: 'Track work hours' },
        { id: 'staff-scheduling', label: 'Staff Scheduling', icon: CalendarDays, path: '/scheduling', description: 'Manage staff schedules' },
      ]
    },
    {
      title: 'Fleet & Assets',
      items: [
        { id: 'customers', label: 'Customers', icon: Users, path: '/customers', description: 'Customer database' },
        { id: 'vehicles', label: 'Vehicles', icon: Truck, path: '/vehicles', description: 'Customer vehicles' },
        { id: 'fleet-management', label: 'Fleet Management', icon: Truck, path: '/fleet-management', description: 'Manage company vehicles' },
        { id: 'equipment', label: 'Equipment', icon: Package, path: '/equipment', description: 'Equipment list' },
        { id: 'equipment-management', label: 'Equipment Management', icon: Package, path: '/equipment-management', description: 'Manage equipment & tools' },
        { id: 'equipment-tracking', label: 'Equipment Tracking', icon: MapPin, path: '/equipment-tracking', description: 'Track equipment location' },
        { id: 'maintenance', label: 'Maintenance Requests', icon: Wrench, path: '/maintenance-requests', description: 'Track maintenance requests' },
        { id: 'inventory', label: 'Inventory', icon: Package, path: '/inventory', description: 'Parts and supplies' },
        { id: 'insurance', label: 'Insurance', icon: Shield, path: '/insurance', description: 'Fleet & equipment insurance' },
      ]
    },
    {
      title: 'Communications',
      items: [
        { id: 'chat', label: 'Team Chat', icon: MessageSquare, path: '/chat', description: 'Internal messaging' },
        { id: 'call-logger', label: 'Call Logger', icon: Phone, path: '/call-logger', description: 'Log phone calls' },
        { id: 'customer-comms', label: 'Customer Comms', icon: MessageCircle, path: '/customer-comms', description: 'Customer communications' },
        { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications', description: 'View all notifications' },
      ]
    },
    {
      title: 'Marketing',
      items: [
        { id: 'email-campaigns', label: 'Email Campaigns', icon: Mail, path: '/email-campaigns', description: 'Manage email campaigns' },
        { id: 'email-sequences', label: 'Email Sequences', icon: Send, path: '/email-sequences', description: 'Automated email flows' },
        { id: 'email-templates', label: 'Email Templates', icon: FileText, path: '/email-templates', description: 'Email templates' },
        { id: 'sms-management', label: 'SMS Management', icon: MessageCircle, path: '/sms-management', description: 'SMS campaigns' },
        { id: 'sms-templates', label: 'SMS Templates', icon: MessageSquare, path: '/sms-templates', description: 'SMS templates' },
      ]
    },
    {
      title: 'Safety & Compliance',
      items: [
        { id: 'safety', label: 'Safety Dashboard', icon: Shield, path: '/safety', description: 'Safety overview' },
        { id: 'safety-analytics', label: 'Analytics', icon: BarChart3, path: '/safety/analytics', description: 'Inspection trends & alerts' },
        { id: 'safety-scheduling', label: 'Schedules', icon: Calendar, path: '/safety/schedules', description: 'Schedules, QR codes & auto rules' },
        { id: 'safety-incidents', label: 'Incidents', icon: AlertTriangle, path: '/safety/incidents', description: 'Report & track incidents' },
        { id: 'safety-inspections', label: 'Daily Inspections', icon: ClipboardCheck, path: '/safety/inspections', description: 'Shop safety inspections' },
        { id: 'safety-dvir', label: 'DVIR Reports', icon: Truck, path: '/safety/dvir', description: 'Vehicle inspection reports' },
        { id: 'safety-vessels', label: 'Vessel Inspections', icon: Ship, path: '/safety/vessels', description: 'Marine vessel pre-trip checks' },
        { id: 'safety-forklift', label: 'Forklift Inspections', icon: HardHat, path: '/safety/equipment/forklift', description: 'Daily forklift safety checks' },
        { id: 'safety-equipment', label: 'Lift Inspections', icon: Package, path: '/safety/equipment', description: 'Equipment safety checks' },
        { id: 'safety-certifications', label: 'Certifications', icon: Award, path: '/safety/certifications', description: 'Staff certifications' },
      ]
    },
    {
      title: 'Services',
      items: [
        { id: 'services', label: 'Service Library', icon: Library, path: '/services', description: 'Service catalog' },
        { id: 'service-editor', label: 'Service Editor', icon: Edit3, path: '/service-editor', description: 'Edit services' },
        { id: 'repair-plans', label: 'Repair Plans', icon: ClipboardCopy, path: '/repair-plans', description: 'Repair plan templates' },
      ]
    },
    {
      title: 'Company',
      items: [
        { id: 'team', label: 'Team', icon: UserCog, path: '/team', description: 'Team management' },
        { id: 'company-profile', label: 'Company Profile', icon: Building2, path: '/company-profile', description: 'Company settings' },
        { id: 'training', label: 'Training', icon: GraduationCap, path: '/training-overview', description: 'Staff training' },
        { id: 'documents', label: 'Documents', icon: FolderOpen, path: '/documents', description: 'Document management' },
      ]
    },
    {
      title: 'Store',
      items: [
        { id: 'shopping', label: 'Shopping', icon: ShoppingCart, path: '/shopping', description: 'Browse products' },
        { id: 'wishlist', label: 'Wishlist', icon: Heart, path: '/wishlist', description: 'Saved items' },
        { id: 'orders', label: 'My Orders', icon: ShoppingBag, path: '/orders', description: 'Order history' },
      ]
    },
    {
      title: 'Tools',
      items: [
        { id: 'technician-portal', label: 'Technician Portal', icon: HardHat, path: '/technician-portal', description: 'Mobile technician interface' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics', description: 'Business insights' },
        { id: 'ai-hub', label: 'AI Hub', icon: Brain, path: '/ai-hub', description: 'AI-powered automation' },
        { id: 'forms', label: 'Forms', icon: FormInput, path: '/forms', description: 'Custom forms' },
        { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports', description: 'Analytics and reports' },
        { id: 'feedback', label: 'Feedback', icon: ThumbsUp, path: '/feedback', description: 'Customer feedback' },
      ]
    },
    {
      title: 'Account & Settings',
      items: [
        { id: 'profile', label: 'Profile', icon: User, path: '/profile', description: 'Your profile' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', description: 'App settings' },
        { id: 'help', label: 'Help', icon: HelpCircle, path: '/help', description: 'Help & support' },
      ]
    },
  ];

  const handleNavigation = (path: string) => {
    if (path) {
      navigate(path);
      setMoreOpen(false);
    }
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.path ? isActive(item.path) : false;
          
          if (item.id === 'more') {
            return (
              <Sheet key={item.id} open={moreOpen} onOpenChange={setMoreOpen}>
                <SheetTrigger asChild>
                  <button
                    className={cn(
                      "flex flex-col items-center justify-center min-w-0 flex-1 py-1 px-1 transition-colors relative",
                      moreOpen 
                        ? "text-primary" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="relative">
                      <Icon className="h-5 w-5 mb-1" />
                      {unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs"
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs font-medium truncate max-w-full">
                      {item.label}
                    </span>
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
                  <SheetHeader className="pb-4 border-b">
                    <SheetTitle>More Options</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-full pb-20">
                    <div className="py-4 space-y-6">
                      {moreMenuSections.map((section) => (
                        <div key={section.title}>
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                            {section.title}
                          </h3>
                          <div className="space-y-1">
                            {section.items.map((menuItem) => {
                              const MenuIcon = menuItem.icon;
                              const isMenuActive = isActive(menuItem.path);
                              
                              return (
                                <button
                                  key={menuItem.id}
                                  onClick={() => handleNavigation(menuItem.path)}
                                  className={cn(
                                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                                    isMenuActive 
                                      ? "bg-primary/10 text-primary" 
                                      : "hover:bg-muted"
                                  )}
                                >
                                  <MenuIcon className="h-5 w-5 flex-shrink-0" />
                                  <div className="flex-1 text-left">
                                    <div className="font-medium">{menuItem.label}</div>
                                    {menuItem.description && (
                                      <div className="text-xs text-muted-foreground">
                                        {menuItem.description}
                                      </div>
                                    )}
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            );
          }
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 py-1 px-1 transition-colors relative",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    "h-5 w-5 mb-1",
                    active && "text-primary"
                  )} 
                />
                {item.badge && item.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              <span className={cn(
                "text-xs font-medium truncate max-w-full",
                active && "text-primary"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
