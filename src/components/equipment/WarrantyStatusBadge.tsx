
import { warrantyStatusMap } from "@/data/equipmentData";
import { Equipment } from "@/types/equipment";

interface WarrantyStatusBadgeProps {
  status: Equipment["warrantyStatus"];
}

export function WarrantyStatusBadge({ status }: WarrantyStatusBadgeProps) {
  const { label, classes } = warrantyStatusMap[status];
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${classes}`}>
      {label}
    </span>
  );
}
