import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Car,
  FileText,
  Plus,
  ClipboardList,
  Package,
  Receipt,
  CreditCard,
  CalendarDays,
  Wrench,
  History,
  AlertTriangle,
  Settings,
  DollarSign,
  Clock,
  Calendar,
  Users,
  Truck,
  FileSearch,
  MessageSquare,
  Megaphone,
  Briefcase,
  Shield,
  Building2,
  ShoppingCart,
  Hammer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ModuleDashboardHeader,
  ModuleDashboardStats,
  ModuleDashboardAlerts,
  ModuleDashboardQuickActions,
  ModuleDashboardRecentActivity,
} from '@/components/module-dashboard';
import { useAutomotiveStats, useAutomotiveWorkOrders, useAutomotiveAppointments } from '@/hooks/useAutomotiveStats';

export default function AutomotiveDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useAutomotiveStats();
  const { data: recentWorkOrders, isLoading: workOrdersLoading } = useAutomotiveWorkOrders();
  const { data: upcomingAppointments, isLoading: appointmentsLoading } = useAutomotiveAppointments();

  const statCards = [
    {
      title: 'Pending Jobs',
      value: stats?.pendingJobs || 0,
      icon: ClipboardList,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'In Progress',
      value: stats?.inProgressJobs || 0,
      icon: Wrench,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Awaiting Parts',
      value: stats?.awaitingPartsJobs || 0,
      icon: Package,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Completed (MTD)',
      value: stats?.completedJobs || 0,
      icon: Calendar,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Revenue (MTD)',
      value: `$${(stats?.revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: "Today's Appointments",
      value: stats?.todayAppointments || 0,
      icon: Clock,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Overdue Invoices',
      value: stats?.overdueInvoices || 0,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Low Stock Parts',
      value: stats?.lowStockParts || 0,
      icon: Package,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  const alerts = [];
  if (stats?.lowStockParts && stats.lowStockParts > 0) {
    alerts.push({
      type: 'warning' as const,
      message: `${stats.lowStockParts} part(s) running low on stock`,
      action: () => navigate('/inventory'),
    });
  }
  if (stats?.overdueInvoices && stats.overdueInvoices > 0) {
    alerts.push({
      type: 'critical' as const,
      message: `${stats.overdueInvoices} invoice(s) are overdue`,
      action: () => navigate('/invoices'),
    });
  }

  const quickActions = [
    { label: 'All Jobs', icon: ClipboardList, onClick: () => navigate('/work-orders') },
    { label: 'Vehicles', icon: Car, onClick: () => navigate('/vehicles') },
    { label: 'Parts', icon: Package, onClick: () => navigate('/inventory') },
    { label: 'Quotes', icon: FileText, onClick: () => navigate('/quotes'), color: 'text-amber-500', borderColor: 'border-amber-500/30', hoverBg: 'hover:bg-amber-500/5' },
    { label: 'Invoices', icon: Receipt, onClick: () => navigate('/invoices'), color: 'text-green-500', borderColor: 'border-green-500/30', hoverBg: 'hover:bg-green-500/5' },
    { label: 'Payments', icon: CreditCard, onClick: () => navigate('/payments'), color: 'text-emerald-500', borderColor: 'border-emerald-500/30', hoverBg: 'hover:bg-emerald-500/5' },
    { label: 'Appointments', icon: CalendarDays, onClick: () => navigate('/booking-management'), color: 'text-blue-500', borderColor: 'border-blue-500/30', hoverBg: 'hover:bg-blue-500/5' },
    { label: 'History', icon: History, onClick: () => navigate('/automotive/vehicle-history'), color: 'text-purple-500', borderColor: 'border-purple-500/30', hoverBg: 'hover:bg-purple-500/5' },
    { label: 'Diagnostics', icon: Settings, onClick: () => navigate('/automotive/diagnostics'), color: 'text-cyan-500', borderColor: 'border-cyan-500/30', hoverBg: 'hover:bg-cyan-500/5' },
    { label: 'Labor Rates', icon: DollarSign, onClick: () => navigate('/automotive/labor-rates'), color: 'text-orange-500', borderColor: 'border-orange-500/30', hoverBg: 'hover:bg-orange-500/5' },
    { label: 'TSB & Recalls', icon: FileSearch, onClick: () => navigate('/automotive/recalls'), color: 'text-red-500', borderColor: 'border-red-500/30', hoverBg: 'hover:bg-red-500/5' },
    { label: 'Customers', icon: Users, onClick: () => navigate('/customers'), color: 'text-indigo-500', borderColor: 'border-indigo-500/30', hoverBg: 'hover:bg-indigo-500/5' },
  ];

  // Category navigation tiles
  const categoryTiles = [
    { label: 'Services', icon: Briefcase, href: '/work-orders', color: 'bg-blue-500', description: 'Jobs, quotes & invoices' },
    { label: 'Customers', icon: Users, href: '/customers', color: 'bg-indigo-500', description: 'Customer management' },
    { label: 'Inventory', icon: Package, href: '/inventory', color: 'bg-amber-500', description: 'Parts & stock' },
    { label: 'Scheduling', icon: CalendarDays, href: '/booking-management', color: 'bg-purple-500', description: 'Appointments & calendar' },
    { label: 'Communications', icon: MessageSquare, href: '/customer-comms', color: 'bg-cyan-500', description: 'Customer messaging' },
    { label: 'Marketing', icon: Megaphone, href: '/email-campaigns', color: 'bg-pink-500', description: 'Campaigns & SMS' },
    { label: 'Operations', icon: ClipboardList, href: '/daily-logs', color: 'bg-green-500', description: 'Daily logs & service board' },
    { label: 'Equipment & Tools', icon: Hammer, href: '/equipment', color: 'bg-orange-500', description: 'Shop equipment' },
    { label: 'Fleet Operations', icon: Truck, href: '/fleet-management', color: 'bg-teal-500', description: 'Fleet & vehicles' },
    { label: 'Safety & Compliance', icon: Shield, href: '/safety', color: 'bg-red-500', description: 'Inspections & safety' },
    { label: 'Company', icon: Building2, href: '/company-profile', color: 'bg-slate-500', description: 'Business settings' },
    { label: 'Store', icon: ShoppingCart, href: '/shopping', color: 'bg-emerald-500', description: 'Shop & products' },
  ];

  const leftPanelItems = (recentWorkOrders || []).map((wo: any) => ({
    id: wo.id,
    title: wo.work_order_number || 'N/A',
    subtitle: `${wo.customers?.first_name || ''} ${wo.customers?.last_name || ''} - ${wo.vehicles?.year || ''} ${wo.vehicles?.make || ''} ${wo.vehicles?.model || ''}`.trim(),
    badge: {
      text: wo.status?.replace('_', ' ') || 'pending',
      variant: wo.status === 'completed' ? 'default' as const : wo.status === 'in_progress' ? 'secondary' as const : 'outline' as const,
    },
    onClick: () => navigate(`/work-orders/${wo.id}`),
  }));

  const rightPanelItems = (upcomingAppointments || []).map((appt: any) => ({
    id: appt.id,
    title: `${appt.customers?.first_name || ''} ${appt.customers?.last_name || ''}`.trim() || 'Unknown',
    subtitle: `${appt.vehicles?.year || ''} ${appt.vehicles?.make || ''} ${appt.vehicles?.model || ''}`.trim() || 'No vehicle',
    badge: {
      text: appt.status?.replace('_', ' ') || 'scheduled',
      variant: 'outline' as const,
    },
    meta: appt.date ? format(new Date(appt.date), 'MMM d, yyyy h:mm a') : '',
    onClick: () => navigate('/calendar'),
  }));

  return (
    <div className="min-h-screen bg-background p-6">
      <ModuleDashboardHeader
        icon={Car}
        iconColor="text-blue-600"
        title="Automotive Repair"
        description="Full-service auto repair shop management"
        actions={[
          { label: 'New Quote', icon: FileText, onClick: () => navigate('/quotes/new'), variant: 'outline' },
          { label: 'New Work Order', icon: Plus, onClick: () => navigate('/work-orders/new') },
        ]}
      />

      <ModuleDashboardAlerts alerts={alerts} />

      <ModuleDashboardStats stats={statCards} isLoading={statsLoading} />

      <ModuleDashboardQuickActions actions={quickActions} />

      {/* Category Navigation Tiles */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Categories</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categoryTiles.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.label}
                onClick={() => navigate(category.href)}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-xl border bg-card",
                  "hover:shadow-lg hover:scale-105 transition-all duration-200",
                  "group cursor-pointer"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
                  category.color
                )}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium text-center">{category.label}</span>
                <span className="text-xs text-muted-foreground text-center mt-1 hidden sm:block">
                  {category.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <ModuleDashboardRecentActivity
        leftPanel={{
          title: 'Recent Work Orders',
          items: leftPanelItems,
          isLoading: workOrdersLoading,
          emptyIcon: Wrench,
          emptyMessage: 'No work orders yet',
          emptyActionLabel: 'Create your first work order',
          emptyActionOnClick: () => navigate('/work-orders/new'),
          viewAllOnClick: () => navigate('/work-orders'),
        }}
        rightPanel={{
          title: 'Upcoming Appointments',
          items: rightPanelItems,
          isLoading: appointmentsLoading,
          emptyIcon: CalendarDays,
          emptyMessage: 'No upcoming appointments',
          emptyActionLabel: 'Schedule an appointment',
          emptyActionOnClick: () => navigate('/calendar'),
          viewAllOnClick: () => navigate('/calendar'),
        }}
      />
    </div>
  );
}
