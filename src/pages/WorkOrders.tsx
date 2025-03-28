
import { useState } from "react";
import WorkOrdersHeader from "@/components/work-orders/WorkOrdersHeader";
import WorkOrderFilters from "@/components/work-orders/WorkOrderFilters";
import WorkOrdersTable from "@/components/work-orders/WorkOrdersTable";
import { workOrders, getUniqueTechnicians, WorkOrder } from "@/data/workOrdersData";

export default function WorkOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<string>("all");

  // Get unique technicians for filter
  const technicians = getUniqueTechnicians(workOrders);

  // Filter work orders based on search query and filters
  const filteredWorkOrders: WorkOrder[] = workOrders.filter((order) => {
    const matchesSearch = 
      !searchQuery ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter.length === 0 || statusFilter.includes(order.status);
    
    const matchesTechnician = 
      selectedTechnician === "all" || order.technician === selectedTechnician;
    
    return matchesSearch && matchesStatus && matchesTechnician;
  });

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter([]);
    setSelectedTechnician("all");
  };

  return (
    <div className="space-y-6">
      <WorkOrdersHeader />
      
      {/* Filters and search */}
      <WorkOrderFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        selectedTechnician={selectedTechnician}
        setSelectedTechnician={setSelectedTechnician}
        technicians={technicians}
        resetFilters={resetFilters}
      />

      {/* Work Orders table */}
      <WorkOrdersTable workOrders={filteredWorkOrders} />
    </div>
  );
}
