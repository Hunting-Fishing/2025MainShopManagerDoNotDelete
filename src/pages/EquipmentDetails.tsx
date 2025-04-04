
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Equipment, MaintenanceRecord, MaintenanceSchedule } from "@/types/equipment";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { EquipmentDetailsHeader } from "@/components/equipment-details/EquipmentDetailsHeader";
import { EquipmentAlerts } from "@/components/equipment-details/EquipmentAlerts";
import { EquipmentDetailCards } from "@/components/equipment-details/EquipmentDetailCards";
import { EquipmentNotes } from "@/components/equipment-details/EquipmentNotes";
import { EquipmentServiceHistory } from "@/components/equipment-details/EquipmentServiceHistory";
import { EquipmentMaintenanceHistory } from "@/components/equipment-details/EquipmentMaintenanceHistory";
import { EquipmentMaintenanceSchedules } from "@/components/equipment-details/EquipmentMaintenanceSchedules";
import { EquipmentRecommendationsList } from "@/components/equipment-details/EquipmentRecommendationsList";
import { EquipmentLoading } from "@/components/equipment-details/EquipmentLoading";
import { getEquipmentRecommendations } from "@/utils/equipment/recommendations";

export default function EquipmentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [equipmentItem, setEquipmentItem] = useState<Equipment | null>(null);
  const [relatedWorkOrders, setRelatedWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      fetchEquipment(id);
    }
  }, [id]);

  const fetchEquipment = async (equipmentId: string) => {
    setLoading(true);
    try {
      // Fetch equipment details
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', equipmentId)
        .single();
      
      if (equipmentError) {
        throw equipmentError;
      }

      if (!equipmentData) {
        toast({
          title: "Not Found",
          description: "Equipment item not found.",
          variant: "destructive"
        });
        navigate("/equipment");
        return;
      }
      
      // Convert work_order_history to string array
      const workOrderHistory = Array.isArray(equipmentData.work_order_history) 
        ? equipmentData.work_order_history
            .filter((id): id is string | number => id !== null && (typeof id === 'string' || typeof id === 'number'))
            .map(String)
        : [];
      
      // Convert maintenance_history to MaintenanceRecord array with proper type check
      const maintenanceHistory: MaintenanceRecord[] = Array.isArray(equipmentData.maintenance_history)
        ? equipmentData.maintenance_history
            .filter((record): record is Record<string, any> => 
              typeof record === 'object' && 
              record !== null &&
              'id' in record &&
              'date' in record &&
              'technician' in record &&
              'description' in record
            )
            .map(record => ({
              id: String(record.id),
              date: String(record.date),
              technician: String(record.technician),
              description: String(record.description),
              cost: typeof record.cost === 'number' ? record.cost : undefined,
              notes: typeof record.notes === 'string' ? record.notes : undefined,
              workOrderId: typeof record.workOrderId === 'string' ? record.workOrderId : undefined
            }))
        : [];
      
      // Convert maintenance_schedules to MaintenanceSchedule array with proper type check
      const maintenanceSchedules: MaintenanceSchedule[] = Array.isArray(equipmentData.maintenance_schedules) 
        ? equipmentData.maintenance_schedules
            .filter((schedule): schedule is Record<string, any> =>
              typeof schedule === 'object' &&
              schedule !== null &&
              'frequencyType' in schedule &&
              'nextDate' in schedule &&
              'description' in schedule &&
              'estimatedDuration' in schedule &&
              'isRecurring' in schedule &&
              'notificationsEnabled' in schedule &&
              'reminderDays' in schedule
            )
            .map(schedule => ({
              frequencyType: schedule.frequencyType as MaintenanceSchedule['frequencyType'],
              nextDate: String(schedule.nextDate),
              description: String(schedule.description),
              estimatedDuration: Number(schedule.estimatedDuration),
              technician: typeof schedule.technician === 'string' ? schedule.technician : undefined,
              isRecurring: Boolean(schedule.isRecurring),
              notificationsEnabled: Boolean(schedule.notificationsEnabled),
              reminderDays: Number(schedule.reminderDays)
            }))
        : [];
      
      // Transform the data into our Equipment type with proper type conversions
      const equipment: Equipment = {
        id: equipmentData.id,
        name: equipmentData.name,
        model: equipmentData.model,
        serialNumber: equipmentData.serial_number,
        manufacturer: equipmentData.manufacturer,
        category: equipmentData.category,
        purchaseDate: equipmentData.purchase_date,
        installDate: equipmentData.install_date,
        customer: equipmentData.customer,
        location: equipmentData.location,
        status: validateEquipmentStatus(equipmentData.status),
        nextMaintenanceDate: equipmentData.next_maintenance_date,
        maintenanceFrequency: validateMaintenanceFrequency(equipmentData.maintenance_frequency),
        lastMaintenanceDate: equipmentData.last_maintenance_date,
        warrantyExpiryDate: equipmentData.warranty_expiry_date,
        warrantyStatus: validateWarrantyStatus(equipmentData.warranty_status),
        notes: equipmentData.notes,
        workOrderHistory: workOrderHistory,
        maintenanceHistory: maintenanceHistory,
        maintenanceSchedules: maintenanceSchedules
      };
      
      setEquipmentItem(equipment);
      
      // Fetch related work orders
      // In a real implementation, this would query the work_orders table
      // For now, we'll use the work_order_history from the equipment data
      setRelatedWorkOrders(equipment.workOrderHistory.map(id => ({
        id,
        title: `Work Order ${id}`,
        status: "completed",
        date: new Date().toISOString().split('T')[0]
      })));
      
    } catch (error: any) {
      console.error("Error fetching equipment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load equipment details.",
        variant: "destructive"
      });
      navigate("/equipment");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to validate enum types
  const validateEquipmentStatus = (status: string): Equipment["status"] => {
    const validStatuses: Equipment["status"][] = ["operational", "maintenance-required", "out-of-service", "decommissioned"];
    if (validStatuses.includes(status as Equipment["status"])) {
      return status as Equipment["status"];
    }
    return "operational";
  };
  
  const validateWarrantyStatus = (status: string): Equipment["warrantyStatus"] => {
    const validStatuses: Equipment["warrantyStatus"][] = ["active", "expired", "not-applicable"];
    if (validStatuses.includes(status as Equipment["warrantyStatus"])) {
      return status as Equipment["warrantyStatus"];
    }
    return "not-applicable";
  };
  
  const validateMaintenanceFrequency = (frequency: string): Equipment["maintenanceFrequency"] => {
    const validFrequencies: Equipment["maintenanceFrequency"][] = [
      "monthly", "quarterly", "bi-annually", "annually", "as-needed"
    ];
    if (validFrequencies.includes(frequency as Equipment["maintenanceFrequency"])) {
      return frequency as Equipment["maintenanceFrequency"];
    }
    return "as-needed";
  };
  
  // Helper functions to ensure proper array types from JSON with type guards
  const ensureStringArray = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.filter(item => typeof item === 'string').map(String);
    }
    return [];
  };
  
  const ensureMaintenanceRecordArray = (value: any): MaintenanceRecord[] => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.filter((item): item is MaintenanceRecord => 
        typeof item === 'object' && 
        item !== null && 
        'id' in item && 
        'date' in item && 
        'technician' in item && 
        'description' in item
      );
    }
    return [];
  };
  
  const ensureMaintenanceScheduleArray = (value: any): MaintenanceSchedule[] => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.filter((item): item is MaintenanceSchedule => 
        typeof item === 'object' && 
        item !== null && 
        'frequencyType' in item && 
        'nextDate' in item && 
        'description' in item && 
        'estimatedDuration' in item && 
        'isRecurring' in item && 
        'notificationsEnabled' in item && 
        'reminderDays' in item
      );
    }
    return [];
  };
  
  const handleAddMaintenanceSchedule = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Adding maintenance schedules will be available in a future update.",
    });
  };

  if (loading) {
    return <EquipmentLoading />;
  }

  if (!equipmentItem) {
    return null;
  }

  const isMaintenanceOverdue = new Date(equipmentItem.nextMaintenanceDate) < new Date();
  
  // Get recommendations specific to this equipment item
  const recommendations = getEquipmentRecommendations([equipmentItem]);
  
  return (
    <div className="space-y-6">
      <EquipmentDetailsHeader 
        equipmentItem={equipmentItem}
        isMaintenanceOverdue={isMaintenanceOverdue} 
      />
      
      <EquipmentAlerts equipmentItem={equipmentItem} />
      
      <EquipmentRecommendationsList recommendations={recommendations} />
      
      <EquipmentDetailCards equipmentItem={equipmentItem} />
      
      <EquipmentNotes notes={equipmentItem.notes} />
      
      <EquipmentMaintenanceSchedules
        equipmentId={equipmentItem.id}
        equipmentName={equipmentItem.name}
        schedules={equipmentItem.maintenanceSchedules}
        onScheduleAdded={handleAddMaintenanceSchedule}
      />
      
      <EquipmentMaintenanceHistory 
        maintenanceHistory={equipmentItem.maintenanceHistory} 
      />
      
      <EquipmentServiceHistory 
        equipmentId={equipmentItem.id}
        workOrders={relatedWorkOrders} 
      />
    </div>
  );
}
