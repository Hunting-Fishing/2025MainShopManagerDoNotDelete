
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderTechniciansPerformance } from './WorkOrderTechniciansPerformance';
import { WorkOrderPriorityDistribution } from './WorkOrderPriorityDistribution';
import { WorkOrderCompletionMetrics } from './WorkOrderCompletionMetrics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';

interface WorkOrderAnalyticsProps {
  workOrders: WorkOrder[];
}

export function WorkOrderAnalytics({ workOrders }: WorkOrderAnalyticsProps) {
  const [refreshKey, setRefreshKey] = React.useState(0);
  
  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  if (workOrders.length === 0) {
    return (
      <Card className="w-full p-6 flex flex-col items-center justify-center">
        <CardTitle className="text-xl mb-2">No Work Orders Available</CardTitle>
        <CardDescription>
          There are no work orders matching your criteria to display in analytics.
        </CardDescription>
      </Card>
    );
  }

  return (
    <div key={refreshKey} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Work Order Analytics</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <WorkOrderTechniciansPerformance workOrders={workOrders} />
        
        <WorkOrderPriorityDistribution workOrders={workOrders} />
        
        <WorkOrderCompletionMetrics workOrders={workOrders} />
      </div>
    </div>
  );
}
