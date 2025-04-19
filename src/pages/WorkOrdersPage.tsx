
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrderTable } from "../components/work-orders/WorkOrderTable";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Grid, List, BarChart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkOrderSearch } from "@/components/work-orders/WorkOrderSearch";
import { WorkOrderStatusChart } from "@/components/work-orders/analytics/WorkOrderStatusChart";
import { WorkOrderAnalytics } from "@/components/work-orders/analytics/WorkOrderAnalytics";
import { WorkOrder } from "@/types/workOrder";
import { mapDatabaseToAppModel } from "@/utils/workOrders/mappers";
import { toast } from "@/hooks/use-toast";

export default function WorkOrdersPage() {
  const navigate = useNavigate();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [filteredWorkOrders, setFilteredWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'list' | 'grid' | 'analytics'>('list');
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [technicianFilter, setTechnicianFilter] = useState<string[]>([]);

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  useEffect(() => {
    filterWorkOrders();
  }, [workOrders, searchTerm, statusFilter, priorityFilter, technicianFilter]);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          customers:customer_id(first_name, last_name),
          profiles:technician_id(first_name, last_name)
        `);

      if (error) throw error;

      // Map database records to WorkOrder model
      const mappedWorkOrders = data.map(record => {
        // Create a base work order with required fields
        const baseOrder: WorkOrder = {
          id: record.id,
          customer: record.customers ? 
            `${record.customers.first_name || ''} ${record.customers.last_name || ''}`.trim() : 
            'Unknown Customer',
          description: record.description || '',
          status: (record.status as WorkOrder['status']) || 'pending',
          priority: (record.priority as WorkOrder['priority']) || 'medium',
          technician: record.profiles ? 
            `${record.profiles.first_name || ''} ${record.profiles.last_name || ''}`.trim() : 
            'Unassigned',
          date: record.created_at || '',
          dueDate: record.end_time || '',
          location: record.location || '',
          notes: record.notes || '',
          // Map snake_case to camelCase properties
          createdAt: record.created_at,
          lastUpdatedAt: record.updated_at,
          startTime: record.start_time,
          endTime: record.end_time
        };
        
        return baseOrder;
      });

      setWorkOrders(mappedWorkOrders);
      setFilteredWorkOrders(mappedWorkOrders);
    } catch (error) {
      console.error("Error fetching work orders:", error);
      toast({
        title: "Error",
        description: "Failed to load work orders.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterWorkOrders = () => {
    let filtered = [...workOrders];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        wo =>
          wo.id.toLowerCase().includes(term) ||
          wo.customer.toLowerCase().includes(term) ||
          wo.description.toLowerCase().includes(term) ||
          wo.technician.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter(wo => statusFilter.includes(wo.status));
    }

    // Apply priority filter
    if (priorityFilter.length > 0) {
      filtered = filtered.filter(wo => priorityFilter.includes(wo.priority));
    }

    // Apply technician filter
    if (technicianFilter.length > 0) {
      filtered = filtered.filter(wo => technicianFilter.includes(wo.technician));
    }

    setFilteredWorkOrders(filtered);
  };

  const handleViewWorkOrder = (id: string) => {
    navigate(`/work-orders/${id}`);
  };

  const handleCreateWorkOrder = () => {
    navigate("/work-orders/new");
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleStatusFilterChange = (statuses: string[]) => {
    setStatusFilter(statuses);
  };

  const handlePriorityFilterChange = (priorities: string[]) => {
    setPriorityFilter(priorities);
  };

  const handleTechnicianFilterChange = (technicians: string[]) => {
    setTechnicianFilter(technicians);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Orders</h1>
          <p className="text-muted-foreground">
            Manage and track service work orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleCreateWorkOrder} className="gap-1">
            <Plus className="h-4 w-4" />
            Create Work Order
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" onValueChange={(value) => setActiveView(value as any)}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-1">
              <List className="h-4 w-4" />
              <span>List</span>
            </TabsTrigger>
            <TabsTrigger value="grid" className="flex items-center gap-1">
              <Grid className="h-4 w-4" />
              <span>Grid</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1">
              <BarChart className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <WorkOrderSearch 
            onSearch={handleSearch}
            onStatusFilterChange={handleStatusFilterChange}
            onPriorityFilterChange={handlePriorityFilterChange}
            onTechnicianFilterChange={handleTechnicianFilterChange}
            technicians={Array.from(new Set(workOrders.map(wo => wo.technician)))}
          />
        </div>

        <TabsContent value="list" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading work orders...</p>
            </div>
          ) : (
            <WorkOrderTable 
              workOrders={filteredWorkOrders} 
              onViewWorkOrder={handleViewWorkOrder}
            />
          )}
        </TabsContent>

        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <p>Loading work orders...</p>
            ) : filteredWorkOrders.length === 0 ? (
              <p>No work orders found</p>
            ) : (
              filteredWorkOrders.map(workOrder => (
                <Card key={workOrder.id} className="cursor-pointer" onClick={() => handleViewWorkOrder(workOrder.id)}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">{workOrder.customer}</h3>
                        <p className="text-sm text-muted-foreground">{workOrder.id.substring(0, 8)}</p>
                      </div>
                      <StatusBadge status={workOrder.status} />
                    </div>
                    <p className="mt-2 text-sm line-clamp-2">{workOrder.description}</p>
                    <div className="mt-4 flex justify-between text-sm">
                      <span className="text-muted-foreground">Due: {formatDate(workOrder.dueDate)}</span>
                      <span>{workOrder.technician}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <WorkOrderAnalytics workOrders={workOrders} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper components
import { Card, CardContent } from "@/components/ui/card";
import { statusConfig } from "@/utils/workOrders/statusManagement";
import { formatDate } from "@/utils/workOrders/formatters";

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig];
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${config?.color || 'bg-slate-100 text-slate-800'}`}>
      {config?.label || status}
    </span>
  );
}
