
import { RemindersList } from "./list/RemindersList";
import { DateRange } from "react-day-picker";

interface ServiceRemindersListProps {
  customerId?: string;
  vehicleId?: string;
  limit?: number;
  statusFilter?: string;
  dateRange?: DateRange;
}

export function ServiceRemindersList({ 
  customerId, 
  vehicleId, 
  limit,
  statusFilter,
  dateRange
}: ServiceRemindersListProps) {
  return (
    <RemindersList
      customerId={customerId}
      vehicleId={vehicleId}
      limit={limit}
      statusFilter={statusFilter}
      dateRange={dateRange}
    />
  );
}
