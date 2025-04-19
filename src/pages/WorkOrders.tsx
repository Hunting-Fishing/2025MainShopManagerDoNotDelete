
import { useState, useEffect } from "react";
import WorkOrdersHeader from "@/components/work-orders/WorkOrdersHeader";
import WorkOrderFilters from "@/components/work-orders/WorkOrderFilters";
import WorkOrdersTable from "@/components/work-orders/WorkOrdersTable";
import WorkOrdersPagination from "@/components/work-orders/WorkOrdersPagination";
import { WorkOrderStats } from "@/components/work-orders/WorkOrderStats";
import { WorkOrderBatchActions } from "@/components/work-orders/WorkOrderBatchActions";
import { WorkOrder } from "@/types/workOrder";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { mapDatabaseToAppModel, getUniqueTechnicians } from "@/utils/workOrders";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { WorkOrderCardView } from "@/components/work-orders/WorkOrderCardView";

export default function WorkOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ 
    from: Date | undefined; 
    to: Date | undefined 
  }>({ from: undefined, to: undefined });
  const [serviceCategory, setServiceCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [technicians, setTechnicians] = useState<string[]>([]);
  const [selectedWorkOrders, setSelectedWorkOrders] = useState<WorkOrder[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [advancedSearchCriteria, setAdvancedSearchCriteria] = useState<any>(null);
  
  const itemsPerPage = 10; // Number of work orders to show per page
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Set card view as default on mobile
  useEffect(() => {
    if (isMobile) {
      setViewMode("card");
    } else {
      setViewMode("table");
    }
  }, [isMobile]);

  // Fetch work orders from Supabase
  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setLoading(true);
        
        // Modified query to address relationship issue 
        let query = supabase
          .from('work_orders')
          .select(`
            *,
            work_order_time_entries(*)
          `);
          
        const { data: workOrderData, error } = await query;
          
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

          // Create a combined object with all necessary data
          return {
            ...order,
            customers: customerData,
            profiles: technicianData
          };
        }));
        
        const completeWorkOrders: WorkOrder[] = workOrdersWithDetails.map((order) => 
          mapDatabaseToAppModel(order)
        );
        
        setWorkOrders(completeWorkOrders);
        
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

  // Apply advanced search criteria
  const applyAdvancedSearch = (criteria: any) => {
    setAdvancedSearchCriteria(criteria);
    setCurrentPage(1); // Reset to first page
  };

  // Filter work orders based on search query and filters
  const filteredWorkOrders: WorkOrder[] = workOrders.filter((order) => {
    // Search filter
    const matchesSearch = 
      !searchQuery ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = 
      statusFilter.length === 0 || statusFilter.includes(order.status);
      
    // Priority filter
    const matchesPriority = 
      priorityFilter.length === 0 || priorityFilter.includes(order.priority);
    
    // Technician filter
    const matchesTechnician = 
      selectedTechnician === "all" || order.technician === selectedTechnician;
    
    // Service category filter
    const matchesCategory =
      serviceCategory === "all" || 
      order.service_category_id === serviceCategory;
    
    // Date range filter
    const orderDate = new Date(order.date);
    const matchesDateRange =
      !dateRange.from || 
      (orderDate >= dateRange.from && 
        (!dateRange.to || orderDate <= dateRange.to));
    
    // Advanced search criteria
    let matchesAdvancedCriteria = true;
    if (advancedSearchCriteria) {
      // Handle status filtering from advanced search
      if (!advancedSearchCriteria.includeCompletedWorkOrders && order.status === "completed") {
        matchesAdvancedCriteria = false;
      }
      if (!advancedSearchCriteria.includeCancelledWorkOrders && order.status === "cancelled") {
        matchesAdvancedCriteria = false;
      }
      
      // Handle customer ID filtering
      if (advancedSearchCriteria.customerId && order.customer_id !== advancedSearchCriteria.customerId) {
        matchesAdvancedCriteria = false;
      }
      
      // Handle vehicle ID filtering
      if (advancedSearchCriteria.vehicleId && order.vehicle_id !== advancedSearchCriteria.vehicleId) {
        matchesAdvancedCriteria = false;
      }
      
      // Handle billable hours filtering
      if (advancedSearchCriteria.minBillableHours !== undefined && 
          (order.totalBillableTime === undefined || 
           order.totalBillableTime / 60 < advancedSearchCriteria.minBillableHours)) {
        matchesAdvancedCriteria = false;
      }
      
      if (advancedSearchCriteria.maxBillableHours !== undefined && 
          (order.totalBillableTime !== undefined && 
           order.totalBillableTime / 60 > advancedSearchCriteria.maxBillableHours)) {
        matchesAdvancedCriteria = false;
      }
    }
    
    return matchesSearch && 
           matchesStatus && 
           matchesPriority && 
           matchesTechnician && 
           matchesCategory && 
           matchesDateRange &&
           matchesAdvancedCriteria;
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
    setPriorityFilter([]);
    setSelectedTechnician("all");
    setDateRange({ from: undefined, to: undefined });
    setServiceCategory("all");
    setAdvancedSearchCriteria(null);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle work order selection
  const handleSelectWorkOrder = (workOrder: WorkOrder, isSelected: boolean) => {
    if (isSelected) {
      setSelectedWorkOrders([...selectedWorkOrders, workOrder]);
    } else {
      setSelectedWorkOrders(selectedWorkOrders.filter(wo => wo.id !== workOrder.id));
      setIsSelectAll(false);
    }
  };

  // Handle batch action completion
  const handleBatchActionComplete = () => {
    // Refresh the current page if needed
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
      
      {/* Dashboard Stats */}
      <WorkOrderStats />
      
      {/* Batch Actions */}
      <WorkOrderBatchActions
        selectedWorkOrders={selectedWorkOrders}
        setSelectedWorkOrders={setSelectedWorkOrders}
        allWorkOrders={currentItems}
        setAllWorkOrders={setWorkOrders}
        isSelectAll={isSelectAll}
        setIsSelectAll={setIsSelectAll}
        onBatchActionComplete={handleBatchActionComplete}
      />
      
      {/* Filters and search */}
      <WorkOrderFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        selectedTechnician={selectedTechnician}
        setSelectedTechnician={setSelectedTechnician}
        dateRange={dateRange}
        setDateRange={setDateRange}
        serviceCategory={serviceCategory}
        setServiceCategory={setServiceCategory}
        technicians={technicians}
        resetFilters={resetFilters}
        applyAdvancedSearch={applyAdvancedSearch}
      />

      {/* View toggle */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "table" | "card")} className="w-full">
        <div className="flex justify-end mb-4">
          <TabsList>
            <TabsTrigger value="table" className="px-3">Table View</TabsTrigger>
            <TabsTrigger value="card" className="px-3">Card View</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="table" className="mt-0">
          {/* Work Orders table */}
          <WorkOrdersTable 
            workOrders={currentItems} 
            selectedWorkOrders={selectedWorkOrders}
            onSelectWorkOrder={handleSelectWorkOrder}
          />
        </TabsContent>

        <TabsContent value="card" className="mt-0">
          {/* Work Orders card view */}
          <WorkOrderCardView 
            workOrders={currentItems} 
            selectedWorkOrders={selectedWorkOrders}
            onSelectWorkOrder={handleSelectWorkOrder}
          />
        </TabsContent>
      </Tabs>
      
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
