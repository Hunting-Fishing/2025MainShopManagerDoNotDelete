
import { ServiceReminder } from "@/types/reminder";
import { ReminderDetails } from "./ReminderDetails";
import { ReminderActions } from "./ReminderActions";

interface ReminderListItemProps {
  reminder: ServiceReminder;
  onStatusUpdate: (reminderId: string, updatedReminder: ServiceReminder) => void;
}

export function ReminderListItem({ reminder, onStatusUpdate }: ReminderListItemProps) {
  return (
    <div className="p-4 hover:bg-slate-50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <ReminderDetails reminder={reminder} />
        <ReminderActions 
          reminder={reminder} 
          onStatusUpdate={onStatusUpdate} 
        />
      </div>
    </div>
  );
}
