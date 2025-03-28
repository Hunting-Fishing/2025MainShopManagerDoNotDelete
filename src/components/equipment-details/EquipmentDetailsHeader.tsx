
import { Button } from "@/components/ui/button";
import { Equipment } from "@/types/equipment";
import { ChevronLeft, Edit, Wrench } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface EquipmentDetailsHeaderProps {
  equipmentItem: Equipment;
  isMaintenanceOverdue: boolean;
}

export function EquipmentDetailsHeader({ equipmentItem, isMaintenanceOverdue }: EquipmentDetailsHeaderProps) {
  const navigate = useNavigate();
  
  const handleScheduleMaintenance = () => {
    // In a real application, this would create a new work order for maintenance
    toast({
      title: "Maintenance Scheduled",
      description: `Maintenance has been scheduled for ${equipmentItem.name}.`,
    });
  };
  
  return (
    <div>
      <Button variant="ghost" onClick={() => navigate("/equipment")} className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Equipment
      </Button>
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{equipmentItem.name}</h1>
          <p className="text-slate-500">{equipmentItem.id} | {equipmentItem.model}</p>
        </div>
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
      </div>
    </div>
  );
}
