
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { useToast } from "@/hooks/use-toast";
import { WorkOrderTable } from "@/components/work-orders/WorkOrderTable";
import { WorkOrder } from "@/types/workOrder";
import { WorkOrderSearch } from "@/components/work-orders/WorkOrderSearch";
import { WorkOrderAnalytics } from "@/components/work-orders/analytics/WorkOrderAnalytics";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceCategoriesSelect } from "@/components/work-orders/ServiceCategoriesSelect";

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [technicians, setTechnicians] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [technicianFilter, setTechnicianFilter] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchWorkOrders();
    fetchTechnicians();
  }, []);

  const fetchWorkOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('work_orders')
        .select(`
          *,
          customers (first_name, last_name),
          profiles (first_name, last_name)
        `);
        
      // Apply filters if they exist
      if (statusFilter.length > 0) {
        query = query.in('status', statusFilter);
      }
      
      if (priorityFilter.length > 0) {
        query = query.in('priority', priorityFilter);
      }
      
      // The technician filter is more complex as it might involve joining names
      // For simplicity, we'll filter on the client side for technicians
        
      const { data, error } = await query;
        
      if (error) throw error;
      
      // Transform the data to match our WorkOrder type
      const mappedOrders: WorkOrder[] = (data || []).map((order: any) => {
        // Map customer name from customers table if available
        let customer = "Unknown";
        if (order.customers) {
          const firstName = order.customers.first_name || "";
          const lastName = order.customers.last_name || "";
          customer = `${firstName} ${lastName}`.trim() || "Unknown";
        }
        
        // Map technician name from profiles table if available
        let technician = "Unassigned";
        if (order.profiles) {
          const firstName = order.profiles.first_name || "";
          const lastName = order.profiles.last_name || "";
          technician = `${firstName} ${lastName}`.trim() || "Unassigned";
        }
        
        return {
          id: order.id,
          customer: customer,
          customer_id: order.customer_id,
          description: order.description || "",
          status: order.status || "pending",
          priority: order.priority || "medium",
          technician: technician,
          technician_id: order.technician_id,
          date: order.created_at,
          dueDate: order.end_time || "",
          location: order.location || "",
          notes: order.notes || "",
          createdAt: order.created_at,
          startTime: order.start_time,
          endTime: order.end_time,
          serviceType: order.service_type,
          service_type: order.service_type,
          serviceCategory: order.service_category,
          service_category: order.service_category,
          service_category_id: order.service_category_id,
          vehicle_id: order.vehicle_id,
        };
      });
      
      // Apply client-side filters
      let filteredOrders = mappedOrders;
      
      // Apply search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredOrders = filteredOrders.filter(order => 
          order.customer.toLowerCase().includes(searchLower) || 
          order.description.toLowerCase().includes(searchLower) ||
          order.id.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply technician filter
      if (technicianFilter.length > 0) {
        filteredOrders = filteredOrders.filter(order => 
          technicianFilter.includes(order.technician)
        );
      }
      
      setWorkOrders(filteredOrders);
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

  const fetchTechnicians = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .order('first_name');
        
      if (error) throw error;
      
      const techNames = (data || []).map((tech: any) => {
        const firstName = tech.first_name || "";
        const lastName = tech.last_name || "";
        return `${firstName} ${lastName}`.trim();
      }).filter(Boolean);
      
      setTechnicians(techNames);
    } catch (error) {
      console.error("Error fetching technicians:", error);
      // Don't show toast for this non-critical error
      setTechnicians([]);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    fetchWorkOrders();
  };

  const handleStatusFilterChange = (statuses: string[]) => {
    setStatusFilter(statuses);
    fetchWorkOrders();
  };

  const handlePriorityFilterChange = (priorities: string[]) => {
    setPriorityFilter(priorities);
    fetchWorkOrders();
  };

  const handleTechnicianFilterChange = (techs: string[]) => {
    setTechnicianFilter(techs);
    fetchWorkOrders();
  };

  const handleDeleteWorkOrder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setWorkOrders(prevOrders => prevOrders.filter(order => order.id !== id));
      
      toast({
        title: "Work Order Deleted",
        description: "Work order has been successfully deleted",
      });
    } catch (error) {
      console.error("Error deleting work order:", error);
      toast({
        title: "Error",
        description: "Failed to delete work order",
        variant: "destructive",
      });
    }
  };

  return (
    <ResponsiveContainer>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Work Orders</h1>
          <p className="text-muted-foreground">
            Manage and track your service work orders
          </p>
        </div>
        <Button asChild>
          <Link to="/work-orders/create">
            <Plus className="h-4 w-4 mr-1" />
            Create Work Order
          </Link>
        </Button>
      </div>

      <div className="mb-4">
        <WorkOrderSearch
          onSearch={handleSearch}
          onStatusFilterChange={handleStatusFilterChange}
          onPriorityFilterChange={handlePriorityFilterChange}
          onTechnicianFilterChange={handleTechnicianFilterChange}
          technicians={technicians}
        />
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-10">
                <div className="flex justify-center">
                  <div className="text-center">
                    <div className="animate-pulse flex space-x-4">
                      <div className="flex-1 space-y-6 py-1">
                        <div className="h-2 bg-slate-200 rounded"></div>
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                            <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                          </div>
                          <div className="h-2 bg-slate-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">Loading work orders...</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <WorkOrderTable 
              workOrders={workOrders}
              onDelete={handleDeleteWorkOrder}
            />
          )}
        </TabsContent>
        
        <TabsContent value="analytics">
          <WorkOrderAnalytics workOrders={workOrders} />
        </TabsContent>
      </Tabs>
    </ResponsiveContainer>
  );
}
