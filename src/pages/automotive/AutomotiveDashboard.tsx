import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Car, FileText, Plus, ClipboardList, Package, Receipt, CreditCard, CalendarDays,
  Wrench, History, AlertTriangle, Settings, DollarSign, Clock, Calendar, Users,
  Truck, FileSearch, MessageSquare, Megaphone, Briefcase, Shield, Building2,
  ShoppingCart, Hammer, ChevronRight, AlertCircle, CheckCircle2, XCircle, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAutomotiveStats, useAutomotiveWorkOrders, useAutomotiveAppointments } from '@/hooks/useAutomotiveStats';
import { AutomotiveHero } from '@/components/automotive/dashboard/AutomotiveHero';
import { BentoStatCard } from '@/components/automotive/dashboard/BentoStatCard';
import { CategoryTile } from '@/components/automotive/dashboard/CategoryTile';

export default function AutomotiveDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useAutomotiveStats();
  const { data: recentWorkOrders, isLoading: workOrdersLoading } = useAutomotiveWorkOrders();
  const { data: upcomingAppointments, isLoading: appointmentsLoading } = useAutomotiveAppointments();

  const openJobs = (stats?.pendingJobs || 0) + (stats?.inProgressJobs || 0) + (stats?.awaitingPartsJobs || 0);

  const statCards = [
    { title: 'Revenue (MTD)', value: `$${(stats?.revenue || 0).toLocaleString()}`, icon: DollarSign, gradient: 'from-emerald-500 to-teal-600', featured: true, hint: 'Month-to-date earnings' },
    { title: 'Pending Jobs', value: stats?.pendingJobs ?? 0, icon: ClipboardList, gradient: 'from-amber-500 to-orange-600' },
    { title: 'In Progress', value: stats?.inProgressJobs ?? 0, icon: Wrench, gradient: 'from-blue-500 to-indigo-600' },
    { title: 'Awaiting Parts', value: stats?.awaitingPartsJobs ?? 0, icon: Package, gradient: 'from-yellow-500 to-amber-600' },
    { title: 'Completed (MTD)', value: stats?.completedJobs ?? 0, icon: CheckCircle2, gradient: 'from-green-500 to-emerald-600' },
    { title: "Today's Appts", value: stats?.todayAppointments ?? 0, icon: Clock, gradient: 'from-purple-500 to-fuchsia-600' },
    { title: 'Overdue Invoices', value: stats?.overdueInvoices ?? 0, icon: AlertTriangle, gradient: 'from-red-500 to-rose-600' },
    { title: 'Low Stock', value: stats?.lowStockParts ?? 0, icon: Package, gradient: 'from-orange-500 to-red-600' },
  ];

  const alerts: Array<{ type: 'warning' | 'critical'; message: string; onClick: () => void }> = [];
  if (stats?.lowStockParts && stats.lowStockParts > 0) {
    alerts.push({ type: 'warning', message: `${stats.lowStockParts} part(s) running low on stock`, onClick: () => navigate('/inventory') });
  }
  if (stats?.overdueInvoices && stats.overdueInvoices > 0) {
    alerts.push({ type: 'critical', message: `${stats.overdueInvoices} invoice(s) are overdue`, onClick: () => navigate('/invoices') });
  }

  const quickActions = [
    { label: 'All Jobs', icon: ClipboardList, onClick: () => navigate('/work-orders') },
    { label: 'Vehicles', icon: Car, onClick: () => navigate('/vehicles') },
    { label: 'Parts', icon: Package, onClick: () => navigate('/inventory') },
    { label: 'Quotes', icon: FileText, onClick: () => navigate('/quotes') },
    { label: 'Invoices', icon: Receipt, onClick: () => navigate('/invoices') },
    { label: 'Payments', icon: CreditCard, onClick: () => navigate('/payments') },
    { label: 'Appointments', icon: CalendarDays, onClick: () => navigate('/booking-management') },
    { label: 'History', icon: History, onClick: () => navigate('/automotive/vehicle-history') },
    { label: 'Diagnostics', icon: Settings, onClick: () => navigate('/automotive/diagnostics') },
    { label: 'Labor Rates', icon: DollarSign, onClick: () => navigate('/automotive/labor-rates') },
    { label: 'TSB & Recalls', icon: FileSearch, onClick: () => navigate('/automotive/recalls') },
    { label: 'Customers', icon: Users, onClick: () => navigate('/customers') },
  ];

  const categoryTiles = [
    { label: 'Services', icon: Briefcase, href: '/work-orders', gradient: 'from-blue-500 to-indigo-600', description: 'Jobs, quotes & invoices' },
    { label: 'Customers', icon: Users, href: '/customers', gradient: 'from-indigo-500 to-purple-600', description: 'Customer management' },
    { label: 'Inventory', icon: Package, href: '/inventory', gradient: 'from-amber-500 to-orange-600', description: 'Parts & stock' },
    { label: 'Scheduling', icon: CalendarDays, href: '/booking-management', gradient: 'from-purple-500 to-fuchsia-600', description: 'Appointments & calendar' },
    { label: 'Communications', icon: MessageSquare, href: '/customer-comms', gradient: 'from-cyan-500 to-blue-600', description: 'Customer messaging' },
    { label: 'Marketing', icon: Megaphone, href: '/email-campaigns', gradient: 'from-pink-500 to-rose-600', description: 'Campaigns & SMS' },
    { label: 'Operations', icon: ClipboardList, href: '/daily-logs', gradient: 'from-green-500 to-emerald-600', description: 'Daily logs & service board' },
    { label: 'Equipment & Tools', icon: Hammer, href: '/equipment', gradient: 'from-orange-500 to-red-600', description: 'Shop equipment' },
    { label: 'Fleet Operations', icon: Truck, href: '/fleet-management', gradient: 'from-teal-500 to-cyan-600', description: 'Fleet & vehicles' },
    { label: 'Safety & Compliance', icon: Shield, href: '/safety', gradient: 'from-red-500 to-rose-600', description: 'Inspections & safety' },
    { label: 'Company', icon: Building2, href: '/company-profile', gradient: 'from-slate-500 to-zinc-700', description: 'Business settings' },
    { label: 'Store', icon: ShoppingCart, href: '/shopping', gradient: 'from-emerald-500 to-green-600', description: 'Shop & products' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-zinc-950">
      <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-6 lg:p-8">
        <AutomotiveHero
          openJobs={openJobs}
          todayAppointments={stats?.todayAppointments || 0}
          revenueMTD={stats?.revenue || 0}
          onNewWorkOrder={() => navigate('/work-orders/new')}
          onNewQuote={() => navigate('/quotes/new')}
        />

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {alerts.map((alert, i) => (
              <button
                key={i}
                onClick={alert.onClick}
                className={cn(
                  'group flex flex-1 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all hover:shadow-md',
                  alert.type === 'critical'
                    ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200'
                    : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200',
                )}
              >
                {alert.type === 'critical' ? <XCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                <span className="flex-1 text-sm font-medium">{alert.message}</span>
                <ChevronRight className="h-4 w-4 opacity-50 transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        )}

        {/* Bento Stats */}
        <section>
          <SectionHeader title="At a Glance" subtitle="Live operational metrics" icon={Sparkles} />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {statsLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={cn('h-32 animate-pulse rounded-2xl bg-muted', i === 0 && 'md:col-span-2')} />
                ))
              : statCards.map((s, i) => (
                  <BentoStatCard key={s.title} {...s} delay={i * 40} />
                ))}
          </div>
        </section>

        {/* Quick Actions Rail */}
        <section>
          <SectionHeader title="Quick Actions" subtitle="One-tap shortcuts" icon={Wrench} />
          <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="group flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-md"
                >
                  <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Category Bento */}
        <section>
          <SectionHeader title="Workspaces" subtitle="Jump into any area" icon={Briefcase} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 md:gap-4">
            {categoryTiles.map((c, i) => (
              <CategoryTile
                key={c.label}
                label={c.label}
                description={c.description}
                icon={c.icon}
                gradient={c.gradient}
                onClick={() => navigate(c.href)}
                delay={i * 30}
              />
            ))}
          </div>
        </section>

        {/* Activity */}
        <section className="grid gap-4 lg:grid-cols-2">
          <ActivityCard
            title="Recent Work Orders"
            icon={Wrench}
            isLoading={workOrdersLoading}
            emptyMessage="No work orders yet"
            emptyAction={{ label: 'Create your first work order', onClick: () => navigate('/work-orders/new') }}
            viewAll={() => navigate('/work-orders')}
            items={(recentWorkOrders || []).map((wo: any) => ({
              id: wo.id,
              title: wo.work_order_number || 'N/A',
              subtitle: `${wo.customers?.first_name || ''} ${wo.customers?.last_name || ''} · ${wo.vehicles?.year || ''} ${wo.vehicles?.make || ''} ${wo.vehicles?.model || ''}`.trim(),
              badge: wo.status?.replace('_', ' ') || 'pending',
              badgeVariant: wo.status === 'completed' ? 'default' as const : wo.status === 'in_progress' ? 'secondary' as const : 'outline' as const,
              onClick: () => navigate(`/work-orders/${wo.id}`),
            }))}
          />
          <ActivityCard
            title="Upcoming Appointments"
            icon={CalendarDays}
            isLoading={appointmentsLoading}
            emptyMessage="No upcoming appointments"
            emptyAction={{ label: 'Schedule an appointment', onClick: () => navigate('/calendar') }}
            viewAll={() => navigate('/calendar')}
            items={(upcomingAppointments || []).map((appt: any) => ({
              id: appt.id,
              title: `${appt.customers?.first_name || ''} ${appt.customers?.last_name || ''}`.trim() || 'Unknown',
              subtitle: `${appt.vehicles?.year || ''} ${appt.vehicles?.make || ''} ${appt.vehicles?.model || ''}`.trim() || 'No vehicle',
              meta: appt.date ? format(new Date(appt.date), 'MMM d, h:mm a') : '',
              badge: appt.status?.replace('_', ' ') || 'scheduled',
              badgeVariant: 'outline' as const,
              onClick: () => navigate('/calendar'),
            }))}
          />
        </section>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  meta?: string;
  badge: string;
  badgeVariant: 'default' | 'secondary' | 'outline';
  onClick: () => void;
}

function ActivityCard({
  title, icon: Icon, items, isLoading, emptyMessage, emptyAction, viewAll,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: ActivityItem[];
  isLoading: boolean;
  emptyMessage: string;
  emptyAction: { label: string; onClick: () => void };
  viewAll: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-heading text-base font-semibold">{title}</h3>
        </div>
        <Button size="sm" variant="ghost" onClick={viewAll} className="h-7 text-xs">
          View all <ChevronRight className="ml-1 h-3 w-3" />
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />)}</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <Icon className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          <Button size="sm" variant="outline" onClick={emptyAction.onClick}>{emptyAction.label}</Button>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={item.onClick}
                className="group flex w-full items-center gap-3 rounded-xl border border-transparent p-3 text-left transition-all hover:border-border hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
                </div>
                {item.meta && <span className="shrink-0 text-xs text-muted-foreground">{item.meta}</span>}
                <Badge variant={item.badgeVariant} className="shrink-0 capitalize">{item.badge}</Badge>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
