
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkOrder } from "@/types/workOrder";
import { Loader2, AlertCircle, CheckCircle, Clock, AlertTriangle, XCircle, Flame } from "lucide-react";

interface WorkOrderStatusCardsProps {
  workOrders: WorkOrder[];
  loading: boolean;
}

export const WorkOrderStatusCards: React.FC<WorkOrderStatusCardsProps> = ({
  workOrders,
  loading,
}) => {
  const stats = useMemo(() => {
    const initial = {
      pending: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      highPriority: 0,
      overdue: 0,
    };

    if (!workOrders?.length) return initial;

    const now = new Date();

    return workOrders.reduce((acc, order) => {
      // Count by status
      if (order.status === "pending") acc.pending++;
      if (order.status === "in-progress") acc.inProgress++;
      if (order.status === "completed") acc.completed++;
      if (order.status === "cancelled") acc.cancelled++;
      
      // Count high priority
      if (order.priority === "high") acc.highPriority++;
      
      // Count overdue
      if (order.dueDate) {
        const dueDate = new Date(order.dueDate);
        if (dueDate < now && order.status !== "completed" && order.status !== "cancelled") {
          acc.overdue++;
        }
      }
      
      return acc;
    }, initial);
  }, [workOrders]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="flex items-center justify-center h-28">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card className="bg-yellow-50 border-yellow-200 hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-yellow-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            Pending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-800">{stats.pending}</div>
          <p className="text-xs text-yellow-600 mt-1">Awaiting assignment</p>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200 hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            In Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-800">{stats.inProgress}</div>
          <p className="text-xs text-blue-600 mt-1">Currently being worked on</p>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200 hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-800">{stats.completed}</div>
          <p className="text-xs text-green-600 mt-1">Ready for invoicing</p>
        </CardContent>
      </Card>

      <Card className="bg-red-50 border-red-200 hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            Cancelled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-800">{stats.cancelled}</div>
          <p className="text-xs text-red-600 mt-1">No further action needed</p>
        </CardContent>
      </Card>

      <Card className="bg-rose-50 border-rose-200 hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-rose-800 flex items-center gap-2">
            <Flame className="h-4 w-4 text-rose-500" />
            High Priority
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-800">{stats.highPriority}</div>
          <p className="text-xs text-rose-600 mt-1">Needs immediate attention</p>
        </CardContent>
      </Card>

      <Card className="bg-orange-50 border-orange-200 hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Overdue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-800">{stats.overdue}</div>
          <p className="text-xs text-orange-600 mt-1">Past due date</p>
        </CardContent>
      </Card>
    </div>
  );
};
