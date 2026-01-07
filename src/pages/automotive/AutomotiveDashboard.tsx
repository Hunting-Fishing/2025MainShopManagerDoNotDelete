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
} from 'lucide-react';
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
    { label: 'Vehicles', icon: Car, onClick: () => navigate('/fleet') },
    { label: 'Parts', icon: Package, onClick: () => navigate('/inventory') },
    { label: 'Quotes', icon: FileText, onClick: () => navigate('/quotes'), color: 'text-amber-500', borderColor: 'border-amber-500/30', hoverBg: 'hover:bg-amber-500/5' },
    { label: 'Invoices', icon: Receipt, onClick: () => navigate('/invoices'), color: 'text-green-500', borderColor: 'border-green-500/30', hoverBg: 'hover:bg-green-500/5' },
    { label: 'Payments', icon: CreditCard, onClick: () => navigate('/payments'), color: 'text-emerald-500', borderColor: 'border-emerald-500/30', hoverBg: 'hover:bg-emerald-500/5' },
    { label: 'Appointments', icon: CalendarDays, onClick: () => navigate('/calendar'), color: 'text-blue-500', borderColor: 'border-blue-500/30', hoverBg: 'hover:bg-blue-500/5' },
    { label: 'History', icon: History, onClick: () => navigate('/automotive/vehicle-history'), color: 'text-purple-500', borderColor: 'border-purple-500/30', hoverBg: 'hover:bg-purple-500/5' },
    { label: 'Diagnostics', icon: Settings, onClick: () => navigate('/automotive/diagnostics'), color: 'text-cyan-500', borderColor: 'border-cyan-500/30', hoverBg: 'hover:bg-cyan-500/5' },
    { label: 'Labor Rates', icon: DollarSign, onClick: () => navigate('/automotive/labor-rates'), color: 'text-orange-500', borderColor: 'border-orange-500/30', hoverBg: 'hover:bg-orange-500/5' },
    { label: 'TSB & Recalls', icon: FileSearch, onClick: () => navigate('/automotive/recalls'), color: 'text-red-500', borderColor: 'border-red-500/30', hoverBg: 'hover:bg-red-500/5' },
    { label: 'Customers', icon: Users, onClick: () => navigate('/customers'), color: 'text-indigo-500', borderColor: 'border-indigo-500/30', hoverBg: 'hover:bg-indigo-500/5' },
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
