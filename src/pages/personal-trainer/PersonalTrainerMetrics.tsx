import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { useShopId } from '@/hooks/useShopId';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function PersonalTrainerMetrics() {
  const { shopId } = useShopId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [form, setForm] = useState({
    client_id: '', recorded_date: new Date().toISOString().split('T')[0],
    weight_kg: '', body_fat_percent: '', chest_cm: '', waist_cm: '', hips_cm: '', arm_cm: '', thigh_cm: '', notes: '',
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['pt-clients-list', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data } = await (supabase as any).from('pt_clients').select('id, first_name, last_name').eq('shop_id', shopId).order('first_name');
      return data || [];
    },
    enabled: !!shopId,
  });

  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ['pt-metrics', shopId, selectedClient],
    queryFn: async () => {
      if (!shopId) return [];
      let q = (supabase as any).from('pt_body_metrics').select('*, pt_clients(first_name, last_name)');
      if (selectedClient) q = q.eq('client_id', selectedClient);
      else {
        // Get all clients for this shop, then their metrics
        const { data: shopClients } = await (supabase as any).from('pt_clients').select('id').eq('shop_id', shopId);
        if (!shopClients?.length) return [];
        q = q.in('client_id', shopClients.map((c: any) => c.id));
      }
      const { data } = await q.order('recorded_date', { ascending: false }).limit(50);
      return data || [];
    },
    enabled: !!shopId,
  });

  const addMetric = useMutation({
    mutationFn: async () => {
      const payload: any = { client_id: form.client_id, recorded_date: form.recorded_date, notes: form.notes || null };
      if (form.weight_kg) payload.weight_kg = parseFloat(form.weight_kg);
      if (form.body_fat_percent) payload.body_fat_percent = parseFloat(form.body_fat_percent);
      if (form.chest_cm) payload.chest_cm = parseFloat(form.chest_cm);
      if (form.waist_cm) payload.waist_cm = parseFloat(form.waist_cm);
      if (form.hips_cm) payload.hips_cm = parseFloat(form.hips_cm);
      if (form.arm_cm) payload.arm_cm = parseFloat(form.arm_cm);
      if (form.thigh_cm) payload.thigh_cm = parseFloat(form.thigh_cm);
      const { error } = await (supabase as any).from('pt_body_metrics').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pt-metrics'] });
      toast({ title: 'Metrics recorded' });
      setDialogOpen(false);
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Body Metrics</h1>
          <p className="text-muted-foreground text-sm">Track client progress over time</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"><Plus className="h-4 w-4 mr-2" />Record Metrics</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Record Body Metrics</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Client *</Label>
                <Select value={form.client_id} onValueChange={v => setForm(f => ({ ...f, client_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>{clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Date</Label><Input type="date" value={form.recorded_date} onChange={e => setForm(f => ({ ...f, recorded_date: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Weight (kg)</Label><Input type="number" step="0.1" value={form.weight_kg} onChange={e => setForm(f => ({ ...f, weight_kg: e.target.value }))} /></div>
                <div><Label>Body Fat %</Label><Input type="number" step="0.1" value={form.body_fat_percent} onChange={e => setForm(f => ({ ...f, body_fat_percent: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Chest (cm)</Label><Input type="number" step="0.1" value={form.chest_cm} onChange={e => setForm(f => ({ ...f, chest_cm: e.target.value }))} /></div>
                <div><Label>Waist (cm)</Label><Input type="number" step="0.1" value={form.waist_cm} onChange={e => setForm(f => ({ ...f, waist_cm: e.target.value }))} /></div>
                <div><Label>Hips (cm)</Label><Input type="number" step="0.1" value={form.hips_cm} onChange={e => setForm(f => ({ ...f, hips_cm: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Arm (cm)</Label><Input type="number" step="0.1" value={form.arm_cm} onChange={e => setForm(f => ({ ...f, arm_cm: e.target.value }))} /></div>
                <div><Label>Thigh (cm)</Label><Input type="number" step="0.1" value={form.thigh_cm} onChange={e => setForm(f => ({ ...f, thigh_cm: e.target.value }))} /></div>
              </div>
              <Button className="w-full" disabled={!form.client_id || addMetric.isPending} onClick={() => addMetric.mutate()}>
                {addMetric.isPending ? 'Recording...' : 'Record Metrics'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Client filter */}
      <div className="max-w-xs">
        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger><SelectValue placeholder="All clients" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Clients</SelectItem>
            {clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" /></div>
      ) : metrics.length === 0 ? (
        <Card className="border-dashed"><CardContent className="py-12 text-center text-muted-foreground"><Activity className="h-10 w-10 mx-auto mb-3 opacity-30" /><p>No metrics recorded yet.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {metrics.map((m: any) => (
            <Card key={m.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">{m.pt_clients?.first_name} {m.pt_clients?.last_name}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(m.recorded_date), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 text-sm">
                  {m.weight_kg && <div><span className="text-muted-foreground text-xs">Weight</span><p className="font-medium">{m.weight_kg} kg</p></div>}
                  {m.body_fat_percent && <div><span className="text-muted-foreground text-xs">Body Fat</span><p className="font-medium">{m.body_fat_percent}%</p></div>}
                  {m.chest_cm && <div><span className="text-muted-foreground text-xs">Chest</span><p className="font-medium">{m.chest_cm} cm</p></div>}
                  {m.waist_cm && <div><span className="text-muted-foreground text-xs">Waist</span><p className="font-medium">{m.waist_cm} cm</p></div>}
                  {m.arm_cm && <div><span className="text-muted-foreground text-xs">Arm</span><p className="font-medium">{m.arm_cm} cm</p></div>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
