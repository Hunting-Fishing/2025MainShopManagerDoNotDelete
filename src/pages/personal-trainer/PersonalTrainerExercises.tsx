import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Target, Plus, Search, Dumbbell, Video, Image, AlertTriangle, BookOpen, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useShopId } from '@/hooks/useShopId';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Glutes', 'Full Body', 'Cardio', 'Mobility'];
const CATEGORIES = ['strength', 'cardio', 'flexibility', 'plyometric', 'functional'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

export default function PersonalTrainerExercises() {
  const { shopId } = useShopId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', category: 'strength', muscle_group: '', equipment: '', description: '', difficulty: 'intermediate',
    instructions: '', common_mistakes: '', video_url: '', image_url: '', alternatives: '',
  });

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ['pt-exercises', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data } = await (supabase as any).from('pt_exercises').select('*').eq('shop_id', shopId).order('name');
      return data || [];
    },
    enabled: !!shopId,
  });

  const addExercise = useMutation({
    mutationFn: async () => {
      if (!shopId) throw new Error('No shop');
      const payload: any = { ...form, shop_id: shopId };
      // Clean empty strings to null
      ['instructions', 'common_mistakes', 'video_url', 'image_url', 'alternatives'].forEach(k => {
        if (!payload[k]) payload[k] = null;
      });
      const { error } = await (supabase as any).from('pt_exercises').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pt-exercises'] });
      toast({ title: 'Exercise added' });
      setDialogOpen(false);
      setForm({ name: '', category: 'strength', muscle_group: '', equipment: '', description: '', difficulty: 'intermediate', instructions: '', common_mistakes: '', video_url: '', image_url: '', alternatives: '' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const filtered = exercises.filter((e: any) => {
    const matchesSearch = `${e.name} ${e.muscle_group} ${e.category} ${e.equipment}`.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = filterMuscle === 'all' || e.muscle_group === filterMuscle;
    const matchesCategory = filterCategory === 'all' || e.category === filterCategory;
    const matchesDifficulty = filterDifficulty === 'all' || e.difficulty === filterDifficulty;
    return matchesSearch && matchesMuscle && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Exercise Library</h1>
          <p className="text-muted-foreground text-sm">{exercises.length} exercises in your database</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-500 to-rose-600 text-white"><Plus className="h-4 w-4 mr-2" />Add Exercise</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add Exercise</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Exercise Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Barbell Squat" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Muscle Group</Label>
                  <Select value={form.muscle_group} onValueChange={v => setForm(f => ({ ...f, muscle_group: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{MUSCLE_GROUPS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Equipment</Label><Input value={form.equipment} onChange={e => setForm(f => ({ ...f, equipment: e.target.value }))} placeholder="e.g. Barbell, Dumbbells" /></div>
                <div>
                  <Label>Difficulty</Label>
                  <Select value={form.difficulty} onValueChange={v => setForm(f => ({ ...f, difficulty: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief overview of the exercise" /></div>
              <div><Label>Step-by-Step Instructions</Label><Textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} placeholder="1. Stand with feet shoulder-width apart&#10;2. Grip the bar..." rows={4} /></div>
              <div><Label>Common Mistakes</Label><Textarea value={form.common_mistakes} onChange={e => setForm(f => ({ ...f, common_mistakes: e.target.value }))} placeholder="• Rounding the back&#10;• Knees caving in..." rows={3} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Video URL</Label><Input value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} placeholder="https://youtube.com/..." /></div>
                <div><Label>Image URL</Label><Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." /></div>
              </div>
              <div><Label>Alternative Exercises</Label><Input value={form.alternatives} onChange={e => setForm(f => ({ ...f, alternatives: e.target.value }))} placeholder="Leg Press, Goblet Squat" /></div>
              <Button className="w-full" disabled={!form.name || addExercise.isPending} onClick={() => addExercise.mutate()}>
                {addExercise.isPending ? 'Adding...' : 'Add Exercise'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search exercises..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterMuscle} onValueChange={setFilterMuscle}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Muscles</SelectItem>{MUSCLE_GROUPS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Types</SelectItem>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Levels</SelectItem>{DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed"><CardContent className="py-12 text-center text-muted-foreground"><Dumbbell className="h-10 w-10 mx-auto mb-3 opacity-30" /><p>No exercises found. {exercises.length === 0 ? 'Build your library!' : 'Try adjusting filters.'}</p></CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ex: any) => {
            const isExpanded = expandedId === ex.id;
            return (
              <Card key={ex.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1">{ex.name}</h3>
                      <div className="flex flex-wrap gap-1 mb-2">
                        <Badge variant="secondary" className="text-xs">{ex.category}</Badge>
                        {ex.muscle_group && <Badge variant="outline" className="text-xs">{ex.muscle_group}</Badge>}
                        <Badge variant="outline" className="text-xs">{ex.difficulty}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {ex.video_url && <Video className="h-4 w-4 text-muted-foreground" />}
                      {ex.image_url && <Image className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>
                  {ex.equipment && <p className="text-xs text-muted-foreground">🏋️ {ex.equipment}</p>}
                  {ex.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ex.description}</p>}

                  {/* Expandable details */}
                  <Button variant="ghost" size="sm" className="w-full mt-2 text-xs" onClick={() => setExpandedId(isExpanded ? null : ex.id)}>
                    {isExpanded ? <><ChevronUp className="h-3 w-3 mr-1" />Less</> : <><ChevronDown className="h-3 w-3 mr-1" />Details</>}
                  </Button>

                  {isExpanded && (
                    <div className="mt-3 space-y-3 border-t pt-3">
                      {ex.instructions && (
                        <div>
                          <p className="text-xs font-medium flex items-center gap-1 mb-1"><BookOpen className="h-3 w-3" />Instructions</p>
                          <p className="text-xs text-muted-foreground whitespace-pre-line">{ex.instructions}</p>
                        </div>
                      )}
                      {ex.common_mistakes && (
                        <div>
                          <p className="text-xs font-medium flex items-center gap-1 mb-1 text-amber-600"><AlertTriangle className="h-3 w-3" />Common Mistakes</p>
                          <p className="text-xs text-muted-foreground whitespace-pre-line">{ex.common_mistakes}</p>
                        </div>
                      )}
                      {ex.alternatives && (
                        <div>
                          <p className="text-xs font-medium mb-1">🔄 Alternatives</p>
                          <p className="text-xs text-muted-foreground">{ex.alternatives}</p>
                        </div>
                      )}
                      {ex.video_url && (
                        <a href={ex.video_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1"><Video className="h-3 w-3" />Watch Demo Video</a>
                      )}
                      {ex.image_url && (
                        <img src={ex.image_url} alt={ex.name} className="rounded-lg max-h-40 object-cover w-full" />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
