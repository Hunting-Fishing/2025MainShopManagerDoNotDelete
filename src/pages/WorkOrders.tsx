
import { useState, useEffect } from "react";
import WorkOrdersHeader from "@/components/work-orders/WorkOrdersHeader";
import WorkOrderFilters from "@/components/work-orders/WorkOrderFilters";
import WorkOrdersTable from "@/components/work-orders/WorkOrdersTable";
import WorkOrdersPagination from "@/components/work-orders/WorkOrdersPagination";
import { WorkOrder } from "@/data/workOrdersData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { mapFromDbWorkOrder } from "@/utils/supabaseMappers";

export default function WorkOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [technicians, setTechnicians] = useState<string[]>([]);
  
  const itemsPerPage = 5; // Number of work orders to show per page

  // Fetch work orders from Supabase
  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setLoading(true);
        
        // Fetch all work orders
        const { data, error } = await supabase
          .from('work_orders')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        // Process each work order with its related data
        const completeWorkOrders = await Promise.all(
          data.map(async (order) => {
            // Fetch time entries
            const timeEntriesResponse = await supabase
              .from('work_order_time_entries')
              .select('*')
              .eq('work_order_id', order.id)
              .order('created_at', { ascending: false });
            
            // Fetch inventory items
            const inventoryItemsResponse = await supabase
              .from('work_order_inventory_items')
              .select('*')
              .eq('work_order_id', order.id);
            
            // Convert to our application format
            const timeEntries = (timeEntriesResponse.data || []).map((entry: any) => ({
              id: entry.id,
              employeeId: entry.employee_id,
              employeeName: entry.employee_name,
              startTime: entry.start_time,
              endTime: entry.end_time,
              duration: entry.duration,
              notes: entry.notes,
              billable: entry.billable
            }));
            
            const inventoryItems = (inventoryItemsResponse.data || []).map((item: any) => ({
              id: item.id,
              name: item.name,
              sku: item.sku,
              category: item.category,
              quantity: item.quantity,
              unitPrice: item.unit_price
            }));
            
            // Map DB format to application format
            return mapFromDbWorkOrder(order, timeEntries, inventoryItems);
          })
        );
        
        setWorkOrders(completeWorkOrders);
        
        // Extract unique technicians for filter
        const uniqueTechnicians = Array.from(
          new Set(completeWorkOrders.map(order => order.technician))
        ).sort();
        
        setTechnicians(uniqueTechnicians);
      } catch (error) {
        console.error("Error fetching work orders:", error);
        toast({
          title: "Error",
          description: "Failed to load work orders",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkOrders();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">Loading work orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkOrdersHeader workOrders={filteredWorkOrders} />
      
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
