import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dumbbell, LogOut, User, Calendar, Activity, Loader2, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';

interface ClientData { id: string; first_name: string; last_name: string; email: string; fitness_level: string; goals: string | null; }
interface Session { id: string; session_date: string; duration_minutes: number; session_type: string; status: string; location: string | null; }
interface Metric { id: string; recorded_date: string; weight_kg: number | null; body_fat_percent: number | null; chest_cm: number | null; waist_cm: number | null; }
interface Program { id: string; name: string; description: string | null; duration_weeks: number; difficulty: string; goal: string | null; }

export default function PTPortalDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<ClientData | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);

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
        .from('pt_clients').select('id, first_name, last_name, email, fitness_level, goals').eq('user_id', session.user.id).maybeSingle();
      if (!cl) {
        await supabase.auth.signOut();
        toast({ title: "Access Denied", description: "No client account found.", variant: "destructive" });
        navigate('/pt-portal/login'); return;
      }
      setClient(cl);

      // Load sessions
      const { data: sessData } = await (supabase as any)
        .from('pt_sessions').select('id, session_date, duration_minutes, session_type, status, location')
        .eq('client_id', cl.id).order('session_date', { ascending: false }).limit(20);
      setSessions(sessData || []);

      // Load metrics
      const { data: metData } = await (supabase as any)
        .from('pt_body_metrics').select('id, recorded_date, weight_kg, body_fat_percent, chest_cm, waist_cm')
        .eq('client_id', cl.id).order('recorded_date', { ascending: false }).limit(10);
      setMetrics(metData || []);

      // Load programs
      const { data: progData } = await (supabase as any)
        .from('pt_client_programs').select('*, pt_workout_programs(id, name, description, duration_weeks, difficulty, goal)')
        .eq('client_id', cl.id).eq('status', 'active');
      setPrograms((progData || []).map((p: any) => p.pt_workout_programs).filter(Boolean));
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
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

        <Tabs defaultValue="sessions">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sessions"><Calendar className="h-4 w-4 mr-1" />Sessions</TabsTrigger>
            <TabsTrigger value="programs"><ClipboardList className="h-4 w-4 mr-1" />Programs</TabsTrigger>
            <TabsTrigger value="progress"><Activity className="h-4 w-4 mr-1" />Progress</TabsTrigger>
          </TabsList>

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
            ) : programs.map(p => (
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
            ) : metrics.map(m => (
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
