
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { WorkOrder } from "@/types/workOrder";

interface WorkOrderStatusCardsProps {
  workOrders: WorkOrder[];
  loading: boolean;
}

export function WorkOrderStatusCards({ workOrders, loading }: WorkOrderStatusCardsProps) {
  // Calculate counts for each status
  const statusCounts = {
    pending: workOrders.filter(wo => wo.status === "pending").length,
    inProgress: workOrders.filter(wo => wo.status === "in-progress").length,
    completed: workOrders.filter(wo => wo.status === "completed").length,
    cancelled: workOrders.filter(wo => wo.status === "cancelled").length,
  };

  // Calculate counts for each priority
  const priorityCounts = {
    low: workOrders.filter(wo => wo.priority === "low").length,
    medium: workOrders.filter(wo => wo.priority === "medium").length,
    high: workOrders.filter(wo => wo.priority === "high").length,
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="flex items-center justify-center h-32 bg-slate-50">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="border-l-4 border-l-yellow-400">
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div className="text-sm text-slate-500 font-medium">Pending</div>
          <div className="flex items-end justify-between mt-2">
            <div className="text-2xl font-bold">{statusCounts.pending}</div>
            <div className="text-xs text-slate-500">
              {((statusCounts.pending / workOrders.length) * 100).toFixed(1)}% of total
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-blue-400">
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div className="text-sm text-slate-500 font-medium">In Progress</div>
          <div className="flex items-end justify-between mt-2">
            <div className="text-2xl font-bold">{statusCounts.inProgress}</div>
            <div className="text-xs text-slate-500">
              {((statusCounts.inProgress / workOrders.length) * 100).toFixed(1)}% of total
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-green-400">
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div className="text-sm text-slate-500 font-medium">Completed</div>
          <div className="flex items-end justify-between mt-2">
            <div className="text-2xl font-bold">{statusCounts.completed}</div>
            <div className="text-xs text-slate-500">
              {((statusCounts.completed / workOrders.length) * 100).toFixed(1)}% of total
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-red-400">
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div className="text-sm text-slate-500 font-medium">High Priority</div>
          <div className="flex items-end justify-between mt-2">
            <div className="text-2xl font-bold">{priorityCounts.high}</div>
            <div className="text-xs text-slate-500">
              {((priorityCounts.high / workOrders.length) * 100).toFixed(1)}% of total
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
