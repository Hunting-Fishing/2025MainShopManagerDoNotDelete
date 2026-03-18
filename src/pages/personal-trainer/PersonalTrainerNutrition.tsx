import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Utensils, Plus, Loader2, Brain, TrendingUp, Search, ChefHat, Target, User, Sparkles } from 'lucide-react';
import { useShopId } from '@/hooks/useShopId';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import ReactMarkdown from 'react-markdown';
import DailyTargets from '@/components/nutrition/DailyTargets';
import FoodSearch from '@/components/nutrition/FoodSearch';
import ProductDetail from '@/components/nutrition/ProductDetail';
import NutritionProfile from '@/components/nutrition/NutritionProfile';
import GoalSetup from '@/components/nutrition/GoalSetup';
import MealPlanView from '@/components/nutrition/MealPlanView';
import { useFoodLogs, useLogFood } from '@/hooks/useNutrition';

export default function PersonalTrainerNutrition() {
  const { shopId } = useShopId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aiAdvice, setAiAdvice] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [form, setForm] = useState({ meal_type: 'lunch', food_name: '', servings: 1, calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, notes: '' });

  const { data: clients = [] } = useQuery({
    queryKey: ['pt-nutrition-clients', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data } = await (supabase as any).from('pt_clients').select('id, first_name, last_name, calorie_target, protein_target_g').eq('shop_id', shopId).eq('membership_status', 'active').order('first_name');
      return data || [];
    },
    enabled: !!shopId,
  });

  const { data: logs = [], isLoading } = useFoodLogs(selectedClient || undefined, shopId || undefined);
  const logFoodMutation = useLogFood(shopId || undefined);

  const handleLogManual = () => {
    if (!selectedClient || !form.food_name) return;
    logFoodMutation.mutate({
      client_id: selectedClient,
      log_date: new Date().toISOString().split('T')[0],
      ...form,
    }, {
      onSuccess: () => {
        setDialogOpen(false);
        setForm({ meal_type: 'lunch', food_name: '', servings: 1, calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, notes: '' });
      },
    });
  };

  const handleLogFromProduct = (product: any) => {
    if (!selectedClient) { toast({ title: 'Select a client first', variant: 'destructive' }); return; }
    const nutrients = product.nt_food_product_nutrients || product.nutrients || {};
    const cal = nutrients.calories?.amount || product.calories_per_serving || 0;
    const prot = nutrients.protein?.amount || 0;
    const carbs = nutrients.carbohydrates?.amount || 0;
    const fat = nutrients.fat?.amount || 0;
    const fiber = nutrients.fiber?.amount || 0;

    logFoodMutation.mutate({
      client_id: selectedClient,
      product_id: product.id || null,
      log_date: new Date().toISOString().split('T')[0],
      meal_type: 'lunch',
      food_name: product.name,
      servings: 1,
      calories: Math.round(cal),
      protein_g: Math.round(prot * 10) / 10,
      carbs_g: Math.round(carbs * 10) / 10,
      fat_g: Math.round(fat * 10) / 10,
      fiber_g: Math.round(fiber * 10) / 10,
    });
  };

  const getAiAdvice = async () => {
    if (!selectedClient) return;
    setAiLoading(true);
    setAiAdvice('');
    try {
      const { data, error } = await supabase.functions.invoke('nutrition-engine', {
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

  const todayLogs = logs.filter((l: any) => l.log_date === new Date().toISOString().split('T')[0]);
  const todayIntake = {
    calories: todayLogs.reduce((s: number, l: any) => s + (l.calories || 0), 0),
    protein_g: todayLogs.reduce((s: number, l: any) => s + (l.protein_g || 0), 0),
    carbs_g: todayLogs.reduce((s: number, l: any) => s + (l.carbs_g || 0), 0),
    fat_g: todayLogs.reduce((s: number, l: any) => s + (l.fat_g || 0), 0),
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Utensils className="h-6 w-6 text-green-500" />Nutrition Intelligence
          </h1>
          <p className="text-muted-foreground text-sm">AI-powered nutrition tracking, scoring & meal planning</p>
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
        <Select value={selectedClient} onValueChange={v => { setSelectedClient(v); setSelectedProduct(null); }}>
          <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
          <SelectContent>{clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {selectedClient && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="dashboard" className="text-xs"><TrendingUp className="h-3.5 w-3.5 mr-1" />Dashboard</TabsTrigger>
            <TabsTrigger value="search" className="text-xs"><Search className="h-3.5 w-3.5 mr-1" />Food Search</TabsTrigger>
            <TabsTrigger value="meals" className="text-xs"><ChefHat className="h-3.5 w-3.5 mr-1" />Meal Plans</TabsTrigger>
            <TabsTrigger value="goals" className="text-xs"><Target className="h-3.5 w-3.5 mr-1" />Goals</TabsTrigger>
            <TabsTrigger value="profile" className="text-xs"><User className="h-3.5 w-3.5 mr-1" />Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4 mt-4">
            {/* Daily Targets with Progress Rings */}
            <DailyTargets clientId={selectedClient} shopId={shopId!} todayIntake={todayIntake} />

            {/* AI Advice */}
            {aiAdvice && (
              <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Brain className="h-5 w-5 text-green-600" />AI Nutrition Advice</CardTitle></CardHeader>
                <CardContent><div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{aiAdvice}</ReactMarkdown></div></CardContent>
              </Card>
            )}

            {/* Charts */}
            {dailyTotals.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-5 w-5" />Daily Intake Trend</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={dailyTotals}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(v: string) => format(new Date(v), 'MMM d')} fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="calories" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Calories" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Recent Logs */}
            {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-green-500" /></div> : (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Recent Entries</h3>
                {logs.slice(0, 20).map((l: any) => (
                  <Card key={l.id}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">{l.meal_type}</Badge>
                          <span className="font-medium text-sm">{l.food_name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{format(new Date(l.log_date), 'MMM d, yyyy')}{l.notes ? ` · ${l.notes}` : ''}</p>
                      </div>
                      <div className="text-right text-xs space-y-0.5">
                        <p><strong>{Math.round(l.calories || 0)}</strong> cal</p>
                        <p>P:{Math.round(l.protein_g || 0)}g C:{Math.round(l.carbs_g || 0)}g F:{Math.round(l.fat_g || 0)}g</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="search" className="mt-4">
            {selectedProduct ? (
              <ProductDetail
                product={selectedProduct}
                clientId={selectedClient}
                shopId={shopId!}
                onBack={() => setSelectedProduct(null)}
                onLogFood={handleLogFromProduct}
              />
            ) : (
              <FoodSearch
                clientId={selectedClient}
                shopId={shopId!}
                onSelectProduct={setSelectedProduct}
                onLogFood={handleLogFromProduct}
              />
            )}
          </TabsContent>

          <TabsContent value="meals" className="mt-4">
            <MealPlanView clientId={selectedClient} shopId={shopId!} />
          </TabsContent>

          <TabsContent value="goals" className="mt-4">
            <GoalSetup clientId={selectedClient} shopId={shopId!} />
          </TabsContent>

          <TabsContent value="profile" className="mt-4">
            <NutritionProfile clientId={selectedClient} shopId={shopId!} />
          </TabsContent>
        </Tabs>
      )}

      {/* Manual Log Dialog */}
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
                  <SelectItem value="pre_workout">Pre-Workout</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="post_workout">Post-Workout</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Food Item</Label><Input value={form.food_name} onChange={e => setForm(f => ({ ...f, food_name: e.target.value }))} placeholder="Grilled chicken breast with rice" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Calories</Label><Input type="number" value={form.calories} onChange={e => setForm(f => ({ ...f, calories: parseInt(e.target.value) || 0 }))} /></div>
              <div><Label>Protein (g)</Label><Input type="number" value={form.protein_g} onChange={e => setForm(f => ({ ...f, protein_g: parseFloat(e.target.value) || 0 }))} /></div>
              <div><Label>Carbs (g)</Label><Input type="number" value={form.carbs_g} onChange={e => setForm(f => ({ ...f, carbs_g: parseFloat(e.target.value) || 0 }))} /></div>
              <div><Label>Fat (g)</Label><Input type="number" value={form.fat_g} onChange={e => setForm(f => ({ ...f, fat_g: parseFloat(e.target.value) || 0 }))} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
            <Button onClick={handleLogManual} disabled={!form.food_name || logFoodMutation.isPending} className="w-full">
              {logFoodMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}Log Meal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
