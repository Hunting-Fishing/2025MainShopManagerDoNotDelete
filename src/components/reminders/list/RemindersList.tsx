
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReminderListItem } from "./ReminderListItem";
import { EmptyRemindersList } from "./EmptyRemindersList";
import { RemindersLoading } from "./RemindersLoading";
import { useReminders } from "./useReminders";
import { ServiceReminder } from "@/types/reminder";
import { DateRange } from "react-day-picker";
import { updateReminderStatus } from "@/services/reminderService";
import { useMemo } from "react";

interface RemindersListProps {
  customerId?: string;
  vehicleId?: string;
  limit?: number;
  statusFilter?: string;
  dateRange?: DateRange;
}

export function RemindersList({ customerId, vehicleId, limit, statusFilter, dateRange }: RemindersListProps) {
  const { reminders, loading, refetch } = useReminders({ 
    customerId, 
    vehicleId, 
    limit,
    statusFilter,
    dateRange
  });

  // Memoize the handleReminderUpdate function to prevent unnecessary re-renders
  const handleReminderUpdate = useMemo(() => async (reminderId: string, updatedReminder: ServiceReminder) => {
    try {
      await updateReminderStatus(reminderId, updatedReminder.status, updatedReminder.notes);
      refetch(); // Refresh the list after an update
    } catch (error) {
      console.error("Error updating reminder:", error);
    }
  }, [refetch]);

  if (loading) {
    return <RemindersLoading />;
  }

  if (!reminders.length) {
    return <EmptyRemindersList />;
  }

  return (
    <div className="divide-y">
      {reminders.map((reminder) => (
        <ReminderListItem 
          key={reminder.id} 
          reminder={reminder}
          onStatusUpdate={handleReminderUpdate}
        />
      ))}
    </div>
  );
}
