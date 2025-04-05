import { useState, useEffect } from "react";
import { ServiceReminder } from "@/types/reminder";
import { getAllReminders, getCustomerReminders, getUpcomingReminders, getVehicleReminders } from "@/services/reminderService";
import { toast } from "@/hooks/use-toast";

interface UseRemindersProps {
  customerId?: string;
  vehicleId?: string;
  limit?: number;
  statusFilter?: string;
  dateRange?: { from: Date; to: Date };
}

export function useReminders({ customerId, vehicleId, limit, statusFilter, dateRange }: UseRemindersProps) {
  const [reminders, setReminders] = useState<ServiceReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReminders = async () => {
      try {
        setLoading(true);
        let data: ServiceReminder[];
        
        // If customerId is provided, get reminders for that customer
        if (customerId) {
          data = await getCustomerReminders(customerId);
        } 
        // If vehicleId is provided, get reminders for that vehicle
        else if (vehicleId) {
          data = await getVehicleReminders(vehicleId);
        } 
        // Otherwise, get all upcoming reminders if no limit is specified
        // or get all reminders if limit is specified
        else {
          if (!limit) {
            data = await getAllReminders();
          } else {
            data = await getUpcomingReminders(30); // Get reminders for next 30 days
          }
        }
        
        // Apply status filter if provided
        if (statusFilter) {
          data = data.filter(reminder => reminder.status === statusFilter);
        }
        
        // Apply date range filter if provided
        if (dateRange && dateRange.from && dateRange.to) {
          const fromDate = dateRange.from;
          const toDate = dateRange.to;
          
          data = data.filter(reminder => {
            const dueDate = new Date(reminder.dueDate);
            return dueDate >= fromDate && dueDate <= toDate;
          });
        }
        
        // Apply limit if provided
        if (limit && data.length > limit) {
          data = data.slice(0, limit);
        }
        
        setReminders(data);
      } catch (error) {
        console.error("Error loading reminders:", error);
        toast({
          title: "Error",
          description: "Failed to load service reminders.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadReminders();
  }, [customerId, vehicleId, limit, statusFilter, dateRange]);

  const updateReminder = (reminderId: string, updatedReminder: ServiceReminder) => {
    setReminders(reminders.map(reminder => 
      reminder.id === reminderId ? updatedReminder : reminder
    ));
  };

  return {
    reminders,
    loading,
    updateReminder,
  };
}
