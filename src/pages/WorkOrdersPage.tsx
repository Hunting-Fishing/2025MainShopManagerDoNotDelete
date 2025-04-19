
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { WorkOrder } from "@/types/workOrder";
import { WorkOrderTable } from "@/components/work-orders/WorkOrderTable";
import { WorkOrderSearch, WorkOrderFilters } from "@/components/work-orders/WorkOrderSearch";
import { WorkOrderAnalytics } from "@/components/work-orders/analytics/WorkOrderAnalytics";
import { Plus, ListFilter, Grid3X3, BarChart2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"list" | "grid" | "analytics">("list");
  const [technicians, setTechnicians] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch work orders from Supabase
  const fetchWorkOrders = async () => {
    setIsLoading(true);
    
    try {
      const { data: workOrdersData, error } = await supabase
        .from("work_orders")
        .select(`
          *,
          profiles:technician_id(*)
        `);

      if (error) throw error;

      // Transform the data from snake_case to camelCase for our frontend
      const formattedWorkOrders: WorkOrder[] = workOrdersData.map((workOrder) => {
        let technicianName = "Unassigned";
        
        // Handle potential errors or missing data in the profiles relation
        if (workOrder.profiles && 
            typeof workOrder.profiles === 'object' && 
            !Array.isArray(workOrder.profiles)) {
          const profile = workOrder.profiles;
          if (profile.first_name && profile.last_name) {
            technicianName = `${profile.first_name} ${profile.last_name}`;
          }
        }
        
        // Create properly formatted WorkOrder object
        return {
          id: workOrder.id,
          customer: workOrder.customer_id || "Unknown Customer", // This would need proper joining with customers table
          description: workOrder.description || "",
          status: (workOrder.status || "pending") as WorkOrder["status"],
          priority: "medium", // Default as it's not in the DB yet
          technician: technicianName,
          date: workOrder.created_at,
          dueDate: workOrder.end_time || "",
          location: "", // Not available in raw data
          notes: "", // Not available in raw data
          createdAt: workOrder.created_at,
          startTime: workOrder.start_time || undefined,
          endTime: workOrder.end_time || undefined,
          technician_id: workOrder.technician_id
        };
      });

      setWorkOrders(formattedWorkOrders);
      
      // Extract unique technician names for filters
      const uniqueTechs = Array.from(new Set(formattedWorkOrders.map(wo => wo.technician)));
      setTechnicians(uniqueTechs.filter(t => t !== "Unassigned"));
    } catch (error) {
      console.error("Error fetching work orders:", error);
      toast({
        title: "Error fetching work orders",
        description: "There was a problem loading your work orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  // Filter the work orders based on tab selection
  const getFilteredWorkOrders = () => {
    switch (activeTab) {
      case "pending":
        return workOrders.filter(wo => wo.status === "pending");
      case "in-progress":
        return workOrders.filter(wo => wo.status === "in-progress");
      case "completed":
        return workOrders.filter(wo => wo.status === "completed");
      case "cancelled":
        return workOrders.filter(wo => wo.status === "cancelled");
      default:
        return workOrders;
    }
  };

  // Filter handlers
  const [filters, setFilters] = useState<WorkOrderFilters>({
    searchQuery: '',
    status: null,
    priority: null,
    technician: null,
    dateFrom: null,
    dateTo: null
  });

  const handleFilterChange = (newFilters: WorkOrderFilters) => {
    setFilters(newFilters);
  };

  // Apply all filters to the work orders
  const getFilteredAndSearchedWorkOrders = () => {
    let filtered = getFilteredWorkOrders();

    // Apply search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(wo => 
        wo.description.toLowerCase().includes(query) ||
        wo.customer.toLowerCase().includes(query) ||
        wo.technician.toLowerCase().includes(query) ||
        wo.id.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(wo => wo.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority) {
      filtered = filtered.filter(wo => wo.priority === filters.priority);
    }

    // Apply technician filter
    if (filters.technician) {
      filtered = filtered.filter(wo => wo.technician === filters.technician);
    }

    // Apply date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(wo => new Date(wo.dueDate) >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      filtered = filtered.filter(wo => new Date(wo.dueDate) <= filters.dateTo!);
    }

    return filtered;
  };

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Work Orders</h1>
            <p className="text-muted-foreground">
              Manage and track all work orders in your system.
            </p>
          </div>
          <Button 
            onClick={() => navigate("/work-orders/create")}
            className="sm:self-end bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="mr-2 h-4 w-4" /> New Work Order
          </Button>
        </div>

        {/* Search and filters */}
        <WorkOrderSearch 
          onFilterChange={handleFilterChange}
          technicians={technicians}
          isLoading={isLoading}
        />

        {/* View Toggle + Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b gap-2">
          <Tabs 
            defaultValue="all" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex space-x-2 pb-4">
            <Button 
              variant={view === "list" ? "default" : "outline"} 
              size="sm"
              onClick={() => setView("list")}
            >
              <ListFilter className="h-4 w-4 mr-2" /> List
            </Button>
            <Button 
              variant={view === "grid" ? "default" : "outline"} 
              size="sm"
              onClick={() => setView("grid")}
            >
              <Grid3X3 className="h-4 w-4 mr-2" /> Grid
            </Button>
            <Button 
              variant={view === "analytics" ? "default" : "outline"} 
              size="sm"
              onClick={() => setView("analytics")}
            >
              <BarChart2 className="h-4 w-4 mr-2" /> Analytics
            </Button>
          </div>
        </div>

        {/* Content based on selected view */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : view === "analytics" ? (
          <WorkOrderAnalytics workOrders={getFilteredAndSearchedWorkOrders()} />
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredAndSearchedWorkOrders().map(order => (
              <Card key={order.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow" 
                    onClick={() => navigate(`/work-orders/${order.id}`)}>
                <div className="flex justify-between">
                  <h3 className="font-semibold">{order.customer}</h3>
                  <span className="text-xs font-mono text-gray-500">{order.id.substring(0, 8)}</span>
                </div>
                <p className="mt-2 text-sm line-clamp-2">{order.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span 
                    className={
                      order.status === "completed" ? "text-green-500" :
                      order.status === "in-progress" ? "text-blue-500" :
                      order.status === "cancelled" ? "text-gray-500" : "text-yellow-500"
                    }
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <span className="text-sm text-gray-600">{order.technician}</span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <WorkOrderTable 
            workOrders={getFilteredAndSearchedWorkOrders()} 
            onViewWorkOrder={(id) => navigate(`/work-orders/${id}`)}
          />
        )}
      </div>
    </ResponsiveContainer>
  );
}
