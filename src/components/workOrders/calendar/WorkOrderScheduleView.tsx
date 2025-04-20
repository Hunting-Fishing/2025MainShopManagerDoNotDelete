
import React, { useState, useEffect } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { CalendarEvent } from '@/types/calendar/events';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface WorkOrderScheduleViewProps {
  workOrder: WorkOrder;
  calendarEvent?: CalendarEvent | null;
}

export function WorkOrderScheduleView({ workOrder, calendarEvent }: WorkOrderScheduleViewProps) {
  const navigate = useNavigate();
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [formattedTimeRange, setFormattedTimeRange] = useState<string>('');
  
  useEffect(() => {
    if (workOrder.startTime) {
      try {
        const startDate = new Date(workOrder.startTime);
        setFormattedDate(format(startDate, 'EEEE, MMMM d, yyyy'));
        
        if (workOrder.endTime) {
          const endDate = new Date(workOrder.endTime);
          setFormattedTimeRange(`${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`);
        } else {
          setFormattedTimeRange(format(startDate, 'h:mm a'));
        }
      } catch (error) {
        console.error("Error formatting dates:", error);
      }
    }
  }, [workOrder.startTime, workOrder.endTime]);
  
  const hasScheduleInfo = workOrder.startTime || workOrder.location || workOrder.technician;
  
  if (!hasScheduleInfo) {
    return null;
  }
  
  return (
    <Card className="bg-white border shadow-sm">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="text-lg flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-600" />
          Schedule Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {workOrder.startTime && (
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="font-medium">{formattedDate}</p>
                <p className="text-sm text-slate-600">{formattedTimeRange}</p>
              </div>
            </div>
          )}
          
          {workOrder.location && (
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-sm text-slate-600">{workOrder.location}</p>
              </div>
            </div>
          )}
          
          {workOrder.technician && (
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="font-medium">Assigned To</p>
                <p className="text-sm text-slate-600">{workOrder.technician}</p>
              </div>
            </div>
          )}
          
          <Button 
            variant="outline" 
            className="w-full mt-2"
            onClick={() => {
              if (workOrder.startTime) {
                navigate(`/calendar?date=${format(new Date(workOrder.startTime), 'yyyy-MM-dd')}`);
              } else {
                navigate('/calendar');
              }
            }}
          >
            <Calendar className="h-4 w-4 mr-2" />
            View in Calendar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
