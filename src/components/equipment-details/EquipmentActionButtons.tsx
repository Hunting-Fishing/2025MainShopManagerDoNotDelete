
import { Button } from "@/components/ui/button";
import { Equipment } from "@/types/equipment";
import { Edit, Wrench, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { createWorkOrder } from "@/utils/workOrderUtils";

interface EquipmentActionButtonsProps {
  equipmentItem: Equipment;
  isMaintenanceOverdue: boolean;
}

export function EquipmentActionButtons({ equipmentItem, isMaintenanceOverdue }: EquipmentActionButtonsProps) {
  const [isScheduling, setIsScheduling] = useState(false);

  const handleScheduleMaintenance = async () => {
    setIsScheduling(true);
    
    try {
      // In a real application, we would use the maintenance scheduler utility
      // For now, we'll create a work order directly
      const workOrderData = {
        customer: equipmentItem.customer,
        description: `Maintenance for ${equipmentItem.name}`,
        status: "pending" as const,
        priority: isMaintenanceOverdue ? "high" as const : "medium" as const,
        technician: "Unassigned",
        location: equipmentItem.location,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 5)), // 5 days from now
        notes: `Regular ${equipmentItem.maintenanceFrequency} maintenance for ${equipmentItem.name} (${equipmentItem.model}).`,
      };

      await createWorkOrder(workOrderData);
      
      toast({
        title: "Maintenance Scheduled",
        description: `Maintenance has been scheduled for ${equipmentItem.name}.`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error scheduling maintenance:", error);
      toast({
        title: "Error",
        description: "Failed to schedule maintenance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };
  
  return (
    <div className="flex gap-2 mt-4 lg:mt-0">
      <Button 
        variant={isMaintenanceOverdue ? "destructive" : "outline"}
        onClick={handleScheduleMaintenance}
        disabled={isScheduling}
      >
        {isMaintenanceOverdue ? (
          <>
            <Wrench className="mr-2 h-4 w-4" /> 
            {isScheduling ? "Scheduling..." : "Schedule Overdue Maintenance"}
          </>
        ) : (
          <>
            <Calendar className="mr-2 h-4 w-4" /> 
            {isScheduling ? "Scheduling..." : "Schedule Maintenance"}
          </>
        )}
      </Button>
      <Link to={`/equipment/${equipmentItem.id}/edit`}>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" /> Edit Equipment
        </Button>
      </Link>
    </div>
  );
}
