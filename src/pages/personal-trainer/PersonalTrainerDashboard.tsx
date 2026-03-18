import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dumbbell, Calendar, DollarSign, Users, Plus, ClipboardList, Activity, Package, Target, UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShopId } from '@/hooks/useShopId';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function PersonalTrainerDashboard() {
  const navigate = useNavigate();
  const { shopId } = useShopId();

  const { data: clientCount = 0 } = useQuery({
    queryKey: ['pt-client-count', shopId],
    queryFn: async () => {
      if (!shopId) return 0;
      const { count } = await (supabase as any).from('pt_clients').select('*', { count: 'exact', head: true }).eq('shop_id', shopId).eq('membership_status', 'active');
      return count || 0;
    },
    enabled: !!shopId,
  });

  const { data: todaySessions = [] } = useQuery({
    queryKey: ['pt-today-sessions', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const today = new Date().toISOString().split('T')[0];
      const { data } = await (supabase as any).from('pt_sessions')
        .select('*, pt_clients(first_name, last_name)')
        .eq('shop_id', shopId)
        .gte('session_date', today + 'T00:00:00')
        .lte('session_date', today + 'T23:59:59')
        .order('session_date');
      return data || [];
    },
    enabled: !!shopId,
  });

  const { data: programCount = 0 } = useQuery({
    queryKey: ['pt-program-count', shopId],
    queryFn: async () => {
      if (!shopId) return 0;
      const { count } = await (supabase as any).from('pt_workout_programs').select('*', { count: 'exact', head: true }).eq('shop_id', shopId);
      return count || 0;
    },
    enabled: !!shopId,
  });

  const { data: activePackages = 0 } = useQuery({
    queryKey: ['pt-active-packages', shopId],
    queryFn: async () => {
      if (!shopId) return 0;
      const { count } = await (supabase as any).from('pt_packages').select('*', { count: 'exact', head: true }).eq('shop_id', shopId).eq('is_active', true);
      return count || 0;
    },
    enabled: !!shopId,
  });

  const stats = [
    { label: 'Active Clients', value: clientCount, icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: "Today's Sessions", value: todaySessions.length, icon: Calendar, color: 'from-orange-500 to-red-500' },
    { label: 'Programs', value: programCount, icon: ClipboardList, color: 'from-violet-500 to-purple-600' },
    { label: 'Active Packages', value: activePackages, icon: Package, color: 'from-emerald-500 to-teal-500' },
  ];

  const quickActions = [
    { label: 'Add Client', icon: UserPlus, onClick: () => navigate('/personal-trainer/clients'), color: 'from-blue-500 to-cyan-500' },
    { label: 'Book Session', icon: Calendar, onClick: () => navigate('/personal-trainer/sessions'), color: 'from-orange-500 to-red-500' },
    { label: 'New Program', icon: ClipboardList, onClick: () => navigate('/personal-trainer/programs'), color: 'from-violet-500 to-purple-600' },
    { label: 'Exercises', icon: Target, onClick: () => navigate('/personal-trainer/exercises'), color: 'from-pink-500 to-rose-500' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Personal Trainer
          </h1>
          <p className="text-muted-foreground mt-1">Manage your clients, sessions, and programs</p>
        </div>
        <Button onClick={() => navigate('/personal-trainer/clients')} className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          New Client
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <Button key={action.label} variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:shadow-md transition-all" onClick={action.onClick}>
            <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Today's Sessions */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-orange-500" />
            Today's Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todaySessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Dumbbell className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No sessions scheduled for today</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/personal-trainer/sessions')}>
                Book a Session
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySessions.map((session: any) => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                      <Dumbbell className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {session.pt_clients?.first_name} {session.pt_clients?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.session_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {session.duration_minutes}min · {session.session_type?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <Badge variant={session.status === 'completed' ? 'default' : session.status === 'canceled' ? 'destructive' : 'secondary'}>
                    {session.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
