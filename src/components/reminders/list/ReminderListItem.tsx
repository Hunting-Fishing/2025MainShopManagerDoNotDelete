
import { memo } from "react";
import { ServiceReminder } from "@/types/reminder";
import { ReminderStatusBadge } from "./ReminderStatusBadge";
import { ReminderDetails } from "./ReminderDetails";
import { ReminderActions } from "./ReminderActions";

interface ReminderListItemProps {
  reminder: ServiceReminder;
  onStatusUpdate: (reminderId: string, updatedReminder: ServiceReminder) => Promise<void>;
}

// Use memo to prevent unnecessary re-renders
export const ReminderListItem = memo(function ReminderListItem({ 
  reminder, 
  onStatusUpdate 
}: ReminderListItemProps) {
  return (
    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex-1">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <ReminderStatusBadge status={reminder.status} />
          <h4 className="font-medium">{reminder.title}</h4>
        </div>
        <ReminderDetails reminder={reminder} />
      </div>
      <ReminderActions 
        reminder={reminder} 
        onStatusUpdate={onStatusUpdate} 
      />
    </div>
  );
});
