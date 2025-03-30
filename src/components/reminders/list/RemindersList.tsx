
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReminderListItem } from "./ReminderListItem";
import { EmptyRemindersList } from "./EmptyRemindersList";
import { RemindersLoading } from "./RemindersLoading";
import { useReminders } from "./useReminders";
import { ServiceReminder } from "@/types/reminder";

interface RemindersListProps {
  customerId?: string;
  vehicleId?: string;
  limit?: number;
}

export function RemindersList({ customerId, vehicleId, limit }: RemindersListProps) {
  const { reminders, loading, updateReminder } = useReminders({ customerId, vehicleId, limit });

  const handleReminderUpdate = (reminderId: string, updatedReminder: ServiceReminder) => {
    updateReminder(reminderId, updatedReminder);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Service Reminders</CardTitle>
        </CardHeader>
        <RemindersLoading />
      </Card>
    );
  }

  if (reminders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Service Reminders</CardTitle>
        </CardHeader>
        <EmptyRemindersList />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Service Reminders</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {reminders.map((reminder) => (
            <ReminderListItem 
              key={reminder.id} 
              reminder={reminder}
              onStatusUpdate={handleReminderUpdate}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
