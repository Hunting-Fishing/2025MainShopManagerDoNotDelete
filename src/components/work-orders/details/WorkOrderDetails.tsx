
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { WorkOrder } from '@/types/workOrder';
import { Wrench, MapPin, Calendar, Clock, User, AlertCircle, FileText } from 'lucide-react';

interface WorkOrderDetailsProps {
  workOrder: WorkOrder;
}

export function WorkOrderDetails({ workOrder }: WorkOrderDetailsProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusColor = () => {
    switch (workOrder.status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getPriorityColor = () => {
    switch (workOrder.priority) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Work Order Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-slate-500 mb-1">Customer</h3>
              <p className="font-medium">{workOrder.customer}</p>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-slate-500 mb-1">Description</h3>
              <p>{workOrder.description || "No description provided"}</p>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-slate-500 mb-1">Status</h3>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                {workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1)}
              </span>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-slate-500 mb-1">Priority</h3>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor()}`}>
                {workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1)}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-slate-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm text-slate-500">Technician</h3>
                <p>{workOrder.technician || "Unassigned"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm text-slate-500">Location</h3>
                <p>{workOrder.location || "No location specified"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-slate-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm text-slate-500">Created Date</h3>
                <p>{workOrder.date ? formatDate(workOrder.date) : "Not specified"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-slate-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm text-slate-500">Due Date</h3>
                <p>{workOrder.dueDate ? formatDate(workOrder.dueDate) : "Not specified"}</p>
              </div>
            </div>
          </div>
        </div>

        {workOrder.notes && (
          <div className="mt-6">
            <h3 className="font-semibold text-sm text-slate-500 mb-2">Notes</h3>
            <div className="bg-slate-50 p-3 rounded border">
              <p className="whitespace-pre-wrap text-sm">{workOrder.notes}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
