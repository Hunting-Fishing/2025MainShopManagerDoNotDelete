
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, FileCheck, FileWarning, UserCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getWorkOrderPhaseCompletionRate } from '@/services/dashboard/workOrderService';

export function WorkOrderStats() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    completionRate: 'N/A'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkOrderStats = async () => {
      try {
        setLoading(true);
        
        // Fetch work order counts by status
        const { data: workOrders, error } = await supabase
          .from('work_orders')
          .select('id, status')
          .not('status', 'is', null);
        
        if (error) throw error;
        
        const total = workOrders?.length || 0;
        const pending = workOrders?.filter(wo => wo.status === 'pending').length || 0;
        const inProgress = workOrders?.filter(wo => wo.status === 'in-progress').length || 0;
        const completed = workOrders?.filter(wo => wo.status === 'completed').length || 0;
        const cancelled = workOrders?.filter(wo => wo.status === 'cancelled').length || 0;
        
        // Get overall completion rate
        const completionRate = await getWorkOrderPhaseCompletionRate();
        
        setStats({
          total,
          pending,
          inProgress,
          completed,
          cancelled,
          completionRate
        });
      } catch (error) {
        console.error('Error fetching work order stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkOrderStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <FileCheck className="h-5 w-5 text-primary mr-2" />
            <span className="text-2xl font-bold">
              {loading ? '...' : stats.total}
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-2xl font-bold">
              {loading ? '...' : stats.inProgress}
            </span>
            <span className="text-sm text-muted-foreground ml-2">
              {loading ? '' : `(${stats.total ? Math.round((stats.inProgress / stats.total) * 100) : 0}%)`}
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <UserCheck className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-2xl font-bold">
              {loading ? '...' : stats.completionRate}
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <FileWarning className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="text-2xl font-bold">
              {loading ? '...' : stats.pending}
            </span>
            <span className="text-sm text-muted-foreground ml-2">
              {loading ? '' : `(${stats.total ? Math.round((stats.pending / stats.total) * 100) : 0}%)`}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
