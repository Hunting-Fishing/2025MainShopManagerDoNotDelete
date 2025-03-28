
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { equipment, getWorkOrdersForEquipment } from "@/data/equipmentData";
import { Equipment } from "@/types/equipment";
import { WorkOrder } from "@/data/workOrdersData";
import { toast } from "@/hooks/use-toast";
import { EquipmentDetailsHeader } from "@/components/equipment-details/EquipmentDetailsHeader";
import { EquipmentAlerts } from "@/components/equipment-details/EquipmentAlerts";
import { EquipmentDetailCards } from "@/components/equipment-details/EquipmentDetailCards";
import { EquipmentNotes } from "@/components/equipment-details/EquipmentNotes";
import { EquipmentServiceHistory } from "@/components/equipment-details/EquipmentServiceHistory";
import { EquipmentLoading } from "@/components/equipment-details/EquipmentLoading";

export default function EquipmentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [equipmentItem, setEquipmentItem] = useState<Equipment | null>(null);
  const [relatedWorkOrders, setRelatedWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEquipment = () => {
      setLoading(true);
      try {
        if (!id) {
          navigate("/equipment");
          return;
        }

        const foundEquipment = equipment.find(item => item.id === id);
        
        if (foundEquipment) {
          setEquipmentItem(foundEquipment);
          // Get related work orders
          const workOrders = getWorkOrdersForEquipment(id);
          setRelatedWorkOrders(workOrders);
        } else {
          toast({
            title: "Error",
            description: "Equipment not found.",
            variant: "destructive",
          });
          navigate("/equipment");
        }
      } catch (error) {
        console.error("Error fetching equipment:", error);
        toast({
          title: "Error",
          description: "Failed to load equipment details.",
          variant: "destructive",
        });
        navigate("/equipment");
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [id, navigate]);

  if (loading) {
    return <EquipmentLoading />;
  }

  if (!equipmentItem) {
    return null;
  }

  const isMaintenanceOverdue = new Date(equipmentItem.nextMaintenanceDate) < new Date();

  return (
    <div className="space-y-6">
      <EquipmentDetailsHeader 
        equipmentItem={equipmentItem}
        isMaintenanceOverdue={isMaintenanceOverdue} 
      />
      
      <EquipmentAlerts equipmentItem={equipmentItem} />
      
      <EquipmentDetailCards equipmentItem={equipmentItem} />
      
      <EquipmentNotes notes={equipmentItem.notes} />
      
      <EquipmentServiceHistory 
        equipmentId={equipmentItem.id}
        workOrders={relatedWorkOrders} 
      />
    </div>
  );
}
