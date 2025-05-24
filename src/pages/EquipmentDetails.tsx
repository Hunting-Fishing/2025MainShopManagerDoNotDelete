
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { EquipmentDetailsHeader } from "@/components/equipment-details/EquipmentDetailsHeader";
import { EquipmentDetailCards } from "@/components/equipment-details/EquipmentDetailCards";
import { EquipmentAlerts } from "@/components/equipment-details/EquipmentAlerts";
import { EquipmentMaintenanceSchedules } from "@/components/equipment-details/EquipmentMaintenanceSchedules";
import { fetchEquipment } from "@/services/equipmentService";
import type { EquipmentWithMaintenance } from "@/services/equipmentService";

export default function EquipmentDetails() {
  const { id } = useParams<{ id: string }>();
  const [equipment, setEquipment] = useState<EquipmentWithMaintenance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEquipment = async () => {
      if (!id) return;
      
      try {
        const allEquipment = await fetchEquipment();
        const foundEquipment = allEquipment.find(item => item.id === id);
        setEquipment(foundEquipment || null);
      } catch (error) {
        console.error("Error loading equipment:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEquipment();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading equipment details...</div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Equipment not found</div>
      </div>
    );
  }

  const isMaintenanceOverdue = equipment.next_maintenance_date && 
    new Date(equipment.next_maintenance_date) < new Date();

  return (
    <div className="container mx-auto py-8">
      <EquipmentDetailsHeader 
        equipmentItem={equipment}
        isMaintenanceOverdue={!!isMaintenanceOverdue}
      />
      
      {/* Alerts */}
      <div className="mb-6">
        <EquipmentAlerts equipmentItem={equipment} />
      </div>

      {/* Details Cards */}
      <div className="mb-8">
        <EquipmentDetailCards equipmentItem={equipment} />
      </div>

      {/* Maintenance Schedules */}
      <div className="mb-8">
        <EquipmentMaintenanceSchedules 
          equipment={equipment}
          onAddSchedule={() => console.log('Add schedule clicked')}
        />
      </div>
    </div>
  );
}
