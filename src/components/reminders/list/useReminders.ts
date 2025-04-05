
import { useState, useEffect, useMemo } from "react";
import { ServiceReminder } from "@/types/reminder";
import { getAllReminders, getCustomerReminders, getVehicleReminders, getUpcomingReminders } from "@/services/reminderService";
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
  // Create a more optimized query key that only includes relevant parameters
  const queryKey = useMemo(() => {
    const keyParts = ['reminders'];
    
    if (customerId) keyParts.push(`customer-${customerId}`);
    if (vehicleId) keyParts.push(`vehicle-${vehicleId}`);
    if (limit) keyParts.push(`limit-${limit}`);
    if (statusFilter) keyParts.push(`status-${statusFilter}`);
    if (dateRange?.from) keyParts.push(`from-${dateRange.from.toISOString()}`);
    if (dateRange?.to) keyParts.push(`to-${dateRange.to?.toISOString() || dateRange.from.toISOString()}`);
    
    return keyParts;
  }, [customerId, vehicleId, limit, statusFilter, dateRange]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        // Optimize the fetch strategy based on the provided filters
        let remindersData: ServiceReminder[];
        
        if (customerId) {
          // Pass the filters directly to the service function instead of filtering client-side
          remindersData = await getCustomerReminders(
            customerId, 
            { status: statusFilter, dateRange, limit }
          );
        } else if (vehicleId) {
          remindersData = await getVehicleReminders(
            vehicleId,
            { status: statusFilter, dateRange, limit }
          );
        } else {
          if (limit) {
            remindersData = await getUpcomingReminders(
              limit, 
              { status: statusFilter, dateRange }
            );
          } else {
            remindersData = await getAllReminders(
              { status: statusFilter, dateRange, limit }
            );
          }
        }
        
        return remindersData;
      } catch (err) {
        console.error("Error loading reminders:", err);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5, // Keep 5 minutes stale time as it seems appropriate
    placeholderData: (previousData) => previousData // Updated to React Query v5 syntax
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

  return {
    reminders: data || [],
    loading: isLoading,
    updateReminder: refetch, // Simplified to just use refetch
    refetch,
  };
}
