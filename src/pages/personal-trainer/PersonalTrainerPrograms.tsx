import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ClipboardList, Plus, Pencil, UserPlus, Loader2 } from 'lucide-react';
import { useShopId } from '@/hooks/useShopId';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function PersonalTrainerPrograms() {
  const { shopId } = useShopId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignProgramId, setAssignProgramId] = useState<string | null>(null);
  const [assignForm, setAssignForm] = useState({ client_id: '', start_date: new Date().toISOString().split('T')[0] });
  const [form, setForm] = useState({ name: '', description: '', duration_weeks: 4, difficulty: 'intermediate', goal: '', is_template: false });

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['pt-programs', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data } = await (supabase as any).from('pt_workout_programs').select('*').eq('shop_id', shopId).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!shopId,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['pt-clients-assign', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data } = await (supabase as any).from('pt_clients').select('id, first_name, last_name').eq('shop_id', shopId).eq('membership_status', 'active').order('first_name');
      return data || [];
    },
    enabled: !!shopId,
  });

  const addProgram = useMutation({
    mutationFn: async () => {
      if (!shopId) throw new Error('No shop');
      const { error } = await (supabase as any).from('pt_workout_programs').insert({ ...form, shop_id: shopId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pt-programs'] });
      toast({ title: 'Program created' });
      setDialogOpen(false);
      setForm({ name: '', description: '', duration_weeks: 4, difficulty: 'intermediate', goal: '', is_template: false });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const assignProgram = useMutation({
    mutationFn: async () => {
      if (!shopId || !assignProgramId || !assignForm.client_id) throw new Error('Missing data');
      const program = programs.find((p: any) => p.id === assignProgramId);
      const startDate = new Date(assignForm.start_date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (program?.duration_weeks || 4) * 7);

      const { error } = await (supabase as any).from('pt_client_programs').insert({
        client_id: assignForm.client_id,
        program_id: assignProgramId,
        shop_id: shopId,
        status: 'active',
        start_date: assignForm.start_date,
        end_date: endDate.toISOString().split('T')[0],
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Program assigned to client' });
      setAssignDialogOpen(false);
      setAssignForm({ client_id: '', start_date: new Date().toISOString().split('T')[0] });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Workout Programs</h1>
          <p className="text-muted-foreground text-sm">Create, build, and assign training programs</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"><Plus className="h-4 w-4 mr-2" />New Program</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Workout Program</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Program Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. 12-Week Shred" /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Duration (weeks)</Label><Input type="number" value={form.duration_weeks} onChange={e => setForm(f => ({ ...f, duration_weeks: parseInt(e.target.value) || 4 }))} /></div>
                <div>
                  <Label>Difficulty</Label>
                  <Select value={form.difficulty} onValueChange={v => setForm(f => ({ ...f, difficulty: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Goal</Label><Input value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} placeholder="e.g. Fat loss, Muscle gain" /></div>
              <Button className="w-full" disabled={!form.name || addProgram.isPending} onClick={() => addProgram.mutate()}>
                {addProgram.isPending ? 'Creating...' : 'Create Program'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
      ) : programs.length === 0 ? (
        <Card className="border-dashed"><CardContent className="py-12 text-center text-muted-foreground"><ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" /><p>No programs yet. Create your first workout program!</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((p: any) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{p.name}</h3>
                  <Badge variant="secondary">{p.difficulty}</Badge>
                </div>
                {p.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{p.description}</p>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span>{p.duration_weeks} weeks</span>
                  {p.goal && <><span>·</span><span>{p.goal}</span></>}
                </div>
                {p.is_template && <Badge className="mb-3" variant="outline">Template</Badge>}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/personal-trainer/programs/${p.id}/builder`)}>
                    <Pencil className="h-3 w-3 mr-1" />Build
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => { setAssignProgramId(p.id); setAssignDialogOpen(true); }}>
                    <UserPlus className="h-3 w-3 mr-1" />Assign
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assign Program Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Program to Client</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Client *</Label>
              <Select value={assignForm.client_id} onValueChange={v => setAssignForm(f => ({ ...f, client_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Start Date</Label><Input type="date" value={assignForm.start_date} onChange={e => setAssignForm(f => ({ ...f, start_date: e.target.value }))} /></div>
            <Button className="w-full" disabled={!assignForm.client_id || assignProgram.isPending} onClick={() => assignProgram.mutate()}>
              {assignProgram.isPending ? 'Assigning...' : 'Assign Program'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
