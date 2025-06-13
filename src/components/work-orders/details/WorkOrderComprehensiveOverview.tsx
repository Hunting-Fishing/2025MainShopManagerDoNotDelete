
import React, { useState, useEffect } from 'react';
import { WorkOrder, TimeEntry } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WorkOrderDetailsHeader } from './WorkOrderDetailsHeader';
import { JobLinesWithPartsDisplay } from './JobLinesWithPartsDisplay';
import { WorkOrderFinancialSummary } from './WorkOrderFinancialSummary';
import { WorkOrderCustomerVehicleInfo } from './WorkOrderCustomerVehicleInfo';
import { WorkOrderDetailsActions } from './WorkOrderDetailsActions';
import { Clock, Activity, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WorkOrderComprehensiveOverviewProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  timeEntries: TimeEntry[];
}

export function WorkOrderComprehensiveOverview({
  workOrder,
  jobLines,
  allParts,
  timeEntries
}: WorkOrderComprehensiveOverviewProps) {
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [recentCommunications, setRecentCommunications] = useState<any[]>([]);

  useEffect(() => {
    fetchRecentData();
  }, [workOrder.id]);

  const fetchRecentData = async () => {
    try {
      // Fetch recent activities
      const { data: activities } = await supabase
        .from('work_order_activities')
        .select('*')
        .eq('work_order_id', workOrder.id)
        .order('timestamp', { ascending: false })
        .limit(3);

      // Fetch recent communications
      const { data: communications } = await supabase
        .from('customer_communications')
        .select('*')
        .eq('customer_id', workOrder.customer_id)
        .order('date', { ascending: false })
        .limit(3);

      setRecentActivities(activities || []);
      setRecentCommunications(communications || []);
    } catch (error) {
      console.error('Error fetching recent data:', error);
    }
  };

  const getStatusProgress = (status: string): number => {
    const statusMap: Record<string, number> = {
      'pending': 10,
      'in-progress': 50,
      'completed': 100,
      'on-hold': 30,
      'cancelled': 0
    };
    return statusMap[status] || 0;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="space-y-6">
      {/* Work Order Header with Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <WorkOrderDetailsHeader workOrder={workOrder} />
        <WorkOrderDetailsActions workOrder={workOrder} />
      </div>

      {/* Status Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Work Order Progress</CardTitle>
            <Badge variant="outline">{workOrder.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Status: {workOrder.status}</span>
              <span>{getStatusProgress(workOrder.status)}%</span>
            </div>
            <Progress value={getStatusProgress(workOrder.status)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Customer & Vehicle Information */}
      <WorkOrderCustomerVehicleInfo workOrder={workOrder} />

      {/* Financial Summary */}
      <WorkOrderFinancialSummary 
        workOrder={workOrder}
        jobLines={jobLines}
        allParts={allParts}
      />

      {/* Job Lines Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Job Lines & Parts Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <JobLinesWithPartsDisplay
            workOrderId={workOrder.id}
            jobLines={jobLines}
            onJobLinesChange={() => {}}
            isEditMode={false}
          />
        </CardContent>
      </Card>

      {/* Recent Activity & Communications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{activity.action.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground">{activity.user_name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Communications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Communications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentCommunications.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No recent communications</p>
            ) : (
              <div className="space-y-3">
                {recentCommunications.map((comm) => (
                  <div key={comm.id} className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{comm.type}: {comm.subject || 'No subject'}</p>
                      <p className="text-xs text-muted-foreground">{comm.staff_member_name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(comm.date)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Time Tracking Summary */}
      {timeEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Tracking Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold">{timeEntries.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-2xl font-bold">
                  {Math.round(timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60)}h
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Billable Time</p>
                <p className="text-2xl font-bold">
                  {Math.round(timeEntries.filter(entry => entry.billable).reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technical Notes */}
      {workOrder.description && (
        <Card>
          <CardHeader>
            <CardTitle>Technical Notes & Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm p-4 bg-muted rounded-lg">
              {workOrder.description}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
