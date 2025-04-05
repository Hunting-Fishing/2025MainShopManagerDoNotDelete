
import { ReminderStatus } from "@/types/reminder";
import { Badge } from "@/components/ui/badge";

export interface ReminderStatusBadgeProps {
  status: ReminderStatus;
}

export function ReminderStatusBadge({ status }: ReminderStatusBadgeProps) {
  const getBadgeVariant = () => {
    switch (status) {
      case "pending":
        return { variant: "outline", className: "border-amber-500 text-amber-500" };
      case "sent":
        return { variant: "outline", className: "border-blue-500 text-blue-500" };
      case "completed":
        return { variant: "outline", className: "border-green-500 text-green-500" };
      case "cancelled":
        return { variant: "outline", className: "border-gray-500 text-gray-500" };
      default:
        return { variant: "outline", className: "" };
    }
  };

  const badgeStyle = getBadgeVariant();
  
  return (
    <Badge variant={badgeStyle.variant as any} className={badgeStyle.className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
