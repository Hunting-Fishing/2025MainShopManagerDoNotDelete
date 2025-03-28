
import { useState } from "react";
import { EquipmentHeader } from "@/components/equipment/EquipmentHeader";
import { EquipmentFilters } from "@/components/equipment/EquipmentFilters";
import { EquipmentTable } from "@/components/equipment/EquipmentTable";
import { MaintenanceDueCard } from "@/components/equipment/MaintenanceDueCard";
import { WarrantyExpiringCard } from "@/components/equipment/WarrantyExpiringCard";
import { equipment, getMaintenanceDueEquipment, getExpiringWarrantyEquipment } from "@/data/equipmentData";
import { Equipment as EquipmentType } from "@/types/equipment";

export default function Equipment() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Get equipment requiring maintenance soon
  const maintenanceDueEquipment = getMaintenanceDueEquipment();
  
  // Get equipment with warranties expiring soon
  const warrantyExpiringEquipment = getExpiringWarrantyEquipment();

  // Filter equipment based on search query and status filter
  const filteredEquipment: EquipmentType[] = equipment.filter((item) => {
    const matchesSearch = 
      !searchQuery ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      !statusFilter || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
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
      <EquipmentTable equipment={filteredEquipment} />
    </div>
  );
}
