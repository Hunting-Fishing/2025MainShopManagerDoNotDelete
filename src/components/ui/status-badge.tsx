
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles = {
  active: "bg-green-100 text-green-800 border-green-300",
  pending: "bg-amber-100 text-amber-800 border-amber-300",
  completed: "bg-blue-100 text-blue-800 border-blue-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
  draft: "bg-gray-100 text-gray-800 border-gray-300",
} as const;

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  const style = statusStyles[normalizedStatus as keyof typeof statusStyles] || statusStyles.draft;

  return (
    <span className={cn(
      "px-3 py-1 text-sm font-medium rounded-full border shadow-sm transition-all hover:shadow-md",
      style,
      className
    )}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
