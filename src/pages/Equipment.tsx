
import { useState, useEffect } from "react";
import { EquipmentHeader } from "@/components/equipment/EquipmentHeader";
import { EquipmentFilters } from "@/components/equipment/EquipmentFilters";
import { EquipmentTable } from "@/components/equipment/EquipmentTable";
import { MaintenanceDueCard } from "@/components/equipment/MaintenanceDueCard";
import { WarrantyExpiringCard } from "@/components/equipment/WarrantyExpiringCard";
import { EquipmentRecommendationsCard } from "@/components/equipment/EquipmentRecommendationsCard";
import { Equipment as EquipmentType, MaintenanceRecord, MaintenanceSchedule } from "@/types/equipment";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { getEquipmentRecommendations } from "@/utils/equipment/recommendations";

export default function Equipment() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [equipment, setEquipment] = useState<EquipmentType[]>([]);
  const [maintenanceDueEquipment, setMaintenanceDueEquipment] = useState<EquipmentType[]>([]);
  const [warrantyExpiringEquipment, setWarrantyExpiringEquipment] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchEquipmentData();
  }, []);

  const fetchEquipmentData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        setEquipment([]);
        setLoading(false);
        return;
      }
      
      const transformedData: EquipmentType[] = data.map(item => {
        const validStatus = validateEquipmentStatus(item.status);
        const validWarrantyStatus = validateWarrantyStatus(item.warranty_status);
        const validMaintenanceFrequency = validateMaintenanceFrequency(item.maintenance_frequency);
        
        // Convert work_order_history to string array
        const workOrderHistory = Array.isArray(item.work_order_history) 
          ? item.work_order_history
              .filter((id): id is string | number => id !== null && (typeof id === 'string' || typeof id === 'number'))
              .map(String)
          : [];
        
        // Convert maintenance_history to MaintenanceRecord array with proper type check
        const maintenanceHistory: MaintenanceRecord[] = Array.isArray(item.maintenance_history)
          ? item.maintenance_history
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
        const maintenanceSchedules: MaintenanceSchedule[] = Array.isArray(item.maintenance_schedules) 
          ? item.maintenance_schedules
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
        
        return {
          id: item.id,
          name: item.name,
          model: item.model,
          serialNumber: item.serial_number,
          manufacturer: item.manufacturer,
          category: item.category,
          purchaseDate: item.purchase_date,
          installDate: item.install_date,
          customer: item.customer,
          location: item.location,
          status: validStatus,
          nextMaintenanceDate: item.next_maintenance_date,
          maintenanceFrequency: validMaintenanceFrequency,
          lastMaintenanceDate: item.last_maintenance_date,
          warrantyExpiryDate: item.warranty_expiry_date,
          warrantyStatus: validWarrantyStatus,
          notes: item.notes,
          workOrderHistory: workOrderHistory,
          maintenanceHistory: maintenanceHistory,
          maintenanceSchedules: maintenanceSchedules
        };
      });
      
      setEquipment(transformedData);
      
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      
      const maintenanceDue = transformedData.filter(item => {
        if (!item.nextMaintenanceDate) return false;
        const maintenanceDate = new Date(item.nextMaintenanceDate);
        return maintenanceDate >= today && maintenanceDate <= thirtyDaysFromNow;
      });
      
      setMaintenanceDueEquipment(maintenanceDue);
      
      const sixtyDaysFromNow = new Date();
      sixtyDaysFromNow.setDate(today.getDate() + 60);
      
      const warrantyExpiring = transformedData.filter(item => {
        if (!item.warrantyExpiryDate) return false;
        const expiryDate = new Date(item.warrantyExpiryDate);
        return expiryDate >= today && expiryDate <= sixtyDaysFromNow && item.warrantyStatus === "active";
      });
      
      setWarrantyExpiringEquipment(warrantyExpiring);
      
    } catch (error: any) {
      console.error("Error fetching equipment data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load equipment data. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const validateEquipmentStatus = (status: string): EquipmentType["status"] => {
    const validStatuses: EquipmentType["status"][] = ["operational", "maintenance-required", "out-of-service", "decommissioned"];
    if (validStatuses.includes(status as EquipmentType["status"])) {
      return status as EquipmentType["status"];
    }
    console.warn(`Invalid equipment status: ${status}, defaulting to "operational"`);
    return "operational";
  };
  
  const validateWarrantyStatus = (status: string): EquipmentType["warrantyStatus"] => {
    const validStatuses: EquipmentType["warrantyStatus"][] = ["active", "expired", "not-applicable"];
    if (validStatuses.includes(status as EquipmentType["warrantyStatus"])) {
      return status as EquipmentType["warrantyStatus"];
    }
    console.warn(`Invalid warranty status: ${status}, defaulting to "not-applicable"`);
    return "not-applicable";
  };
  
  const validateMaintenanceFrequency = (frequency: string): EquipmentType["maintenanceFrequency"] => {
    const validFrequencies: EquipmentType["maintenanceFrequency"][] = [
      "monthly", "quarterly", "bi-annually", "annually", "as-needed"
    ];
    if (validFrequencies.includes(frequency as EquipmentType["maintenanceFrequency"])) {
      return frequency as EquipmentType["maintenanceFrequency"];
    }
    console.warn(`Invalid maintenance frequency: ${frequency}, defaulting to "as-needed"`);
    return "as-needed";
  };

  const filteredEquipment: EquipmentType[] = equipment.filter((item) => {
    const matchesSearch = 
      !searchQuery ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const recommendations = getEquipmentRecommendations(equipment);

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  return (
    <div className="space-y-6">
      <EquipmentHeader />
      
      <EquipmentRecommendationsCard recommendations={recommendations} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MaintenanceDueCard equipment={maintenanceDueEquipment} />
        <WarrantyExpiringCard equipment={warrantyExpiringEquipment} />
      </div>
      
      <EquipmentFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        resetFilters={resetFilters}
      />
      
      <EquipmentTable equipment={filteredEquipment} loading={loading} />
    </div>
  );
}
