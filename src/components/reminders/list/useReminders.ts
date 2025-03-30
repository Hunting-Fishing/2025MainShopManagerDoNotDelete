import { useState, useEffect } from "react";
import { ServiceReminder } from "@/types/reminder";
import { getUpcomingReminders, getCustomerReminders, getVehicleReminders } from "@/services/reminderService";
import { toast } from "@/hooks/use-toast";

interface UseRemindersProps {
  customerId?: string;
  vehicleId?: string;
  limit?: number;
}

export function useReminders({ customerId, vehicleId, limit }: UseRemindersProps) {
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
        // Otherwise, get all upcoming reminders
        else {
          data = await getUpcomingReminders(30); // Get reminders for next 30 days
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
  }, [customerId, vehicleId, limit]);

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
