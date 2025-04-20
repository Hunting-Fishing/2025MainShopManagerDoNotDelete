
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';

interface WorkOrderScheduleViewProps {
  workOrder: WorkOrder;
}

export function WorkOrderScheduleView({ workOrder }: WorkOrderScheduleViewProps) {
  // Format dates for display
  const formatDateValue = (dateString?: string): string => {
    if (!dateString) return 'Not scheduled';
    try {
      return format(new Date(dateString), 'EEE, MMM d, yyyy • h:mm a');
    } catch(e) {
      return 'Invalid date';
    }
  };

  const dueDate = workOrder.dueDate ? formatDateValue(workOrder.dueDate) : 'Not set';
  const startTime = workOrder.startTime ? formatDateValue(workOrder.startTime) : 'Not started';
  
  // Use estimated_hours if available, fallback to estimated_hours for backward compatibility
  const estimatedHours = workOrder.estimated_hours ?? 'Not specified';

  return (
    <Card className="shadow-md border-gray-100 bg-white">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-lg font-medium">Schedule Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <h4 className="font-medium">Due Date</h4>
            </div>
            <p className="text-slate-700">{dueDate}</p>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              <h4 className="font-medium">Estimated Time</h4>
            </div>
            <p className="text-slate-700">{typeof estimatedHours === 'number' ? `${estimatedHours} hours` : estimatedHours}</p>
          </div>
        </div>
        
        {workOrder.startTime && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-800">Scheduled Time</h4>
            </div>
            <p className="text-blue-700">{startTime}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
