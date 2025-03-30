
import { Badge } from "@/components/ui/badge";
import { ReminderStatus } from "@/types/reminder";
import { isAfter, parseISO } from "date-fns";

interface ReminderStatusBadgeProps {
  status: ReminderStatus;
  dueDate: string;
}

export function ReminderStatusBadge({ status, dueDate }: ReminderStatusBadgeProps) {
  const isPastDue = isAfter(new Date(), parseISO(dueDate));
  
  switch (status) {
    case "pending":
      return (
        <Badge className={isPastDue ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>
          {isPastDue ? "Past Due" : "Pending"}
        </Badge>
      );
    case "sent":
      return <Badge className="bg-blue-100 text-blue-800">Notification Sent</Badge>;
    case "completed":
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    case "cancelled":
      return <Badge className="bg-slate-100 text-slate-800">Cancelled</Badge>;
    default:
      return null;
  }
}
