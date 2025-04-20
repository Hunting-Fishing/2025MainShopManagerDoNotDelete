
import React from 'react';
import { Button } from "@/components/ui/button";
import { CalendarIcon, CheckCircle, Clock } from "lucide-react";
import { useWorkOrderCalendarSync } from "@/hooks/useWorkOrderCalendarSync";
import { WorkOrder } from "@/types/workOrder";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface WorkOrderCalendarButtonProps {
  workOrder: WorkOrder;
}

export function WorkOrderCalendarButton({ workOrder }: WorkOrderCalendarButtonProps) {
  const { syncWithCalendar, isLoading, hasCalendarEvent } = useWorkOrderCalendarSync(workOrder);
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant={hasCalendarEvent ? "outline" : "default"}
          className="flex items-center gap-2"
          onClick={(e) => {
            // Stop propagation to prevent the popover from opening when clicking to sync
            if (!hasCalendarEvent) {
              e.stopPropagation();
              e.preventDefault();
              syncWithCalendar();
            }
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Syncing...</span>
            </>
          ) : hasCalendarEvent ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>On Calendar</span>
            </>
          ) : (
            <>
              <CalendarIcon className="h-4 w-4" />
              <span>Add to Calendar</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      {hasCalendarEvent && (
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">Scheduled in Calendar</h4>
                <p className="text-sm text-muted-foreground">This work order is synchronized with the calendar</p>
              </div>
            </div>
            
            {workOrder.startTime && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(workOrder.startTime), "PPP 'at' p")}
                </span>
              </div>
            )}
            
            <Button 
              className="w-full"
              onClick={() => {
                // Navigate to the calendar view focused on this event
                if (workOrder.startTime) {
                  window.location.href = `/calendar?date=${format(new Date(workOrder.startTime), 'yyyy-MM-dd')}`;
                } else {
                  window.location.href = '/calendar';
                }
              }}
            >
              View in Calendar
            </Button>
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
}
