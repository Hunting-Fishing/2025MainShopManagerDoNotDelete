import { useState, useEffect } from "react";
import { EquipmentHeader } from "@/components/equipment/EquipmentHeader";
import { EquipmentFilters } from "@/components/equipment/EquipmentFilters";
import { EquipmentTable } from "@/components/equipment/EquipmentTable";
import { MaintenanceDueCard } from "@/components/equipment/MaintenanceDueCard";
import { WarrantyExpiringCard } from "@/components/equipment/WarrantyExpiringCard";
import { Equipment as EquipmentType } from "@/types/equipment";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

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
      
      // Transform the raw data into our EquipmentType format with proper type checking
      const transformedData: EquipmentType[] = data.map(item => {
        // Validate the status field to ensure it matches our union type
        const validStatus = validateEquipmentStatus(item.status);
        
        // Validate the warranty status field
        const validWarrantyStatus = validateWarrantyStatus(item.warranty_status);
        
        // Validate the maintenance frequency field
        const validMaintenanceFrequency = validateMaintenanceFrequency(item.maintenance_frequency);
        
        // Handle JSON arrays with proper type casting
        const workOrderHistory = ensureStringArray(item.work_order_history);
        const maintenanceHistory = ensureMaintenanceRecordArray(item.maintenance_history);
        const maintenanceSchedules = ensureMaintenanceScheduleArray(item.maintenance_schedules);
        
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
      
      // Get equipment requiring maintenance soon
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      
      const maintenanceDue = transformedData.filter(item => {
        if (!item.nextMaintenanceDate) return false;
        const maintenanceDate = new Date(item.nextMaintenanceDate);
        return maintenanceDate >= today && maintenanceDate <= thirtyDaysFromNow;
      });
      
      setMaintenanceDueEquipment(maintenanceDue);
      
      // Get equipment with expiring warranties (within 60 days)
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

  // Helper functions to validate enum types
  const validateEquipmentStatus = (status: string): EquipmentType["status"] => {
    const validStatuses: EquipmentType["status"][] = ["operational", "maintenance-required", "out-of-service", "decommissioned"];
    if (validStatuses.includes(status as EquipmentType["status"])) {
      return status as EquipmentType["status"];
    }
    // Default to a valid value if the input is invalid
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
  
  // Helper functions to ensure proper array types from JSON
  const ensureStringArray = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.filter(item => typeof item === 'string');
    }
    return [];
  };
  
  const ensureMaintenanceRecordArray = (value: any): EquipmentType["maintenanceHistory"] => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.filter(item => 
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
  
  const ensureMaintenanceScheduleArray = (value: any): EquipmentType["maintenanceSchedules"] => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.filter(item => 
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

  // Filter equipment based on search query and status filter
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

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <EquipmentHeader />
      
      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MaintenanceDueCard equipment={maintenanceDueEquipment} />
        <WarrantyExpiringCard equipment={warrantyExpiringEquipment} />
      </div>
      
      {/* Filters */}
      <EquipmentFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        resetFilters={resetFilters}
      />
      
      {/* Equipment Table */}
      <EquipmentTable equipment={filteredEquipment} loading={loading} />
    </div>
  );
}
