
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
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      <Card className="border border-yellow-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="pb-2 border-b border-yellow-100">
          <CardTitle className="text-yellow-800 text-lg flex items-center">
            <span className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></span>
            Pending
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="text-3xl font-bold text-yellow-700">{pendingCount}</div>
          <p className="text-yellow-600 text-sm mt-1">Work orders awaiting action</p>
        </CardContent>
      </Card>

      <Card className="border border-blue-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="pb-2 border-b border-blue-100">
          <CardTitle className="text-blue-800 text-lg flex items-center">
            <span className="h-3 w-3 rounded-full bg-blue-500 mr-2"></span>
            In Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="text-3xl font-bold text-blue-700">{inProgressCount}</div>
          <p className="text-blue-600 text-sm mt-1">Work orders being processed</p>
        </CardContent>
      </Card>

      <Card className="border border-green-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="pb-2 border-b border-green-100">
          <CardTitle className="text-green-800 text-lg flex items-center">
            <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
            Completed
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="text-3xl font-bold text-green-700">{completedCount}</div>
          <p className="text-green-600 text-sm mt-1">Work orders finalized</p>
        </CardContent>
      </Card>
    </div>
  );
}
