import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, ClipboardList, Calendar, Activity, ClipboardCheck, CreditCard, Loader2, Mail, Phone, AlertCircle } from 'lucide-react';
import { useShopId } from '@/hooks/useShopId';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function PersonalTrainerClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { shopId } = useShopId();

  const { data: client, isLoading } = useQuery({
    queryKey: ['pt-client-detail', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await (supabase as any).from('pt_clients').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['pt-client-programs', id, shopId],
    queryFn: async () => {
      if (!id || !shopId) return [];
      const { data } = await (supabase as any).from('pt_client_programs')
        .select('*, pt_workout_programs(name, difficulty_level, duration_weeks)')
        .eq('client_id', id).eq('shop_id', shopId).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!id && !!shopId,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['pt-client-sessions', id, shopId],
    queryFn: async () => {
      if (!id || !shopId) return [];
      const { data } = await (supabase as any).from('pt_sessions')
        .select('*').eq('client_id', id).eq('shop_id', shopId).order('session_date', { ascending: false }).limit(20);
      return data || [];
    },
    enabled: !!id && !!shopId,
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['pt-client-metrics', id, shopId],
    queryFn: async () => {
      if (!id || !shopId) return [];
      const { data } = await (supabase as any).from('pt_body_metrics')
        .select('*').eq('client_id', id).eq('shop_id', shopId).order('measurement_date', { ascending: false }).limit(20);
      return data || [];
    },
    enabled: !!id && !!shopId,
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ['pt-client-checkins', id, shopId],
    queryFn: async () => {
      if (!id || !shopId) return [];
      const { data } = await (supabase as any).from('pt_check_ins')
        .select('*').eq('client_id', id).eq('shop_id', shopId).order('check_in_date', { ascending: false }).limit(20);
      return data || [];
    },
    enabled: !!id && !!shopId,
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['pt-client-packages', id, shopId],
    queryFn: async () => {
      if (!id || !shopId) return [];
      const { data } = await (supabase as any).from('pt_client_packages')
        .select('*, pt_packages(name, price)').eq('client_id', id).eq('shop_id', shopId).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!id && !!shopId,
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!client) return <div className="p-6 text-center"><p className="text-muted-foreground">Client not found</p></div>;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/personal-trainer/clients')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{client.first_name} {client.last_name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={client.membership_status === 'active' ? 'default' : 'destructive'}>{client.membership_status}</Badge>
            <Badge variant="secondary">{client.fitness_level}</Badge>
            {client.membership_type && <Badge variant="outline">{client.membership_type}</Badge>}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4 flex flex-wrap gap-6">
          {client.email && <span className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" />{client.email}</span>}
          {client.phone && <span className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" />{client.phone}</span>}
          {client.date_of_birth && <span className="text-sm text-muted-foreground">DOB: {format(new Date(client.date_of_birth), 'MMM d, yyyy')}</span>}
          {client.emergency_contact && <span className="flex items-center gap-2 text-sm"><AlertCircle className="h-4 w-4 text-red-500" />{client.emergency_contact} {client.emergency_phone && `· ${client.emergency_phone}`}</span>}
        </CardContent>
      </Card>

      {/* Goals & Health */}
      {(client.goals || client.health_conditions || client.injuries) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {client.goals && (
            <Card><CardContent className="p-4"><p className="text-xs font-medium text-muted-foreground mb-1">Goals</p><p className="text-sm">{client.goals}</p></CardContent></Card>
          )}
          {client.health_conditions && (
            <Card><CardContent className="p-4"><p className="text-xs font-medium text-muted-foreground mb-1">Health Conditions</p><p className="text-sm">{client.health_conditions}</p></CardContent></Card>
          )}
          {client.injuries && (
            <Card><CardContent className="p-4"><p className="text-xs font-medium text-muted-foreground mb-1">Injuries</p><p className="text-sm">{client.injuries}</p></CardContent></Card>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="programs">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="programs" className="text-xs"><ClipboardList className="h-3 w-3 mr-1" />Programs</TabsTrigger>
          <TabsTrigger value="sessions" className="text-xs"><Calendar className="h-3 w-3 mr-1" />Sessions</TabsTrigger>
          <TabsTrigger value="metrics" className="text-xs"><Activity className="h-3 w-3 mr-1" />Metrics</TabsTrigger>
          <TabsTrigger value="checkins" className="text-xs"><ClipboardCheck className="h-3 w-3 mr-1" />Check-ins</TabsTrigger>
          <TabsTrigger value="billing" className="text-xs"><CreditCard className="h-3 w-3 mr-1" />Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="mt-4 space-y-3">
          {programs.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No programs assigned</p> : programs.map((p: any) => (
            <Card key={p.id}><CardContent className="p-4 flex items-center justify-between">
              <div><p className="font-medium text-sm">{p.pt_workout_programs?.name}</p><p className="text-xs text-muted-foreground">{p.pt_workout_programs?.difficulty_level} · {p.pt_workout_programs?.duration_weeks}w</p></div>
              <div className="text-right"><Badge variant={p.status === 'active' ? 'default' : 'secondary'}>{p.status}</Badge>{p.start_date && <p className="text-xs text-muted-foreground mt-1">Started {format(new Date(p.start_date), 'MMM d')}</p>}</div>
            </CardContent></Card>
          ))}
        </TabsContent>

        <TabsContent value="sessions" className="mt-4 space-y-3">
          {sessions.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No sessions yet</p> : sessions.map((s: any) => (
            <Card key={s.id}><CardContent className="p-4 flex items-center justify-between">
              <div><p className="font-medium text-sm">{s.session_type?.replace('_', ' ')}</p><p className="text-xs text-muted-foreground">{format(new Date(s.session_date), 'MMM d, yyyy h:mm a')} · {s.duration_minutes}min</p>{s.session_notes && <p className="text-xs text-muted-foreground mt-1">{s.session_notes}</p>}</div>
              <Badge variant={s.status === 'completed' ? 'default' : s.status === 'canceled' ? 'destructive' : 'secondary'}>{s.status}</Badge>
            </CardContent></Card>
          ))}
        </TabsContent>

        <TabsContent value="metrics" className="mt-4 space-y-3">
          {metrics.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No metrics recorded</p> : metrics.map((m: any) => (
            <Card key={m.id}><CardContent className="p-4">
              <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">{format(new Date(m.measurement_date), 'MMM d, yyyy')}</p></div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {m.weight && <div><p className="text-xs text-muted-foreground">Weight</p><p className="font-semibold text-sm">{m.weight} lbs</p></div>}
                {m.body_fat_percentage && <div><p className="text-xs text-muted-foreground">Body Fat</p><p className="font-semibold text-sm">{m.body_fat_percentage}%</p></div>}
                {m.chest && <div><p className="text-xs text-muted-foreground">Chest</p><p className="font-semibold text-sm">{m.chest}"</p></div>}
                {m.waist && <div><p className="text-xs text-muted-foreground">Waist</p><p className="font-semibold text-sm">{m.waist}"</p></div>}
                {m.arms && <div><p className="text-xs text-muted-foreground">Arms</p><p className="font-semibold text-sm">{m.arms}"</p></div>}
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>

        <TabsContent value="checkins" className="mt-4 space-y-3">
          {checkIns.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No check-ins yet</p> : checkIns.map((ci: any) => (
            <Card key={ci.id}><CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{format(new Date(ci.check_in_date), 'MMM d, yyyy')}</p>
                <Badge variant={ci.status === 'reviewed' ? 'default' : 'secondary'}>{ci.status}</Badge>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {ci.weight && <div><p className="text-xs text-muted-foreground">Weight</p><p className="font-semibold text-sm">{ci.weight}</p></div>}
                {ci.mood && <div><p className="text-xs text-muted-foreground">Mood</p><p className="font-semibold text-sm capitalize">{ci.mood}</p></div>}
                {ci.sleep_hours && <div><p className="text-xs text-muted-foreground">Sleep</p><p className="font-semibold text-sm">{ci.sleep_hours}h</p></div>}
                {ci.energy_level && <div><p className="text-xs text-muted-foreground">Energy</p><p className="font-semibold text-sm">{ci.energy_level}/10</p></div>}
              </div>
              {ci.notes && <p className="text-xs text-muted-foreground mt-2">{ci.notes}</p>}
            </CardContent></Card>
          ))}
        </TabsContent>

        <TabsContent value="billing" className="mt-4 space-y-3">
          {packages.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No packages</p> : packages.map((pkg: any) => (
            <Card key={pkg.id}><CardContent className="p-4 flex items-center justify-between">
              <div><p className="font-medium text-sm">{pkg.pt_packages?.name}</p><p className="text-xs text-muted-foreground">{pkg.remaining_sessions} sessions remaining · ${pkg.pt_packages?.price}</p></div>
              <div className="text-right"><Badge variant={pkg.status === 'active' ? 'default' : 'secondary'}>{pkg.status}</Badge>{pkg.end_date && <p className="text-xs text-muted-foreground mt-1">Expires {format(new Date(pkg.end_date), 'MMM d')}</p>}</div>
            </CardContent></Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
