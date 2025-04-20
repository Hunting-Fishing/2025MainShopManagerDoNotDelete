
import { useState, useEffect } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { CalendarEvent } from '@/types/calendar/events';
import { useWorkOrderCalendarSync } from './useWorkOrderCalendarSync';
import { useToast } from './use-toast';
import { useNavigate } from 'react-router-dom';

export function useWorkOrderCalendarIntegration(workOrder: WorkOrder | null) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { syncWithCalendar, calendarEvent, hasCalendarEvent } = useWorkOrderCalendarSync(workOrder);

  const handleSync = async () => {
    setLoading(true);
    try {
      await syncWithCalendar();
      toast({
        title: "Calendar Updated",
        description: "Work order has been synchronized with calendar",
      });
    } catch (error) {
      console.error('Calendar sync error:', error);
      toast({
        title: "Sync Failed",
        description: "Could not sync work order with calendar",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const viewInCalendar = () => {
    if (!workOrder?.startTime) return;
    
    const date = new Date(workOrder.startTime);
    navigate(`/calendar?date=${date.toISOString().split('T')[0]}&workOrderId=${workOrder.id}`);
  };

  return {
    loading,
    hasCalendarEvent,
    calendarEvent,
    handleSync,
    viewInCalendar
  };
}
