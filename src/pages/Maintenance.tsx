
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getMaintenanceSchedules, getMaintenanceHistory } from '@/services/maintenanceService';
import type { MaintenanceSchedule, MaintenanceHistoryItem } from '@/types/maintenance';

export default function Maintenance() {
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [history, setHistory] = useState<MaintenanceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMaintenanceData();
  }, []);

  const loadMaintenanceData = async () => {
    try {
      setLoading(true);
      const [schedulesData, historyData] = await Promise.all([
        getMaintenanceSchedules(),
        getMaintenanceHistory()
      ]);
      setSchedules(schedulesData);
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading maintenance data:', error);
      toast({
        title: "Error",
        description: "Failed to load maintenance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'destructive';
      case 'scheduled': return 'default';
      case 'completed': return 'secondary';
      case 'in-progress': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
          <p className="text-muted-foreground">
            Manage equipment maintenance schedules and track service history
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Maintenance
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {schedules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="mx-auto h-12 w-12 opacity-50 mb-4" />
                <p>No maintenance scheduled</p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule First Maintenance
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {schedules.slice(0, 5).map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{schedule.description}</h4>
                        <Badge variant={getStatusColor('scheduled')}>
                          {schedule.frequency}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Next: {schedule.nextDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {schedule.notificationsEnabled && (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      )}
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Recent Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="mx-auto h-12 w-12 opacity-50 mb-4" />
                <p>No maintenance history</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{record.equipmentName}</h4>
                        <Badge variant={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {record.date} • {record.type}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{schedules.length}</div>
              <div className="text-sm text-muted-foreground">Scheduled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {schedules.filter(s => new Date(s.nextDate) < new Date()).length}
              </div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {history.filter(h => h.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {history.length > 0 ? Math.round((history.filter(h => h.status === 'completed').length / history.length) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
