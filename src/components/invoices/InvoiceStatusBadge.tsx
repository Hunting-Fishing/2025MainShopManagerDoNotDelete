
import { statusMap } from "@/components/invoices/InvoiceList";

interface InvoiceStatusBadgeProps {
  status: string;
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const statusInfo = statusMap[status as keyof typeof statusMap] || { 
    label: status, 
    classes: "bg-slate-100 text-slate-800" 
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.classes}`}>
      {statusInfo.label}
    </span>
  );
}
