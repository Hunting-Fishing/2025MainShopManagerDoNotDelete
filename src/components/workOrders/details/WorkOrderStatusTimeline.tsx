
import React from "react";
import { WorkOrder } from "@/types/workOrder";
import { format } from "date-fns";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  PlayCircle,
  CalendarClock
} from "lucide-react";

interface WorkOrderStatusTimelineProps {
  workOrder: WorkOrder;
}

export const WorkOrderStatusTimeline: React.FC<WorkOrderStatusTimelineProps> = ({ 
  workOrder 
}) => {
  const timelineItems = [
    {
      id: 'created',
      title: 'Created',
      date: workOrder.createdAt || workOrder.date,
      icon: <CalendarClock className="h-6 w-6 text-blue-500" />,
      description: `Work order created${workOrder.createdBy ? ' by ' + workOrder.createdBy : ''}`
    }
  ];

  if (workOrder.startTime) {
    timelineItems.push({
      id: 'started',
      title: 'Started',
      date: workOrder.startTime,
      icon: <PlayCircle className="h-6 w-6 text-purple-500" />,
      description: 'Work started'
    });
  }

  if (workOrder.status === 'completed' && workOrder.endTime) {
    timelineItems.push({
      id: 'completed',
      title: 'Completed',
      date: workOrder.endTime,
      icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
      description: `Completed${workOrder.lastUpdatedBy ? ' by ' + workOrder.lastUpdatedBy : ''}`
    });
  }

  if (workOrder.status === 'cancelled') {
    timelineItems.push({
      id: 'cancelled',
      title: 'Cancelled',
      date: workOrder.lastUpdatedAt || new Date().toISOString(),
      icon: <XCircle className="h-6 w-6 text-red-500" />,
      description: `Cancelled${workOrder.lastUpdatedBy ? ' by ' + workOrder.lastUpdatedBy : ''}`
    });
  }

  if (workOrder.status === 'pending' && !workOrder.startTime) {
    timelineItems.push({
      id: 'pending',
      title: 'Pending',
      date: null,
      icon: <Clock className="h-6 w-6 text-yellow-500" />,
      description: 'Waiting to be started'
    });
  }

  return (
    <div className="p-4 bg-white rounded-lg border">
      <h3 className="font-medium text-lg mb-4">Work Order Timeline</h3>
      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:w-0.5 before:-translate-x-1/2 before:h-full before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
        {timelineItems.map((item, index) => (
          <div key={item.id} className="relative flex items-center gap-6 group">
            <div className="flex-none rounded-full bg-white flex items-center justify-center ring-2 ring-slate-200 group-hover:ring-slate-300">
              {item.icon}
            </div>
            <div>
              <h4 className="font-medium text-slate-800 group-hover:text-slate-900">{item.title}</h4>
              <p className="text-slate-500">{item.description}</p>
              {item.date && (
                <time className="text-xs text-slate-400 mt-1">
                  {format(new Date(item.date), 'MMM dd, yyyy • h:mm a')}
                </time>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
