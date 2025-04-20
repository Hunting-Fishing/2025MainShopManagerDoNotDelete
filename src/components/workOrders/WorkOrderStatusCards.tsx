
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WorkOrder } from '@/types/workOrder';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';

interface WorkOrderStatusCardsProps {
  workOrders: WorkOrder[];
  loading: boolean;
}

export function WorkOrderStatusCards({ workOrders, loading }: WorkOrderStatusCardsProps) {
  const pendingCount = workOrders.filter(wo => wo.status === 'pending').length;
  const inProgressCount = workOrders.filter(wo => wo.status === 'in-progress').length;
  const completedCount = workOrders.filter(wo => wo.status === 'completed').length;
  const overdueCount = 0; // This would need a proper calculation based on due dates
  const dueTodayCount = 0; // This would need a proper calculation based on due dates

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      <Card className="bg-white border shadow-sm overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Total Work Orders</span>
            <div className="flex items-center mt-1">
              <span className="text-3xl font-bold text-purple-700">{workOrders.length}</span>
              <span className="ml-2 p-1 rounded-full bg-purple-100">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-purple-700" stroke="currentColor" fill="none">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path d="M8 12h8" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border shadow-sm overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Pending</span>
            <div className="flex items-center mt-1">
              <span className="text-3xl font-bold text-yellow-600">{pendingCount}</span>
              <span className="ml-2 p-1 rounded-full bg-yellow-100">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border shadow-sm overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">In Progress</span>
            <div className="flex items-center mt-1">
              <span className="text-3xl font-bold text-blue-600">{inProgressCount}</span>
              <span className="ml-2 p-1 rounded-full bg-blue-100">
                <Clock className="w-4 h-4 text-blue-600" />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border shadow-sm overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Completed</span>
            <div className="flex items-center mt-1">
              <span className="text-3xl font-bold text-green-600">{completedCount}</span>
              <span className="ml-2 p-1 rounded-full bg-green-100">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border shadow-sm overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Overdue</span>
            <div className="flex items-center mt-1">
              <span className="text-3xl font-bold text-red-600">{overdueCount}</span>
              <span className="ml-2 p-1 rounded-full bg-red-100">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border shadow-sm overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Due Today</span>
            <div className="flex items-center mt-1">
              <span className="text-3xl font-bold text-orange-600">{dueTodayCount}</span>
              <span className="ml-2 p-1 rounded-full bg-orange-100">
                <Calendar className="w-4 h-4 text-orange-600" />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
