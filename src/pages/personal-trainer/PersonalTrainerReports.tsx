import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, Calendar, DollarSign, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import { useShopId } from '@/hooks/useShopId';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const COLORS = ['#f97316', '#ef4444', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

export default function PersonalTrainerReports() {
  const { shopId } = useShopId();

  // Revenue by month (last 6 months from invoices)
  const { data: revenueData = [], isLoading: revLoading } = useQuery({
    queryKey: ['pt-revenue-report', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        const start = startOfMonth(d).toISOString();
        const end = endOfMonth(d).toISOString();
        const { data } = await (supabase as any).from('pt_invoices')
          .select('total')
          .eq('shop_id', shopId)
          .eq('status', 'paid')
          .gte('paid_date', start)
          .lte('paid_date', end);
        const total = (data || []).reduce((s: number, r: any) => s + (r.total || 0), 0);
        months.push({ name: format(d, 'MMM'), revenue: total });
      }
      return months;
    },
    enabled: !!shopId,
  });

  // Session attendance stats
  const { data: sessionStats = { completed: 0, canceled: 0, noshow: 0, scheduled: 0 } } = useQuery({
    queryKey: ['pt-session-stats', shopId],
    queryFn: async () => {
      if (!shopId) return { completed: 0, canceled: 0, noshow: 0, scheduled: 0 };
      const { data } = await (supabase as any).from('pt_sessions')
        .select('status')
        .eq('shop_id', shopId);
      const stats = { completed: 0, canceled: 0, noshow: 0, scheduled: 0 };
      (data || []).forEach((s: any) => {
        if (s.status === 'completed') stats.completed++;
        else if (s.status === 'canceled') stats.canceled++;
        else if (s.status === 'no_show') stats.noshow++;
        else stats.scheduled++;
      });
      return stats;
    },
    enabled: !!shopId,
  });

  // Client stats
  const { data: clientStats = { active: 0, inactive: 0, total: 0 } } = useQuery({
    queryKey: ['pt-client-stats', shopId],
    queryFn: async () => {
      if (!shopId) return { active: 0, inactive: 0, total: 0 };
      const { data } = await (supabase as any).from('pt_clients').select('membership_status').eq('shop_id', shopId);
      const active = (data || []).filter((c: any) => c.membership_status === 'active').length;
      return { active, inactive: (data || []).length - active, total: (data || []).length };
    },
    enabled: !!shopId,
  });

  // Expiring packages
  const { data: expiringPkgs = [] } = useQuery({
    queryKey: ['pt-expiring-packages', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const inTwoWeeks = new Date();
      inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);
      const { data } = await (supabase as any).from('pt_client_packages')
        .select('*, pt_clients(first_name, last_name), pt_packages(name)')
        .eq('shop_id', shopId)
        .eq('status', 'active')
        .lte('end_date', inTwoWeeks.toISOString())
        .order('end_date');
      return data || [];
    },
    enabled: !!shopId,
  });

  const sessionPieData = [
    { name: 'Completed', value: sessionStats.completed },
    { name: 'Canceled', value: sessionStats.canceled },
    { name: 'No Show', value: sessionStats.noshow },
    { name: 'Scheduled', value: sessionStats.scheduled },
  ].filter(d => d.value > 0);

  const totalSessions = sessionStats.completed + sessionStats.canceled + sessionStats.noshow + sessionStats.scheduled;
  const attendanceRate = totalSessions > 0 ? Math.round((sessionStats.completed / totalSessions) * 100) : 0;
  const retentionRate = clientStats.total > 0 ? Math.round((clientStats.active / clientStats.total) * 100) : 0;
  const totalRevenue = revenueData.reduce((s, r) => s + r.revenue, 0);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground text-sm">Revenue, attendance, and retention insights</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'from-green-500 to-emerald-600' },
          { label: 'Attendance Rate', value: `${attendanceRate}%`, icon: Calendar, color: 'from-orange-500 to-red-500' },
          { label: 'Client Retention', value: `${retentionRate}%`, icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
          { label: 'Active Clients', value: clientStats.active, icon: Users, color: 'from-violet-500 to-purple-600' },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${s.color} shadow-lg`}>
                <s.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="border-0 shadow-md">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5 text-orange-500" />Monthly Revenue</CardTitle></CardHeader>
          <CardContent>
            {revLoading ? <div className="h-64 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip formatter={(v: number) => [`$${v}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#f97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Session Breakdown */}
        <Card className="border-0 shadow-md">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Calendar className="h-5 w-5 text-orange-500" />Session Breakdown</CardTitle></CardHeader>
          <CardContent>
            {sessionPieData.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-16">No session data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={sessionPieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {sessionPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Expiring Packages */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Expiring Packages (Next 14 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expiringPkgs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No packages expiring soon</p>
          ) : (
            <div className="space-y-2">
              {expiringPkgs.map((pkg: any) => (
                <div key={pkg.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{pkg.pt_clients?.first_name} {pkg.pt_clients?.last_name}</p>
                    <p className="text-xs text-muted-foreground">{pkg.pt_packages?.name}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive" className="text-xs">
                      Expires {format(new Date(pkg.end_date), 'MMM d')}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{pkg.remaining_sessions} sessions left</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
