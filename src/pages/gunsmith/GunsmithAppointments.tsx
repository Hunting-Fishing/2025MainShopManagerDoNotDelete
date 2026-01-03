import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  CalendarDays, 
  Plus, 
  ArrowLeft,
  Clock,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const APPOINTMENT_TYPES = ['Repair Drop-off', 'Pickup', 'Consultation', 'Estimate', 'Cleaning', 'Custom Work', 'Transfer'];

export default function GunsmithAppointments() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    appointment_date: '',
    appointment_time: '',
    appointment_type: '',
    duration_minutes: '60',
    notes: ''
  });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['gunsmith-appointments', weekStart, weekEnd],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('gunsmith_appointments')
        .select('*, customers(first_name, last_name)')
        .gte('appointment_date', format(weekStart, 'yyyy-MM-dd'))
        .lte('appointment_date', format(weekEnd, 'yyyy-MM-dd'))
        .order('appointment_time');
      if (error) throw error;
      return data;
    }
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('customers').select('id, first_name, last_name').order('first_name');
      if (error) throw error;
      return data;
    }
  });

  const createAppointment = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await (supabase as any)
        .from('gunsmith_appointments')
        .insert({
          customer_id: data.customer_id,
          appointment_date: data.appointment_date,
          appointment_time: data.appointment_time,
          appointment_type: data.appointment_type,
          duration_minutes: parseInt(data.duration_minutes),
          notes: data.notes || null
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gunsmith-appointments'] });
      toast({ title: 'Appointment scheduled' });
      setIsDialogOpen(false);
      setFormData({ customer_id: '', appointment_date: '', appointment_time: '', appointment_type: '', duration_minutes: '60', notes: '' });
    },
    onError: () => {
      toast({ title: 'Failed to schedule appointment', variant: 'destructive' });
    }
  });

  const getAppointmentsForDay = (day: Date) => {
    return appointments?.filter((a: any) => isSameDay(new Date(a.appointment_date), day)) || [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'no_show': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/gunsmith')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <CalendarDays className="h-8 w-8 text-blue-500" />
              Appointments
            </h1>
            <p className="text-muted-foreground mt-1">Schedule and manage appointments</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Customer *</Label>
                <Select value={formData.customer_id} onValueChange={(v) => setFormData({ ...formData, customer_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {customers?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date *</Label>
                  <Input type="date" value={formData.appointment_date} onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })} />
                </div>
                <div>
                  <Label>Time *</Label>
                  <Input type="time" value={formData.appointment_time} onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type *</Label>
                  <Select value={formData.appointment_type} onValueChange={(v) => setFormData({ ...formData, appointment_type: v })}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {APPOINTMENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duration (min)</Label>
                  <Select value={formData.duration_minutes} onValueChange={(v) => setFormData({ ...formData, duration_minutes: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
              </div>
              <Button className="w-full" onClick={() => createAppointment.mutate(formData)} disabled={!formData.customer_id || !formData.appointment_date || !formData.appointment_time || !formData.appointment_type || createAppointment.isPending}>
                {createAppointment.isPending ? 'Scheduling...' : 'Schedule Appointment'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Week Navigation */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setCurrentDate(addWeeks(currentDate, -1))}>Previous Week</Button>
            <div className="text-center">
              <h2 className="text-lg font-semibold">{format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}</h2>
              <Button variant="link" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
            </div>
            <Button variant="outline" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>Next Week</Button>
          </div>
        </CardContent>
      </Card>

      {/* Week Calendar */}
      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isToday = isSameDay(day, new Date());
            return (
              <Card key={day.toISOString()} className={isToday ? 'ring-2 ring-primary' : ''}>
                <CardHeader className="py-3">
                  <CardTitle className="text-center text-sm">
                    <div className={`${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                      {format(day, 'EEE')}
                    </div>
                    <div className={`text-2xl ${isToday ? 'text-primary' : ''}`}>{format(day, 'd')}</div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 min-h-[200px]">
                  {dayAppointments.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No appointments</p>
                  ) : (
                    <div className="space-y-2">
                      {dayAppointments.map((apt: any) => (
                        <div key={apt.id} className={`p-2 rounded ${getStatusColor(apt.status)} bg-opacity-20 text-xs`}>
                          <div className="flex items-center gap-1 font-medium">
                            <Clock className="h-3 w-3" />
                            {apt.appointment_time?.slice(0, 5)}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <User className="h-3 w-3" />
                            {apt.customers?.first_name}
                          </div>
                          <Badge variant="outline" className="mt-1 text-[10px]">{apt.appointment_type}</Badge>
                        </div>
                      ))}
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
