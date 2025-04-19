
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WorkOrderTable } from "../components/work-orders/WorkOrderTable";
import { WorkOrderCardView } from "../components/work-orders/WorkOrderCardView";
import { Button } from "../components/ui/button";
import { LayoutGrid, List, Plus } from "lucide-react";
import { WorkOrder } from "../types/workOrder";
import { useToast } from "../hooks/use-toast";
import { WorkOrderSearch, WorkOrderFilters } from "../components/work-orders/WorkOrderSearch";
import { WorkOrderAnalytics } from "../components/work-orders/analytics/WorkOrderAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { getUniqueTechnicians } from "../utils/workOrders/crud";
import { format, parse, isAfter, isBefore } from "date-fns";
import { supabase } from "../integrations/supabase/client";

export default function WorkOrdersPage() {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [filteredWorkOrders, setFilteredWorkOrders] = useState<WorkOrder[]>([]);
  const [selectedWorkOrders, setSelectedWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [technicians, setTechnicians] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<WorkOrderFilters>({
    searchQuery: '',
    status: null,
    priority: null,
    technician: null,
    dateFrom: null,
    dateTo: null
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchWorkOrders = async () => {
      setLoading(true);
      try {
        // Fetch work orders from Supabase
        const { data, error } = await supabase
          .from('work_orders')
          .select(`
            *,
            customers (
              first_name,
              last_name
            ),
            profiles (
              first_name, 
              last_name
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Process and format the work orders for display
        const processedOrders = data.map(order => ({
          id: order.id,
          customer: order.customers ? 
            `${order.customers.first_name || ''} ${order.customers.last_name || ''}`.trim() : 
            'Unknown Customer',
          description: order.description || '',
          status: order.status as WorkOrder["status"],
          priority: order.priority as WorkOrder["priority"] || 'medium',
          technician: order.profiles ? 
            `${order.profiles.first_name || ''} ${order.profiles.last_name || ''}`.trim() : 
            'Unassigned',
          date: order.created_at,
          dueDate: order.end_time || '',
          location: order.location || '',
          notes: order.notes || '',
          customer_id: order.customer_id,
          technician_id: order.technician_id,
          vehicle_id: order.vehicle_id
        }));
        
        setWorkOrders(processedOrders);
        setFilteredWorkOrders(processedOrders);
      } catch (error) {
        console.error('Error fetching work orders:', error);
        toast({
          title: "Error",
          description: "Could not load work orders. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchTechnicians = async () => {
      try {
        const techniciansList = await getUniqueTechnicians();
        setTechnicians(techniciansList);
      } catch (error) {
        console.error('Error fetching technicians:', error);
      }
    };

    fetchWorkOrders();
    fetchTechnicians();
  }, [toast]);

  // Filter work orders based on tab selection and filter criteria
  useEffect(() => {
    let filtered = [...workOrders];
    
    // Apply tab filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(wo => wo.status === activeTab);
    }
    
    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(wo => 
        wo.customer.toLowerCase().includes(query) ||
        wo.description.toLowerCase().includes(query) ||
        wo.id.toLowerCase().includes(query) ||
        wo.technician.toLowerCase().includes(query) ||
        wo.location.toLowerCase().includes(query)
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
      filtered = filtered.filter(wo => {
        const dueDateObj = wo.dueDate ? new Date(wo.dueDate) : null;
        return dueDateObj && isAfter(dueDateObj, filters.dateFrom);
      });
    }
    
    if (filters.dateTo) {
      filtered = filtered.filter(wo => {
        const dueDateObj = wo.dueDate ? new Date(wo.dueDate) : null;
        return dueDateObj && isBefore(dueDateObj, filters.dateTo);
      });
    }
    
    setFilteredWorkOrders(filtered);
  }, [workOrders, activeTab, filters]);
  
  const handleSelectWorkOrder = (workOrder: WorkOrder, isSelected: boolean) => {
    if (isSelected) {
      setSelectedWorkOrders(prev => [...prev, workOrder]);
    } else {
      setSelectedWorkOrders(prev => prev.filter(wo => wo.id !== workOrder.id));
    }
  };

  const createNewWorkOrder = () => {
    navigate('/work-orders/new');
  };

  const handleFilterChange = (newFilters: WorkOrderFilters) => {
    setFilters(newFilters);
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Reset status filter when changing tabs to avoid confusion
    setFilters(prev => ({ ...prev, status: null }));
  };
  
  const totalCounts = {
    all: workOrders.length,
    pending: workOrders.filter(wo => wo.status === 'pending').length,
    'in-progress': workOrders.filter(wo => wo.status === 'in-progress').length,
    completed: workOrders.filter(wo => wo.status === 'completed').length,
    cancelled: workOrders.filter(wo => wo.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Work Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all customer work orders
          </p>
        </div>

        <Button onClick={createNewWorkOrder}>
          <Plus className="h-4 w-4 mr-2" />
          New Work Order
        </Button>
      </div>

      {/* Tabs, Search & Filters */}
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="border">
              <TabsTrigger value="all">
                All ({totalCounts.all})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({totalCounts.pending})
              </TabsTrigger>
              <TabsTrigger value="in-progress">
                In Progress ({totalCounts["in-progress"]})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({totalCounts.completed})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled ({totalCounts.cancelled})
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Button
                variant={activeTab === "analytics" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(activeTab === "analytics" ? "all" : "analytics")}
              >
                Analytics
              </Button>

              <div className="border rounded-md flex">
                <Button
                  variant={viewMode === 'table' ? 'ghost' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('table')}
                  className={viewMode === 'table' ? 'bg-muted' : ''}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'ghost' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-muted' : ''}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Tabs>

        <WorkOrderSearch
          onFilterChange={handleFilterChange}
          technicians={technicians}
          isLoading={loading}
        />
      </div>

      {/* Work Order Content */}
      {activeTab === "analytics" ? (
        <WorkOrderAnalytics />
      ) : (
        <>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-lg text-slate-500">Loading work orders...</div>
            </div>
          ) : (
            <>
              {filteredWorkOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center bg-gray-50 border rounded-md p-8">
                  <div className="text-lg text-gray-500 mb-2">No work orders found</div>
                  <div className="text-sm text-gray-400">Try changing your filters or create a new work order</div>
                </div>
              ) : (
                <>
                  {viewMode === 'table' ? (
                    <WorkOrderTable
                      workOrders={filteredWorkOrders}
                      selectedWorkOrders={selectedWorkOrders}
                      onSelectWorkOrder={handleSelectWorkOrder}
                    />
                  ) : (
                    <WorkOrderCardView
                      workOrders={filteredWorkOrders}
                      selectedWorkOrders={selectedWorkOrders}
                      onSelectWorkOrder={handleSelectWorkOrder}
                    />
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
