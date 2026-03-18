import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Utensils, Plus, Loader2, Search, Brain, TrendingUp } from 'lucide-react';
import { useShopId } from '@/hooks/useShopId';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import ReactMarkdown from 'react-markdown';

export default function PersonalTrainerNutrition() {
  const { shopId } = useShopId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aiAdvice, setAiAdvice] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({ meal_type: 'lunch', food_item: '', calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, notes: '' });

  const { data: clients = [] } = useQuery({
    queryKey: ['pt-nutrition-clients', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data } = await (supabase as any).from('pt_clients').select('id, first_name, last_name, calorie_target, protein_target_g').eq('shop_id', shopId).eq('membership_status', 'active').order('first_name');
      return data || [];
    },
    enabled: !!shopId,
  });

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['pt-nutrition-logs', selectedClient],
    queryFn: async () => {
      if (!selectedClient) return [];
      const { data } = await (supabase as any).from('pt_nutrition_logs').select('*').eq('client_id', selectedClient).order('log_date', { ascending: false }).order('created_at', { ascending: false }).limit(50);
      return data || [];
    },
    enabled: !!selectedClient,
  });

  const addLog = useMutation({
    mutationFn: async () => {
      if (!selectedClient) throw new Error('Select a client');
      const { error } = await (supabase as any).from('pt_nutrition_logs').insert({ client_id: selectedClient, ...form });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pt-nutrition-logs'] });
      setDialogOpen(false);
      setForm({ meal_type: 'lunch', food_item: '', calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, notes: '' });
      toast({ title: 'Nutrition log added' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const getAiAdvice = async () => {
    if (!selectedClient) return;
    setAiLoading(true);
    setAiAdvice('');
    try {
      const { data, error } = await supabase.functions.invoke('pt-ai-assistant', {
        body: { action: 'nutrition_advice', clientId: selectedClient, shopId },
      });
      if (error) throw error;
      setAiAdvice(data.content);
    } catch (e: any) {
      toast({ title: 'AI Error', description: e.message, variant: 'destructive' });
    } finally {
      setAiLoading(false);
    }
  };

  // Aggregate daily totals for chart
  const dailyTotals = Object.values(
    logs.reduce((acc: Record<string, any>, l: any) => {
      const d = l.log_date;
      if (!acc[d]) acc[d] = { date: d, calories: 0, protein: 0 };
      acc[d].calories += l.calories || 0;
      acc[d].protein += l.protein_g || 0;
      return acc;
    }, {})
  ).slice(0, 14).reverse() as any[];

  const clientData = clients.find((c: any) => c.id === selectedClient);
  const todayLogs = logs.filter((l: any) => l.log_date === new Date().toISOString().split('T')[0]);
  const todayCalories = todayLogs.reduce((s: number, l: any) => s + (l.calories || 0), 0);
  const todayProtein = todayLogs.reduce((s: number, l: any) => s + (l.protein_g || 0), 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Utensils className="h-6 w-6 text-green-500" />Nutrition Tracking</h1>
          <p className="text-muted-foreground text-sm">Log and track client nutrition with AI insights</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedClient && (
            <Button variant="outline" onClick={getAiAdvice} disabled={aiLoading}>
              {aiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}AI Advice
            </Button>
          )}
          <Button onClick={() => setDialogOpen(true)} disabled={!selectedClient} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <Plus className="h-4 w-4 mr-2" />Log Meal
          </Button>
        </div>
      </div>

      <div className="max-w-xs">
        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
          <SelectContent>{clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {selectedClient && (
        <>
          {/* Today's Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{todayCalories}</p>
              <p className="text-xs text-muted-foreground">Calories Today{clientData?.calorie_target ? ` / ${clientData.calorie_target}` : ''}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{todayProtein}g</p>
              <p className="text-xs text-muted-foreground">Protein Today{clientData?.protein_target_g ? ` / ${clientData.protein_target_g}g` : ''}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{todayLogs.length}</p><p className="text-xs text-muted-foreground">Meals Logged</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{logs.length}</p><p className="text-xs text-muted-foreground">Total Entries</p></CardContent></Card>
          </div>

          {/* Charts */}
          {dailyTotals.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-5 w-5" />Daily Calorie Intake</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dailyTotals}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(v: string) => format(new Date(v), 'MMM d')} fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="calories" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* AI Advice */}
          {aiAdvice && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Brain className="h-5 w-5 text-green-600" />AI Nutrition Advice</CardTitle></CardHeader>
              <CardContent><div className="prose prose-sm max-w-none"><ReactMarkdown>{aiAdvice}</ReactMarkdown></div></CardContent>
            </Card>
          )}

          {/* Meal Logs */}
          {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-green-500" /></div> : (
            <div className="space-y-2">
              {logs.map((l: any) => (
                <Card key={l.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{l.meal_type}</Badge>
                        <span className="font-medium text-sm">{l.food_item}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{format(new Date(l.log_date), 'MMM d, yyyy')}{l.notes ? ` • ${l.notes}` : ''}</p>
                    </div>
                    <div className="text-right text-xs space-y-0.5">
                      <p><strong>{l.calories || 0}</strong> cal</p>
                      <p>P:{l.protein_g || 0}g C:{l.carbs_g || 0}g F:{l.fat_g || 0}g</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Log Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log Meal</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Meal Type</Label>
              <Select value={form.meal_type} onValueChange={v => setForm(f => ({ ...f, meal_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Food Item</Label><Input value={form.food_item} onChange={e => setForm(f => ({ ...f, food_item: e.target.value }))} placeholder="Grilled chicken breast with rice" /></div>
            <div className="grid grid-cols-4 gap-3">
              <div><Label>Calories</Label><Input type="number" value={form.calories} onChange={e => setForm(f => ({ ...f, calories: parseInt(e.target.value) || 0 }))} /></div>
              <div><Label>Protein (g)</Label><Input type="number" value={form.protein_g} onChange={e => setForm(f => ({ ...f, protein_g: parseFloat(e.target.value) || 0 }))} /></div>
              <div><Label>Carbs (g)</Label><Input type="number" value={form.carbs_g} onChange={e => setForm(f => ({ ...f, carbs_g: parseFloat(e.target.value) || 0 }))} /></div>
              <div><Label>Fat (g)</Label><Input type="number" value={form.fat_g} onChange={e => setForm(f => ({ ...f, fat_g: parseFloat(e.target.value) || 0 }))} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
            <Button onClick={() => addLog.mutate()} disabled={!form.food_item || addLog.isPending} className="w-full">
              {addLog.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}Log Meal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
