
import { Button } from "@/components/ui/button";
import { Equipment } from "@/types/equipment";
import { Edit, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface EquipmentActionButtonsProps {
  equipmentItem: Equipment;
  isMaintenanceOverdue: boolean;
}

export function EquipmentActionButtons({ equipmentItem, isMaintenanceOverdue }: EquipmentActionButtonsProps) {
  const handleScheduleMaintenance = () => {
    // In a real application, this would create a new work order for maintenance
    toast({
      title: "Maintenance Scheduled",
      description: `Maintenance has been scheduled for ${equipmentItem.name}.`,
    });
  };
  
  return (
    <div className="flex gap-2 mt-4 lg:mt-0">
      <Button 
        variant={isMaintenanceOverdue ? "destructive" : "outline"}
        onClick={handleScheduleMaintenance}
      >
        <Wrench className="mr-2 h-4 w-4" /> 
        {isMaintenanceOverdue ? "Schedule Overdue Maintenance" : "Schedule Maintenance"}
      </Button>
      <Link to={`/equipment/${equipmentItem.id}/edit`}>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" /> Edit Equipment
        </Button>
      </Link>
    </div>
  );
}
