
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReminderListItem } from "./ReminderListItem";
import { EmptyRemindersList } from "./EmptyRemindersList";
import { RemindersLoading } from "./RemindersLoading";
import { useReminders } from "./useReminders";
import { ServiceReminder } from "@/types/reminder";
import { DateRange } from "react-day-picker";

interface RemindersListProps {
  customerId?: string;
  vehicleId?: string;
  limit?: number;
  statusFilter?: string;
  dateRange?: DateRange;
}

export function RemindersList({ customerId, vehicleId, limit, statusFilter, dateRange }: RemindersListProps) {
  const { reminders, loading, updateReminder } = useReminders({ 
    customerId, 
    vehicleId, 
    limit,
    statusFilter,
    dateRange
  });

  const handleReminderUpdate = (reminderId: string, updatedReminder: ServiceReminder) => {
    updateReminder(reminderId, updatedReminder);
  };

  if (loading) {
    return <RemindersLoading />;
  }

  if (reminders.length === 0) {
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
