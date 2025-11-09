import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Wrench, DollarSign, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateMaintenanceForecast } from '@/services/maintenance/predictiveMaintenanceService';
import { format } from 'date-fns';

export default function MaintenancePlanning() {
  const { data: schedules, isLoading } = useQuery({
    queryKey: ['maintenance-schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_schedules')
        .select('*')
        .order('next_due_date', { ascending: true })
        .limit(50);
      if (error) throw error;
      return data;
    }
  });

  const { data: predictions } = useQuery({
    queryKey: ['maintenance-predictions'],
    queryFn: generateMaintenanceForecast
  });

  const upcomingCount = schedules?.filter(s => {
    const daysUntil = Math.floor((new Date(s.next_due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 30 && daysUntil >= 0;
  }).length || 0;

  const overdueCount = schedules?.filter(s => new Date(s.next_due_date) < new Date()).length || 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Maintenance Planning</h1>
        <p className="text-muted-foreground">
          Predictive maintenance scheduling with automatic parts ordering
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Due in 30 Days</CardTitle>
            <Wrench className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{upcomingCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Predictions</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{predictions?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Maintenance Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading schedules...</p>
          ) : schedules?.length === 0 ? (
            <p className="text-muted-foreground">No maintenance schedules found</p>
          ) : (
            <div className="space-y-3">
              {schedules?.slice(0, 10).map(schedule => {
                const daysUntil = Math.floor((new Date(schedule.next_due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const isOverdue = daysUntil < 0;
                const isDueSoon = daysUntil <= 7 && daysUntil >= 0;
                
                return (
                  <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{schedule.title}</h4>
                      <p className="text-sm text-muted-foreground">{schedule.maintenance_type}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {format(new Date(schedule.next_due_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {isOverdue ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days`}
                      </div>
                      {schedule.estimated_cost && (
                        <p className="text-sm text-muted-foreground">${schedule.estimated_cost}</p>
                      )}
                    </div>
                    <Button size="sm" className="ml-4">Schedule</Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
