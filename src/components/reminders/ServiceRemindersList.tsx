
import { RemindersList } from "./list/RemindersList";

interface ServiceRemindersListProps {
  customerId?: string;
  vehicleId?: string;
  limit?: number;
}

export function ServiceRemindersList({ customerId, vehicleId, limit }: ServiceRemindersListProps) {
  return (
    <RemindersList
      customerId={customerId}
      vehicleId={vehicleId}
      limit={limit}
    />
  );
}
