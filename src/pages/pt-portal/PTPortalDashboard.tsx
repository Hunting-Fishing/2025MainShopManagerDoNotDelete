import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Dumbbell, LogOut, Calendar, Activity, Loader2, ClipboardList, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface ClientData { id: string; first_name: string; last_name: string; email: string; fitness_level: string; goals: string | null; shop_id: string; }

export default function PTPortalDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<ClientData | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [workoutDays, setWorkoutDays] = useState<any[]>([]);
  const [dayExercises, setDayExercises] = useState<Record<string, any[]>>({});
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [loggingExercise, setLoggingExercise] = useState<string | null>(null);
  const [logWeight, setLogWeight] = useState('');

  useEffect(() => {
    loadData();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') navigate('/pt-portal/login');
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/pt-portal/login'); return; }

      const { data: cl } = await (supabase as any)
        .from('pt_clients').select('id, first_name, last_name, email, fitness_level, goals, shop_id').eq('user_id', session.user.id).maybeSingle();
      if (!cl) {
        await supabase.auth.signOut();
        toast({ title: "Access Denied", description: "No client account found.", variant: "destructive" });
        navigate('/pt-portal/login'); return;
      }
      setClient(cl);

      const { data: sessData } = await (supabase as any)
        .from('pt_sessions').select('id, session_date, duration_minutes, session_type, status, location')
        .eq('client_id', cl.id).order('session_date', { ascending: false }).limit(20);
      setSessions(sessData || []);

      const { data: metData } = await (supabase as any)
        .from('pt_body_metrics').select('id, recorded_date, weight_kg, body_fat_percent, chest_cm, waist_cm')
        .eq('client_id', cl.id).order('recorded_date', { ascending: false }).limit(10);
      setMetrics(metData || []);

      const { data: progData } = await (supabase as any)
        .from('pt_client_programs').select('*, pt_workout_programs(id, name, description, duration_weeks, difficulty, goal)')
        .eq('client_id', cl.id).eq('status', 'active');
      const progs = (progData || []).map((p: any) => ({ ...p.pt_workout_programs, assignment_id: p.id })).filter(Boolean);
      setPrograms(progs);

      // Load today's completed exercises
      const today = new Date().toISOString().split('T')[0];
      const { data: logs } = await (supabase as any)
        .from('pt_workout_logs').select('exercise_id, workout_day_id')
        .eq('client_id', cl.id)
        .gte('completed_at', today + 'T00:00:00')
        .lte('completed_at', today + 'T23:59:59');
      const completed = new Set<string>((logs || []).map((l: any) => `${l.workout_day_id}_${l.exercise_id}`));
      setCompletedExercises(completed);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  // Load workout days for selected program
  useEffect(() => {
    if (!selectedProgramId || !client) return;
    const loadDays = async () => {
      const { data: days } = await (supabase as any).from('pt_workout_days')
        .select('*').eq('program_id', selectedProgramId).eq('shop_id', client.shop_id).order('sort_order').order('day_number');
      setWorkoutDays(days || []);

      if (days && days.length > 0) {
        const dayIds = days.map((d: any) => d.id);
        const { data: exs } = await (supabase as any).from('pt_workout_day_exercises')
          .select('*, pt_exercises(name, muscle_group, equipment)')
          .eq('shop_id', client.shop_id)
          .in('workout_day_id', dayIds)
          .order('sort_order');
        const grouped: Record<string, any[]> = {};
        (exs || []).forEach((e: any) => {
          if (!grouped[e.workout_day_id]) grouped[e.workout_day_id] = [];
          grouped[e.workout_day_id].push(e);
        });
        setDayExercises(grouped);
      }
    };
    loadDays();
  }, [selectedProgramId, client]);

  const logExerciseCompletion = async (dayId: string, exerciseId: string, programId: string) => {
    if (!client) return;
    const key = `${dayId}_${exerciseId}`;
    if (completedExercises.has(key)) return;

    try {
      const { error } = await (supabase as any).from('pt_workout_logs').insert({
        shop_id: client.shop_id,
        client_id: client.id,
        program_id: programId,
        workout_day_id: dayId,
        exercise_id: exerciseId,
        weight_used: logWeight ? parseFloat(logWeight) : null,
        completed_at: new Date().toISOString(),
      });
      if (error) throw error;
      setCompletedExercises(prev => new Set(prev).add(key));
      setLoggingExercise(null);
      setLogWeight('');
      toast({ title: 'Exercise completed! 💪' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/pt-portal/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
  );

  const upcomingSessions = sessions.filter(s => new Date(s.session_date) >= new Date() && s.status === 'scheduled');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold">Fitness Portal</span>
              {client && <p className="text-xs text-muted-foreground">Welcome, {client.first_name}!</p>}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}><LogOut className="h-4 w-4 mr-2" />Sign Out</Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{upcomingSessions.length}</p><p className="text-xs text-muted-foreground">Upcoming Sessions</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{programs.length}</p><p className="text-xs text-muted-foreground">Active Programs</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{metrics.length}</p><p className="text-xs text-muted-foreground">Check-ins</p></CardContent></Card>
        </div>

        <Tabs defaultValue="workouts">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="workouts"><Dumbbell className="h-4 w-4 mr-1" />Workouts</TabsTrigger>
            <TabsTrigger value="sessions"><Calendar className="h-4 w-4 mr-1" />Sessions</TabsTrigger>
            <TabsTrigger value="programs"><ClipboardList className="h-4 w-4 mr-1" />Programs</TabsTrigger>
            <TabsTrigger value="progress"><Activity className="h-4 w-4 mr-1" />Progress</TabsTrigger>
          </TabsList>

          {/* Workouts Tab - Track Completion */}
          <TabsContent value="workouts" className="space-y-4 mt-4">
            {programs.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No active programs assigned yet.</CardContent></Card>
            ) : (
              <>
                {/* Program Selector */}
                <div className="flex gap-2 flex-wrap">
                  {programs.map((p: any) => (
                    <Button
                      key={p.id}
                      size="sm"
                      variant={selectedProgramId === p.id ? 'default' : 'outline'}
                      onClick={() => setSelectedProgramId(p.id)}
                    >
                      {p.name}
                    </Button>
                  ))}
                </div>

                {selectedProgramId && workoutDays.length > 0 && (
                  <div className="space-y-4">
                    {workoutDays.map((day: any) => {
                      const exercises = dayExercises[day.id] || [];
                      const completedCount = exercises.filter((ex: any) => completedExercises.has(`${day.id}_${ex.exercise_id}`)).length;
                      const allDone = exercises.length > 0 && completedCount === exercises.length;

                      return (
                        <Card key={day.id} className={allDone ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : ''}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${allDone ? 'bg-green-500' : 'bg-gradient-to-br from-violet-500 to-purple-600'}`}>
                                  {allDone ? <CheckCircle2 className="h-4 w-4" /> : day.day_number}
                                </div>
                                <div>
                                  <CardTitle className="text-sm">{day.name}</CardTitle>
                                  {day.focus_area && <p className="text-xs text-muted-foreground">{day.focus_area}</p>}
                                </div>
                              </div>
                              <Badge variant={allDone ? 'default' : 'secondary'} className="text-xs">
                                {completedCount}/{exercises.length}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            {exercises.length === 0 ? (
                              <p className="text-xs text-muted-foreground py-2">No exercises</p>
                            ) : (
                              <div className="space-y-2">
                                {exercises.map((ex: any) => {
                                  const isCompleted = completedExercises.has(`${day.id}_${ex.exercise_id}`);
                                  const isLogging = loggingExercise === `${day.id}_${ex.exercise_id}`;
                                  return (
                                    <div key={ex.id} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isCompleted ? 'bg-green-100/50 dark:bg-green-950/30' : 'bg-muted/50'}`}>
                                      <Checkbox
                                        checked={isCompleted}
                                        disabled={isCompleted}
                                        onCheckedChange={() => {
                                          if (!isCompleted) {
                                            setLoggingExercise(`${day.id}_${ex.exercise_id}`);
                                          }
                                        }}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className={`font-medium text-sm ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>{ex.pt_exercises?.name}</p>
                                        <div className="flex gap-2 mt-0.5">
                                          <span className="text-xs text-muted-foreground">{ex.sets} × {ex.reps}</span>
                                          {ex.rest_seconds && <span className="text-xs text-muted-foreground">· {ex.rest_seconds}s rest</span>}
                                        </div>
                                      </div>
                                      {isLogging && (
                                        <div className="flex items-center gap-2">
                                          <Input
                                            type="number"
                                            placeholder="Weight"
                                            className="w-20 h-8 text-xs"
                                            value={logWeight}
                                            onChange={e => setLogWeight(e.target.value)}
                                          />
                                          <Button
                                            size="sm"
                                            className="h-8 text-xs"
                                            onClick={() => logExerciseCompletion(day.id, ex.exercise_id, selectedProgramId!)}
                                          >
                                            Done
                                          </Button>
                                        </div>
                                      )}
                                      {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {selectedProgramId && workoutDays.length === 0 && (
                  <Card><CardContent className="py-8 text-center text-muted-foreground">No workout days set up for this program yet.</CardContent></Card>
                )}

                {!selectedProgramId && (
                  <Card><CardContent className="py-8 text-center text-muted-foreground">Select a program above to view your workouts</CardContent></Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="sessions" className="space-y-3 mt-4">
            {sessions.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No sessions scheduled yet.</CardContent></Card>
            ) : sessions.map(s => (
              <Card key={s.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{format(new Date(s.session_date), 'EEEE, MMM d, yyyy')}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(s.session_date), 'h:mm a')} · {s.duration_minutes}min · {s.session_type?.replace('_', ' ')}
                    </p>
                    {s.location && <p className="text-xs text-muted-foreground mt-1">📍 {s.location}</p>}
                  </div>
                  <Badge variant={s.status === 'completed' ? 'default' : s.status === 'canceled' ? 'destructive' : 'secondary'}>{s.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="programs" className="space-y-3 mt-4">
            {programs.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No active programs assigned.</CardContent></Card>
            ) : programs.map((p: any) => (
              <Card key={p.id}>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{p.name}</h3>
                  {p.description && <p className="text-sm text-muted-foreground mt-1">{p.description}</p>}
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{p.duration_weeks} weeks</Badge>
                    <Badge variant="outline">{p.difficulty}</Badge>
                    {p.goal && <Badge variant="outline">{p.goal}</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="progress" className="space-y-3 mt-4">
            {metrics.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No metrics recorded yet.</CardContent></Card>
            ) : metrics.map((m: any) => (
              <Card key={m.id}>
                <CardContent className="p-4">
                  <p className="font-medium mb-2">{format(new Date(m.recorded_date), 'MMM d, yyyy')}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    {m.weight_kg && <div><span className="text-muted-foreground text-xs">Weight</span><p className="font-medium">{m.weight_kg} kg</p></div>}
                    {m.body_fat_percent && <div><span className="text-muted-foreground text-xs">Body Fat</span><p className="font-medium">{m.body_fat_percent}%</p></div>}
                    {m.chest_cm && <div><span className="text-muted-foreground text-xs">Chest</span><p className="font-medium">{m.chest_cm} cm</p></div>}
                    {m.waist_cm && <div><span className="text-muted-foreground text-xs">Waist</span><p className="font-medium">{m.waist_cm} cm</p></div>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
