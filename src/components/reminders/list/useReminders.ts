import { useState, useEffect, useMemo } from "react";
import { ServiceReminder } from "@/types/reminder";
import { getAllReminders, getCustomerReminders, getUpcomingReminders, getVehicleReminders } from "@/services/reminderService";
import { toast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";

interface UseRemindersProps {
  customerId?: string;
  vehicleId?: string;
  limit?: number;
  statusFilter?: string;
  dateRange?: DateRange;
}

export function useReminders({ customerId, vehicleId, limit, statusFilter, dateRange }: UseRemindersProps) {
  const queryKey = useMemo(() => {
    return [
      'reminders', 
      customerId || 'all', 
      vehicleId, 
      limit, 
      statusFilter, 
      dateRange?.from?.toISOString(), 
      dateRange?.to?.toISOString()
    ];
  }, [customerId, vehicleId, limit, statusFilter, dateRange]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        let remindersData: ServiceReminder[];
        
        if (customerId) {
          remindersData = await getCustomerReminders(customerId);
        } else if (vehicleId) {
          remindersData = await getVehicleReminders(vehicleId);
        } else {
          if (!limit) {
            remindersData = await getAllReminders();
          } else {
            remindersData = await getUpcomingReminders(30);
          }
        }
        
        if (statusFilter) {
          remindersData = remindersData.filter(reminder => reminder.status === statusFilter);
        }
        
        if (dateRange && dateRange.from) {
          const fromDate = dateRange.from;
          const toDate = dateRange.to || fromDate;
          
          remindersData = remindersData.filter(reminder => {
            const dueDate = new Date(reminder.dueDate);
            return dueDate >= fromDate && dueDate <= toDate;
          });
        }
        
        if (limit && remindersData.length > limit) {
          remindersData = remindersData.slice(0, limit);
        }
        
        return remindersData;
      } catch (err) {
        console.error("Error loading reminders:", err);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load service reminders.",
        variant: "destructive",
      });
    }
  }, [error]);

  const updateReminder = (reminderId: string, updatedReminder: ServiceReminder) => {
    refetch();
  };

  return {
    reminders: data || [],
    loading: isLoading,
    updateReminder,
    refetch,
  };
}
