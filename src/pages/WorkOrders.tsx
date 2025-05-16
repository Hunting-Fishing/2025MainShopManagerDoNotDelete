
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import WorkOrdersHeader from "@/components/work-orders/WorkOrdersHeader";
import WorkOrderFilters from "@/components/work-orders/WorkOrderFilters";
import WorkOrdersTable from "@/components/work-orders/WorkOrdersTable"; // Import as default
import WorkOrdersPagination from "@/components/work-orders/WorkOrdersPagination";
import { WorkOrder } from "@/types/workOrder";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { mapDatabaseToAppModel, getUniqueTechnicians } from "@/utils/workOrders";

export default function WorkOrders() {
  const navigate = useNavigate();
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
        
        // Get work orders with time entries
        const { data: workOrderData, error } = await supabase
          .from('work_orders')
          .select(`
            *,
            work_order_time_entries(*)
          `);
          
        if (error) {
          throw error;
        }

        // Fetch customer and technician data separately to avoid relationship issues
        const workOrdersWithDetails = await Promise.all(workOrderData.map(async (order) => {
          // Get customer data if available
          let customerData = null;
          if (order.customer_id) {
            const { data } = await supabase
              .from('customers')
              .select('first_name, last_name')
              .eq('id', order.customer_id)
              .single();
            customerData = data;
          }

          // Get technician data if available
          let technicianData = null;
          if (order.technician_id) {
            const { data } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', order.technician_id)
              .single();
            technicianData = data;
          }

          return {
            ...order,
            customers: customerData,
            profiles: technicianData
          };
        }));
        
        // Map database models to application models
        const completeWorkOrders: WorkOrder[] = workOrdersWithDetails.map((order) => 
          mapDatabaseToAppModel(order)
        );
        
        setWorkOrders(completeWorkOrders);
        
        // Get unique technicians for the filter
        const uniqueTechs = await getUniqueTechnicians();
        setTechnicians(uniqueTechs);
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
      (order.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
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

  // Create new work order
  const handleCreateWorkOrder = () => {
    navigate('/work-orders/create');
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
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Work Orders</h1>
            <p className="text-muted-foreground">
              Manage and track all your service work orders
            </p>
          </div>
          <Button 
            onClick={handleCreateWorkOrder}
            className="rounded-full bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Work Order
          </Button>
        </div>
      </div>
      
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
