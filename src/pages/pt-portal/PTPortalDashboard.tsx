import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dumbbell, LogOut, Calendar, Activity, Loader2, ClipboardList, CheckCircle2,
  MessageSquare, Send, ClipboardCheck, Package, CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ClientData { id: string; first_name: string; last_name: string; email: string; fitness_level: string; goals: string | null; shop_id: string; }

export default function PTPortalDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<ClientData | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [workoutDays, setWorkoutDays] = useState<any[]>([]);
  const [dayExercises, setDayExercises] = useState<Record<string, any[]>>({});
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [loggingExercise, setLoggingExercise] = useState<string | null>(null);
  const [logWeight, setLogWeight] = useState('');

  // Check-in state
  const [checkInForm, setCheckInForm] = useState({ weight: '', mood: 'good', energy_level: [7], sleep_hours: '', notes: '' });
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false);

  // Messages state
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      setCurrentUserId(session.user.id);

      const { data: cl } = await (supabase as any)
        .from('pt_clients').select('id, first_name, last_name, email, fitness_level, goals, shop_id').eq('user_id', session.user.id).maybeSingle();
      if (!cl) {
        await supabase.auth.signOut();
        toast({ title: "Access Denied", description: "No client account found.", variant: "destructive" });
        navigate('/pt-portal/login'); return;
      }
      setClient(cl);

      // Parallel data loading
      const [sessRes, metRes, progRes, pkgRes, msgRes, logRes] = await Promise.all([
        (supabase as any).from('pt_sessions').select('id, session_date, duration_minutes, session_type, status, location')
          .eq('client_id', cl.id).order('session_date', { ascending: false }).limit(20),
        (supabase as any).from('pt_body_metrics').select('id, recorded_date, weight_kg, body_fat_percent, chest_cm, waist_cm')
          .eq('client_id', cl.id).order('recorded_date', { ascending: false }).limit(20),
        (supabase as any).from('pt_client_programs').select('*, pt_workout_programs(id, name, description, duration_weeks, difficulty, goal)')
          .eq('client_id', cl.id).eq('status', 'active'),
        (supabase as any).from('pt_client_packages').select('*, pt_packages(name, price, session_count)')
          .eq('client_id', cl.id).eq('status', 'active'),
        (supabase as any).from('pt_messages').select('*')
          .eq('client_id', cl.id).order('created_at', { ascending: true }).limit(100),
        (supabase as any).from('pt_workout_logs').select('exercise_id, workout_day_id')
          .eq('client_id', cl.id)
          .gte('completed_at', new Date().toISOString().split('T')[0] + 'T00:00:00')
          .lte('completed_at', new Date().toISOString().split('T')[0] + 'T23:59:59'),
      ]);

      setSessions(sessRes.data || []);
      setMetrics(metRes.data || []);
      const progs = (progRes.data || []).map((p: any) => ({ ...p.pt_workout_programs, assignment_id: p.id })).filter(Boolean);
      setPrograms(progs);
      setPackages(pkgRes.data || []);
      setMessages(msgRes.data || []);
      setCompletedExercises(new Set((logRes.data || []).map((l: any) => `${l.workout_day_id}_${l.exercise_id}`)));
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
        const { data: exs } = await (supabase as any).from('pt_workout_day_exercises')
          .select('*, pt_exercises(name, muscle_group, equipment)')
          .eq('shop_id', client.shop_id).in('workout_day_id', days.map((d: any) => d.id)).order('sort_order');
        const grouped: Record<string, any[]> = {};
        (exs || []).forEach((e: any) => { if (!grouped[e.workout_day_id]) grouped[e.workout_day_id] = []; grouped[e.workout_day_id].push(e); });
        setDayExercises(grouped);
      }
    };
    loadDays();
  }, [selectedProgramId, client]);

  // Refresh messages periodically
  useEffect(() => {
    if (!client) return;
    const interval = setInterval(async () => {
      const { data } = await (supabase as any).from('pt_messages').select('*')
        .eq('client_id', client.id).order('created_at', { ascending: true }).limit(100);
      if (data) setMessages(data);
    }, 5000);
    return () => clearInterval(interval);
  }, [client]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const logExerciseCompletion = async (dayId: string, exerciseId: string, programId: string) => {
    if (!client) return;
    const key = `${dayId}_${exerciseId}`;
    if (completedExercises.has(key)) return;
    try {
      const { error } = await (supabase as any).from('pt_workout_logs').insert({
        shop_id: client.shop_id, client_id: client.id, program_id: programId,
        workout_day_id: dayId, exercise_id: exerciseId,
        weight_used: logWeight ? parseFloat(logWeight) : null, completed_at: new Date().toISOString(),
      });
      if (error) throw error;
      setCompletedExercises(prev => new Set(prev).add(key));
      setLoggingExercise(null); setLogWeight('');
      toast({ title: 'Exercise completed! 💪' });
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const submitCheckIn = async () => {
    if (!client) return;
    setSubmittingCheckIn(true);
    try {
      const { error } = await (supabase as any).from('pt_check_ins').insert({
        client_id: client.id, shop_id: client.shop_id, check_in_date: new Date().toISOString().split('T')[0],
        weight: checkInForm.weight ? parseFloat(checkInForm.weight) : null,
        mood: checkInForm.mood, energy_level: checkInForm.energy_level[0],
        sleep_hours: checkInForm.sleep_hours ? parseFloat(checkInForm.sleep_hours) : null,
        notes: checkInForm.notes || null, status: 'submitted',
      });
      if (error) throw error;
      toast({ title: 'Check-in submitted! ✅' });
      setCheckInForm({ weight: '', mood: 'good', energy_level: [7], sleep_hours: '', notes: '' });
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    finally { setSubmittingCheckIn(false); }
  };

  const sendMessage = async () => {
    if (!client || !currentUserId || !messageText.trim()) return;
    setSendingMessage(true);
    try {
      const { error } = await (supabase as any).from('pt_messages').insert({
        shop_id: client.shop_id, client_id: client.id, sender_id: currentUserId,
        content: messageText.trim(), message_type: 'text',
      });
      if (error) throw error;
      setMessageText('');
      const { data } = await (supabase as any).from('pt_messages').select('*')
        .eq('client_id', client.id).order('created_at', { ascending: true }).limit(100);
      if (data) setMessages(data);
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    finally { setSendingMessage(false); }
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); navigate('/pt-portal/login'); };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>;

  const upcomingSessions = sessions.filter(s => new Date(s.session_date) >= new Date() && s.status === 'scheduled');

  // Progress chart data (reverse for chronological order)
  const chartData = [...metrics].reverse().map((m: any) => ({
    date: format(new Date(m.recorded_date), 'MMM d'),
    weight: m.weight_kg, bodyFat: m.body_fat_percent, waist: m.waist_cm,
  }));

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
        {/* Quick Stats + Package Balance */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{upcomingSessions.length}</p><p className="text-xs text-muted-foreground">Upcoming Sessions</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{programs.length}</p><p className="text-xs text-muted-foreground">Active Programs</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{packages.reduce((s: number, p: any) => s + (p.remaining_sessions || 0), 0)}</p><p className="text-xs text-muted-foreground">Sessions Left</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{packages.length}</p><p className="text-xs text-muted-foreground">Active Packages</p></CardContent></Card>
        </div>

        <Tabs defaultValue="workouts">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
            <TabsTrigger value="workouts" className="text-xs"><Dumbbell className="h-3 w-3 mr-1" />Workouts</TabsTrigger>
            <TabsTrigger value="checkin" className="text-xs"><ClipboardCheck className="h-3 w-3 mr-1" />Check-In</TabsTrigger>
            <TabsTrigger value="messages" className="text-xs"><MessageSquare className="h-3 w-3 mr-1" />Messages</TabsTrigger>
            <TabsTrigger value="progress" className="text-xs"><Activity className="h-3 w-3 mr-1" />Progress</TabsTrigger>
            <TabsTrigger value="sessions" className="text-xs"><Calendar className="h-3 w-3 mr-1" />Sessions</TabsTrigger>
            <TabsTrigger value="packages" className="text-xs"><Package className="h-3 w-3 mr-1" />Packages</TabsTrigger>
          </TabsList>

          {/* Workouts Tab */}
          <TabsContent value="workouts" className="space-y-4 mt-4">
            {programs.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No active programs assigned yet.</CardContent></Card>
            ) : (
              <>
                <div className="flex gap-2 flex-wrap">
                  {programs.map((p: any) => (
                    <Button key={p.id} size="sm" variant={selectedProgramId === p.id ? 'default' : 'outline'} onClick={() => setSelectedProgramId(p.id)}>{p.name}</Button>
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
                                <div><CardTitle className="text-sm">{day.name}</CardTitle>{day.focus_area && <p className="text-xs text-muted-foreground">{day.focus_area}</p>}</div>
                              </div>
                              <Badge variant={allDone ? 'default' : 'secondary'} className="text-xs">{completedCount}/{exercises.length}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            {exercises.length === 0 ? <p className="text-xs text-muted-foreground py-2">No exercises</p> : (
                              <div className="space-y-2">
                                {exercises.map((ex: any) => {
                                  const isCompleted = completedExercises.has(`${day.id}_${ex.exercise_id}`);
                                  const isLogging = loggingExercise === `${day.id}_${ex.exercise_id}`;
                                  return (
                                    <div key={ex.id} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isCompleted ? 'bg-green-100/50 dark:bg-green-950/30' : 'bg-muted/50'}`}>
                                      <Checkbox checked={isCompleted} disabled={isCompleted} onCheckedChange={() => { if (!isCompleted) setLoggingExercise(`${day.id}_${ex.exercise_id}`); }} />
                                      <div className="flex-1 min-w-0">
                                        <p className={`font-medium text-sm ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>{ex.pt_exercises?.name}</p>
                                        <div className="flex gap-2 mt-0.5"><span className="text-xs text-muted-foreground">{ex.sets} × {ex.reps}</span>{ex.rest_seconds && <span className="text-xs text-muted-foreground">· {ex.rest_seconds}s rest</span>}</div>
                                      </div>
                                      {isLogging && (
                                        <div className="flex items-center gap-2">
                                          <Input type="number" placeholder="lbs" className="w-16 h-8 text-xs" value={logWeight} onChange={e => setLogWeight(e.target.value)} />
                                          <Button size="sm" className="h-8 text-xs" onClick={() => logExerciseCompletion(day.id, ex.exercise_id, selectedProgramId!)}>Done</Button>
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
                {selectedProgramId && workoutDays.length === 0 && <Card><CardContent className="py-8 text-center text-muted-foreground">No workout days set up yet.</CardContent></Card>}
                {!selectedProgramId && <Card><CardContent className="py-8 text-center text-muted-foreground">Select a program above</CardContent></Card>}
              </>
            )}
          </TabsContent>

          {/* Weekly Check-In Tab */}
          <TabsContent value="checkin" className="mt-4">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-orange-500" />Weekly Check-In</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Weight (lbs)</Label><Input type="number" value={checkInForm.weight} onChange={e => setCheckInForm(f => ({ ...f, weight: e.target.value }))} placeholder="e.g. 175" /></div>
                  <div><Label>Sleep (hours)</Label><Input type="number" step="0.5" value={checkInForm.sleep_hours} onChange={e => setCheckInForm(f => ({ ...f, sleep_hours: e.target.value }))} placeholder="e.g. 7.5" /></div>
                </div>
                <div>
                  <Label>Mood</Label>
                  <Select value={checkInForm.mood} onValueChange={v => setCheckInForm(f => ({ ...f, mood: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="great">😄 Great</SelectItem>
                      <SelectItem value="good">🙂 Good</SelectItem>
                      <SelectItem value="okay">😐 Okay</SelectItem>
                      <SelectItem value="tired">😴 Tired</SelectItem>
                      <SelectItem value="stressed">😰 Stressed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Energy Level: {checkInForm.energy_level[0]}/10</Label>
                  <Slider value={checkInForm.energy_level} onValueChange={v => setCheckInForm(f => ({ ...f, energy_level: v }))} min={1} max={10} step={1} className="mt-2" />
                </div>
                <div><Label>Notes</Label><Textarea value={checkInForm.notes} onChange={e => setCheckInForm(f => ({ ...f, notes: e.target.value }))} placeholder="How was your week? Any challenges?" /></div>
                <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white" disabled={submittingCheckIn} onClick={submitCheckIn}>
                  {submittingCheckIn ? 'Submitting...' : 'Submit Check-In'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="mt-4">
            <Card className="flex flex-col h-[500px]">
              <CardHeader className="py-3 border-b"><CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4" />Chat with Trainer</CardTitle></CardHeader>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">No messages yet. Say hello!</p>
                ) : messages.map((msg: any) => {
                  const isMe = msg.sender_id === currentUserId;
                  return (
                    <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                      <div className={cn('max-w-[75%] rounded-2xl px-4 py-2', isMe ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted rounded-bl-md')}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={cn('text-[10px] mt-1', isMe ? 'text-primary-foreground/60' : 'text-muted-foreground')}>{format(new Date(msg.created_at), 'h:mm a')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-3 border-t flex gap-2">
                <Input value={messageText} onChange={e => setMessageText(e.target.value)} placeholder="Type a message..." className="flex-1" onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} />
                <Button size="icon" disabled={!messageText.trim() || sendingMessage} onClick={sendMessage} className="bg-gradient-to-r from-orange-500 to-red-600"><Send className="h-4 w-4" /></Button>
              </div>
            </Card>
          </TabsContent>

          {/* Progress Tab with Charts */}
          <TabsContent value="progress" className="space-y-4 mt-4">
            {chartData.length >= 2 && (
              <Card>
                <CardHeader><CardTitle className="text-sm">Weight Over Time</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Line type="monotone" dataKey="weight" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} name="Weight (kg)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
            {chartData.length >= 2 && chartData.some(d => d.bodyFat) && (
              <Card>
                <CardHeader><CardTitle className="text-sm">Body Fat % Over Time</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Line type="monotone" dataKey="bodyFat" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} name="Body Fat %" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
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

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-3 mt-4">
            {sessions.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No sessions scheduled yet.</CardContent></Card>
            ) : sessions.map(s => (
              <Card key={s.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{format(new Date(s.session_date), 'EEEE, MMM d, yyyy')}</p>
                    <p className="text-sm text-muted-foreground">{format(new Date(s.session_date), 'h:mm a')} · {s.duration_minutes}min · {s.session_type?.replace('_', ' ')}</p>
                    {s.location && <p className="text-xs text-muted-foreground mt-1">📍 {s.location}</p>}
                  </div>
                  <Badge variant={s.status === 'completed' ? 'default' : s.status === 'canceled' ? 'destructive' : 'secondary'}>{s.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages" className="space-y-3 mt-4">
            {packages.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No active packages.</CardContent></Card>
            ) : packages.map((pkg: any) => (
              <Card key={pkg.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{pkg.pt_packages?.name}</h3>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-2 rounded-lg bg-muted/50 text-center">
                      <p className="text-lg font-bold">{pkg.remaining_sessions}</p>
                      <p className="text-xs text-muted-foreground">Sessions Left</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50 text-center">
                      <p className="text-lg font-bold">{pkg.pt_packages?.session_count || 0}</p>
                      <p className="text-xs text-muted-foreground">Total Sessions</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50 text-center">
                      <p className="text-lg font-bold">${pkg.pt_packages?.price || 0}</p>
                      <p className="text-xs text-muted-foreground">Package Price</p>
                    </div>
                  </div>
                  {pkg.end_date && <p className="text-xs text-muted-foreground mt-3">Expires: {format(new Date(pkg.end_date), 'MMM d, yyyy')}</p>}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
