
import { AlertTriangle } from "lucide-react";
import { Equipment } from "@/types/equipment";

interface EquipmentAlertsProps {
  equipmentItem: Equipment;
}

export function EquipmentAlerts({ equipmentItem }: EquipmentAlertsProps) {
  const isMaintenanceOverdue = new Date(equipmentItem.nextMaintenanceDate) < new Date();
  const isWarrantyExpiring = equipmentItem.warrantyStatus === "active" && 
    (new Date(equipmentItem.warrantyExpiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24) < 30;

  if (!isMaintenanceOverdue && !isWarrantyExpiring) {
    return null;
  }

  return (
    <div className="space-y-4">
      {isMaintenanceOverdue && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p>Maintenance is overdue. Last maintenance was on {equipmentItem.lastMaintenanceDate}.</p>
          </div>
        </div>
      )}
      
      {isWarrantyExpiring && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p>Warranty is expiring soon on {equipmentItem.warrantyExpiryDate}.</p>
          </div>
        </div>
      )}
    </div>
  );
}
