
import React from 'react';
import { CalendarEvent } from "@/types/calendar/events";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { WorkOrderPriorityBadge } from "@/components/workOrders/WorkOrderPriorityBadge";
import { WorkOrderPriorityType } from "@/types/workOrder";
import { format } from "date-fns";

interface WorkOrderCalendarEventProps {
  event: CalendarEvent;
}

export function WorkOrderCalendarEvent({ event }: WorkOrderCalendarEventProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (event.work_order_id) {
      navigate(`/work-orders/${event.work_order_id}`);
    }
  };
  
  const getStatusClass = (status?: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border border-slate-200";
    }
  };
  
  const formatTimeRange = () => {
    if (!event.start || !event.end) return "";
    
    try {
      const startTime = format(new Date(event.start), "h:mm a");
      const endTime = format(new Date(event.end), "h:mm a");
      return `${startTime} - ${endTime}`;
    } catch (e) {
      return "";
    }
  };
  
  return (
    <div 
      className="p-2 mb-1 rounded-lg bg-white border shadow-sm cursor-pointer hover:bg-indigo-50 transition-colors"
      onClick={handleClick}
    >
      <div className="text-sm font-medium line-clamp-1">{event.title}</div>
      {formatTimeRange() && (
        <div className="text-xs text-gray-500 mt-1 mb-1">{formatTimeRange()}</div>
      )}
      <div className="flex items-center gap-1 mt-1">
        {event.status && (
          <Badge variant="outline" className={getStatusClass(event.status)}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </Badge>
        )}
        {event.priority && (
          <WorkOrderPriorityBadge priority={event.priority as WorkOrderPriorityType} />
        )}
      </div>
    </div>
  );
}
