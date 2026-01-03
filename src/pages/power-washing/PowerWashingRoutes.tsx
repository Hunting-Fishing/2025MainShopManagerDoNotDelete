import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Plus,
  Play,
  CheckCircle,
  Navigation,
  Truck,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, startOfWeek } from 'date-fns';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface Route {
  id: string;
  route_date: string;
  route_name: string | null;
  assigned_crew: any[];
  total_jobs: number;
  estimated_duration_minutes: number | null;
  total_distance_miles: number | null;
  status: string;
  start_location: string | null;
  end_location: string | null;
}

export default function PowerWashingRoutes() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: routes, isLoading } = useQuery({
    queryKey: ['power-washing-routes', selectedDate],
    queryFn: async () => {
      const weekStart = startOfWeek(new Date(selectedDate));
      const weekEnd = addDays(weekStart, 6);
      
      const { data, error } = await supabase
        .from('power_washing_routes')
        .select('*')
        .gte('route_date', format(weekStart, 'yyyy-MM-dd'))
        .lte('route_date', format(weekEnd, 'yyyy-MM-dd'))
        .order('route_date', { ascending: true });
      
      if (error) throw error;
      return data as Route[];
    },
  });

  const createRouteMutation = useMutation({
    mutationFn: async (date: string) => {
      const { data: shopData } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      const { data, error } = await supabase
        .from('power_washing_routes')
        .insert({
          shop_id: shopData?.shop_id,
          route_date: date,
          route_name: `Route ${format(new Date(date), 'MMM d')}`,
          status: 'planned',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['power-washing-routes'] });
      toast.success('Route created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create route');
      console.error(error);
    },
  });

  const updateRouteStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('power_washing_routes')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['power-washing-routes'] });
      toast.success('Route status updated');
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'in_progress': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfWeek(new Date(selectedDate)), i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      dayName: format(date, 'EEE'),
      dayNum: format(date, 'd'),
      isToday: format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
    };
  });

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/power-washing')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Navigation className="h-8 w-8 text-indigo-500" />
              Route Planning
            </h1>
            <p className="text-muted-foreground mt-1">
              Optimize your daily job routes for maximum efficiency
            </p>
          </div>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-48"
          />
        </div>
      </div>

      {/* Week View */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {weekDays.map((day) => (
          <Button
            key={day.date}
            variant={day.date === selectedDate ? 'default' : 'outline'}
            className={`flex flex-col h-16 ${day.isToday ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedDate(day.date)}
          >
            <span className="text-xs opacity-70">{day.dayName}</span>
            <span className="text-lg font-bold">{day.dayNum}</span>
          </Button>
        ))}
      </div>

      {/* Routes Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : routes && routes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {routes.map((route) => (
            <Card 
              key={route.id} 
              className="border-border hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => navigate(`/power-washing/routes/${route.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{route.route_name || 'Unnamed Route'}</CardTitle>
                  <Badge className={getStatusColor(route.status)}>
                    {route.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(route.route_date), 'EEEE, MMM d')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    <span>{route.total_jobs} jobs</span>
                  </div>
                  {route.estimated_duration_minutes && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{Math.round(route.estimated_duration_minutes / 60)}h {route.estimated_duration_minutes % 60}m estimated</span>
                    </div>
                  )}
                  {route.total_distance_miles && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{route.total_distance_miles.toFixed(1)} miles</span>
                    </div>
                  )}
                  {route.assigned_crew && route.assigned_crew.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{route.assigned_crew.length} crew members</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4">
                  {route.status === 'planned' && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateRouteStatus.mutate({ id: route.id, status: 'in_progress' });
                      }}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </Button>
                  )}
                  {route.status === 'in_progress' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-500/30 text-green-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateRouteStatus.mutate({ id: route.id, status: 'completed' });
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Add Route Card */}
          <Card 
            className="border-dashed border-2 border-muted-foreground/30 hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-center min-h-[200px]"
            onClick={() => createRouteMutation.mutate(selectedDate)}
          >
            <div className="text-center text-muted-foreground">
              <Plus className="h-8 w-8 mx-auto mb-2" />
              <p>Create Route for {format(new Date(selectedDate), 'MMM d')}</p>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <Navigation className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">No Routes Planned</h3>
            <p className="text-muted-foreground mb-4">
              Create a route to organize your jobs for efficient scheduling
            </p>
            <Button onClick={() => createRouteMutation.mutate(selectedDate)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Route for {format(new Date(selectedDate), 'MMM d')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
