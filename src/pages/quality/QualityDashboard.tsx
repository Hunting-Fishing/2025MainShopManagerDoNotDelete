import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, AlertTriangle, ClipboardCheck } from 'lucide-react';

export default function QualityDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['quality-dashboard'],
    queryFn: async () => {
      const [
        { count: checklistCount },
        { count: checkCount },
        { count: nonconformanceCount },
        { count: capaCount },
      ] = await Promise.all([
        supabase.from('quality_checklists' as any).select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('quality_checks' as any).select('*', { count: 'exact', head: true }),
        supabase.from('nonconformances' as any).select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('capa_actions' as any).select('*', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
      ]);

      return {
        checklists: checklistCount || 0,
        checks: checkCount || 0,
        nonconformances: nonconformanceCount || 0,
        capaOpen: capaCount || 0,
      };
    }
  });

  const metrics = [
    { title: 'Active Checklists', value: data?.checklists ?? 0, icon: ClipboardCheck },
    { title: 'Quality Checks', value: data?.checks ?? 0, icon: ShieldCheck },
    { title: 'Open Nonconformances', value: data?.nonconformances ?? 0, icon: AlertTriangle },
    { title: 'Open CAPA Actions', value: data?.capaOpen ?? 0, icon: AlertTriangle },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quality Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor quality checkpoints, nonconformances, and CAPA progress.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? '—' : metric.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
