
import { RemindersList } from "./list/RemindersList";

interface ServiceRemindersListProps {
  customerId?: string;
  vehicleId?: string;
  limit?: number;
  statusFilter?: string;
  dateRange?: { from: Date; to: Date };
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
