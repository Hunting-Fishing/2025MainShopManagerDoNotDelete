import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, User, ClipboardList, Calendar, Activity, ClipboardCheck, CreditCard, Loader2, Mail, Phone, AlertCircle, Pencil, Utensils, Save, Sparkles, Brain } from 'lucide-react';
import FitnessInterestIntake from '@/components/personal-trainer/FitnessInterestIntake';
import FitnessProfileScores from '@/components/personal-trainer/FitnessProfileScores';
import AIInsightsPanel from '@/components/personal-trainer/AIInsightsPanel';
import { useShopId } from '@/hooks/useShopId';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function PersonalTrainerClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { shopId } = useShopId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

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

  const updateClient = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('No client');
      const { error } = await (supabase as any).from('pt_clients').update(editForm).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pt-client-detail', id] });
      toast({ title: 'Client updated' });
      setEditOpen(false);
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const updateNutrition = useMutation({
    mutationFn: async (payload: any) => {
      if (!id) throw new Error('No client');
      const { error } = await (supabase as any).from('pt_clients').update(payload).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pt-client-detail', id] });
      toast({ title: 'Nutrition updated' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!client) return <div className="p-6 text-center"><p className="text-muted-foreground">Client not found</p></div>;

  const openEdit = () => {
    setEditForm({
      first_name: client.first_name || '',
      last_name: client.last_name || '',
      email: client.email || '',
      phone: client.phone || '',
      gender: client.gender || '',
      date_of_birth: client.date_of_birth || '',
      height_cm: client.height_cm || '',
      fitness_level: client.fitness_level || 'beginner',
      goals: client.goals || '',
      health_conditions: client.health_conditions || '',
      injuries: client.injuries || '',
      emergency_contact: client.emergency_contact || '',
      emergency_phone: client.emergency_phone || '',
      membership_type: client.membership_type || 'standard',
      membership_status: client.membership_status || 'active',
      preferred_workout_days: (client.preferred_workout_days || []).join(', '),
    });
    setEditOpen(true);
  };

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
        <Button variant="outline" onClick={openEdit}><Pencil className="h-4 w-4 mr-2" />Edit</Button>
      </div>

      {/* Contact Info */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4 flex flex-wrap gap-6">
          {client.email && <span className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" />{client.email}</span>}
          {client.phone && <span className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" />{client.phone}</span>}
          {client.date_of_birth && <span className="text-sm text-muted-foreground">DOB: {format(new Date(client.date_of_birth), 'MMM d, yyyy')}</span>}
          {client.height_cm && <span className="text-sm text-muted-foreground">Height: {client.height_cm} cm</span>}
          {client.gender && <span className="text-sm text-muted-foreground capitalize">Sex: {client.gender}</span>}
          {client.emergency_contact && <span className="flex items-center gap-2 text-sm"><AlertCircle className="h-4 w-4 text-red-500" />{client.emergency_contact} {client.emergency_phone && `· ${client.emergency_phone}`}</span>}
        </CardContent>
      </Card>

      {/* Goals, Health, Injuries */}
      {(client.goals || client.health_conditions || client.injuries) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {client.goals && <Card><CardContent className="p-4"><p className="text-xs font-medium text-muted-foreground mb-1">Goals</p><p className="text-sm">{client.goals}</p></CardContent></Card>}
          {client.health_conditions && <Card><CardContent className="p-4"><p className="text-xs font-medium text-muted-foreground mb-1">Health Conditions</p><p className="text-sm">{client.health_conditions}</p></CardContent></Card>}
          {client.injuries && <Card><CardContent className="p-4"><p className="text-xs font-medium text-muted-foreground mb-1">Injuries</p><p className="text-sm">{client.injuries}</p></CardContent></Card>}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="programs">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="programs" className="text-xs"><ClipboardList className="h-3 w-3 mr-1" />Programs</TabsTrigger>
          <TabsTrigger value="sessions" className="text-xs"><Calendar className="h-3 w-3 mr-1" />Sessions</TabsTrigger>
          <TabsTrigger value="metrics" className="text-xs"><Activity className="h-3 w-3 mr-1" />Metrics</TabsTrigger>
          <TabsTrigger value="checkins" className="text-xs"><ClipboardCheck className="h-3 w-3 mr-1" />Check-ins</TabsTrigger>
          <TabsTrigger value="fitness-profile" className="text-xs"><Sparkles className="h-3 w-3 mr-1" />Interests</TabsTrigger>
          <TabsTrigger value="ai-insights" className="text-xs"><Brain className="h-3 w-3 mr-1" />AI Insights</TabsTrigger>
          <TabsTrigger value="nutrition" className="text-xs"><Utensils className="h-3 w-3 mr-1" />Nutrition</TabsTrigger>
          <TabsTrigger value="billing" className="text-xs"><CreditCard className="h-3 w-3 mr-1" />Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="fitness-profile" className="mt-4 space-y-4">
          {id && shopId && <FitnessProfileScores clientId={id} shopId={shopId} />}
          {id && shopId && <FitnessInterestIntake clientId={id} shopId={shopId} embedded />}
        </TabsContent>

        <TabsContent value="ai-insights" className="mt-4">
          {id && shopId && <AIInsightsPanel clientId={id} shopId={shopId} />}
        </TabsContent>

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
              <p className="text-xs text-muted-foreground mb-2">{format(new Date(m.measurement_date || m.recorded_date), 'MMM d, yyyy')}</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {m.weight_kg && <div><p className="text-xs text-muted-foreground">Weight</p><p className="font-semibold text-sm">{m.weight_kg} kg</p></div>}
                {m.body_fat_percent && <div><p className="text-xs text-muted-foreground">Body Fat</p><p className="font-semibold text-sm">{m.body_fat_percent}%</p></div>}
                {m.chest_cm && <div><p className="text-xs text-muted-foreground">Chest</p><p className="font-semibold text-sm">{m.chest_cm} cm</p></div>}
                {m.waist_cm && <div><p className="text-xs text-muted-foreground">Waist</p><p className="font-semibold text-sm">{m.waist_cm} cm</p></div>}
                {m.arm_cm && <div><p className="text-xs text-muted-foreground">Arm</p><p className="font-semibold text-sm">{m.arm_cm} cm</p></div>}
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
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {ci.weight && <div><p className="text-xs text-muted-foreground">Weight</p><p className="font-semibold text-sm">{ci.weight}</p></div>}
                {ci.mood && <div><p className="text-xs text-muted-foreground">Mood</p><p className="font-semibold text-sm capitalize">{ci.mood}</p></div>}
                {ci.sleep_hours && <div><p className="text-xs text-muted-foreground">Sleep</p><p className="font-semibold text-sm">{ci.sleep_hours}h</p></div>}
                {ci.energy_level && <div><p className="text-xs text-muted-foreground">Energy</p><p className="font-semibold text-sm">{ci.energy_level}/10</p></div>}
                {ci.workout_compliance && <div><p className="text-xs text-muted-foreground">Workout</p><p className="font-semibold text-sm">{ci.workout_compliance}/10</p></div>}
                {ci.soreness_level && <div><p className="text-xs text-muted-foreground">Soreness</p><p className="font-semibold text-sm">{ci.soreness_level}/10</p></div>}
              </div>
              {ci.pain_issues && <p className="text-xs text-red-500 mt-2">⚠️ Pain: {ci.pain_issues}</p>}
              {ci.notes && <p className="text-xs text-muted-foreground mt-2">{ci.notes}</p>}
            </CardContent></Card>
          ))}
        </TabsContent>

        {/* Nutrition Tab */}
        <TabsContent value="nutrition" className="mt-4">
          <NutritionCard client={client} onSave={(payload: any) => updateNutrition.mutate(payload)} saving={updateNutrition.isPending} />
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

      {/* Edit Client Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Client Profile</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>First Name</Label><Input value={editForm.first_name || ''} onChange={e => setEditForm((f: any) => ({ ...f, first_name: e.target.value }))} /></div>
              <div><Label>Last Name</Label><Input value={editForm.last_name || ''} onChange={e => setEditForm((f: any) => ({ ...f, last_name: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Email</Label><Input type="email" value={editForm.email || ''} onChange={e => setEditForm((f: any) => ({ ...f, email: e.target.value }))} /></div>
              <div><Label>Phone</Label><Input value={editForm.phone || ''} onChange={e => setEditForm((f: any) => ({ ...f, phone: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Sex</Label>
                <Select value={editForm.gender || ''} onValueChange={v => setEditForm((f: any) => ({ ...f, gender: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Date of Birth</Label><Input type="date" value={editForm.date_of_birth || ''} onChange={e => setEditForm((f: any) => ({ ...f, date_of_birth: e.target.value }))} /></div>
              <div><Label>Height (cm)</Label><Input type="number" value={editForm.height_cm || ''} onChange={e => setEditForm((f: any) => ({ ...f, height_cm: e.target.value ? parseFloat(e.target.value) : null }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Fitness Level</Label>
                <Select value={editForm.fitness_level || 'beginner'} onValueChange={v => setEditForm((f: any) => ({ ...f, fitness_level: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editForm.membership_status || 'active'} onValueChange={v => setEditForm((f: any) => ({ ...f, membership_status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Goals</Label><Textarea value={editForm.goals || ''} onChange={e => setEditForm((f: any) => ({ ...f, goals: e.target.value }))} /></div>
            <div><Label>Health Conditions</Label><Textarea value={editForm.health_conditions || ''} onChange={e => setEditForm((f: any) => ({ ...f, health_conditions: e.target.value }))} /></div>
            <div><Label>Injuries / Limitations</Label><Textarea value={editForm.injuries || ''} onChange={e => setEditForm((f: any) => ({ ...f, injuries: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Emergency Contact</Label><Input value={editForm.emergency_contact || ''} onChange={e => setEditForm((f: any) => ({ ...f, emergency_contact: e.target.value }))} /></div>
              <div><Label>Emergency Phone</Label><Input value={editForm.emergency_phone || ''} onChange={e => setEditForm((f: any) => ({ ...f, emergency_phone: e.target.value }))} /></div>
            </div>
            <div><Label>Preferred Workout Days</Label><Input value={editForm.preferred_workout_days || ''} onChange={e => setEditForm((f: any) => ({ ...f, preferred_workout_days: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) }))} placeholder="Mon, Wed, Fri" /></div>
            <Button className="w-full" disabled={updateClient.isPending} onClick={() => updateClient.mutate()}>
              {updateClient.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Nutrition Lite sub-component
function NutritionCard({ client, onSave, saving }: { client: any; onSave: (p: any) => void; saving: boolean }) {
  const [form, setForm] = useState({
    calorie_target: client.calorie_target || '',
    protein_target_g: client.protein_target_g || '',
    carb_target_g: client.carb_target_g || '',
    fat_target_g: client.fat_target_g || '',
    hydration_target_ml: client.hydration_target_ml || 2500,
    meal_guidance: client.meal_guidance || '',
    supplement_notes: client.supplement_notes || '',
    food_habits: client.food_habits || '',
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><Utensils className="h-5 w-5 text-green-500" />Nutrition Plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div><Label>Calories</Label><Input type="number" value={form.calorie_target} onChange={e => setForm(f => ({ ...f, calorie_target: e.target.value ? parseInt(e.target.value) : '' }))} placeholder="2000" /></div>
          <div><Label>Protein (g)</Label><Input type="number" value={form.protein_target_g} onChange={e => setForm(f => ({ ...f, protein_target_g: e.target.value ? parseInt(e.target.value) : '' }))} placeholder="150" /></div>
          <div><Label>Carbs (g)</Label><Input type="number" value={form.carb_target_g} onChange={e => setForm(f => ({ ...f, carb_target_g: e.target.value ? parseInt(e.target.value) : '' }))} placeholder="200" /></div>
          <div><Label>Fat (g)</Label><Input type="number" value={form.fat_target_g} onChange={e => setForm(f => ({ ...f, fat_target_g: e.target.value ? parseInt(e.target.value) : '' }))} placeholder="70" /></div>
        </div>
        <div><Label>Hydration Target (ml)</Label><Input type="number" value={form.hydration_target_ml} onChange={e => setForm(f => ({ ...f, hydration_target_ml: parseInt(e.target.value) || 2500 }))} /></div>
        <div><Label>Meal Guidance</Label><Textarea value={form.meal_guidance} onChange={e => setForm(f => ({ ...f, meal_guidance: e.target.value }))} placeholder="General meal structure, timing, etc." rows={3} /></div>
        <div><Label>Supplement Notes</Label><Textarea value={form.supplement_notes} onChange={e => setForm(f => ({ ...f, supplement_notes: e.target.value }))} placeholder="Creatine, whey protein, etc." rows={2} /></div>
        <div><Label>Food Habits / Preferences</Label><Textarea value={form.food_habits} onChange={e => setForm(f => ({ ...f, food_habits: e.target.value }))} placeholder="Vegetarian, dairy-free, etc." rows={2} /></div>
        <Button onClick={() => onSave(form)} disabled={saving} className="w-full">
          <Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : 'Save Nutrition Plan'}
        </Button>
      </CardContent>
    </Card>
  );
}
