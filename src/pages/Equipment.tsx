
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
    const fetchEquipmentData = async () => {
      setLoading(true);
      try {
        // Using a raw query for better type safety since the equipment table 
        // might not be included in the generated types
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
        
        // Transform the raw data into our EquipmentType format
        const transformedData: EquipmentType[] = data.map(item => ({
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
          status: item.status,
          nextMaintenanceDate: item.next_maintenance_date,
          maintenanceFrequency: item.maintenance_frequency,
          lastMaintenanceDate: item.last_maintenance_date,
          warrantyExpiryDate: item.warranty_expiry_date,
          warrantyStatus: item.warranty_status,
          notes: item.notes,
          workOrderHistory: item.work_order_history || [],
          maintenanceHistory: item.maintenance_history || [],
          maintenanceSchedules: item.maintenance_schedules || []
        }));
        
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
    
    fetchEquipmentData();
  }, []);

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
