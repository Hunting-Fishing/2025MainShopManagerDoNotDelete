
import { useState } from "react";
import WorkOrdersHeader from "@/components/work-orders/WorkOrdersHeader";
import WorkOrderFilters from "@/components/work-orders/WorkOrderFilters";
import WorkOrdersTable from "@/components/work-orders/WorkOrdersTable";
import WorkOrdersPagination from "@/components/work-orders/WorkOrdersPagination";
import { workOrders, getUniqueTechnicians, WorkOrder } from "@/data/workOrdersData";

export default function WorkOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of work orders to show per page

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

  // Calculate pagination values
  const totalItems = filteredWorkOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredWorkOrders.slice(indexOfFirstItem, indexOfLastItem);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter([]);
    setSelectedTechnician("all");
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
      <WorkOrdersTable workOrders={currentItems} />
      
      {/* Pagination */}
      {filteredWorkOrders.length > 0 && (
        <WorkOrdersPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
