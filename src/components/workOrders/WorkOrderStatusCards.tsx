
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { WorkOrder } from '@/types/workOrder';
import { Skeleton } from '@/components/ui/skeleton';

interface WorkOrderStatusCardsProps {
  workOrders: WorkOrder[];
  loading: boolean;
}

export function WorkOrderStatusCards({ workOrders, loading }: WorkOrderStatusCardsProps) {
  const pendingCount = workOrders.filter(wo => wo.status === 'pending').length;
  const inProgressCount = workOrders.filter(wo => wo.status === 'in-progress').length;
  const completedCount = workOrders.filter(wo => wo.status === 'completed').length;

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-yellow-800 text-lg">Pending</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-700">{pendingCount}</div>
          <p className="text-yellow-600 text-sm">Work orders awaiting action</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-800 text-lg">In Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-700">{inProgressCount}</div>
          <p className="text-blue-600 text-sm">Work orders being processed</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-green-800 text-lg">Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-700">{completedCount}</div>
          <p className="text-green-600 text-sm">Work orders finalized</p>
        </CardContent>
      </Card>
    </div>
  );
}
