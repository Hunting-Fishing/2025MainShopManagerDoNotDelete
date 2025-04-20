
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
  const estimatedHours = workOrder.estimatedHours || 'Not specified';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Schedule Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-slate-500" />
              <h4 className="font-medium">Due Date</h4>
            </div>
            <p>{dueDate}</p>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-slate-500" />
              <h4 className="font-medium">Estimated Time</h4>
            </div>
            <p>{typeof estimatedHours === 'number' ? `${estimatedHours} hours` : estimatedHours}</p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button className="text-sm text-blue-600 hover:text-blue-800" onClick={() => alert('Calendar integration will be available soon!')}>
            View in Calendar
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
