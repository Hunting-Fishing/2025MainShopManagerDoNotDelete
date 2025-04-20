
import React, { useEffect, useMemo, useState } from 'react';
import { WorkOrdersPageHeader } from "@/components/workOrders/WorkOrdersPageHeader";
import { WorkOrdersFilterSection } from "@/components/workOrders/WorkOrdersFilterSection";
import { WorkOrderStatusCards } from "@/components/workOrders/WorkOrderStatusCards";
import { WorkOrderTable } from "@/components/workOrders/WorkOrderTable";
import { WorkOrderCardView } from "@/components/workOrders/WorkOrderCardView";
import { useWorkOrderSearch } from "@/hooks/workOrders/useWorkOrderSearch";
import { useWorkOrderFilters } from "@/hooks/workOrders/useWorkOrderFilters";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkOrderBatchActions } from '@/components/workOrders/WorkOrderBatchActions';
import { WorkOrder } from '@/types/workOrder';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export default function WorkOrdersPage() {
  const { 
    workOrders, 
    loading, 
    searchOrders, 
    total, 
    page, 
    pageSize, 
    setPage, 
    setPageSize 
  } = useWorkOrderSearch();

  const {
    showFilters,
    setShowFilters,
    technicians,
    setTechnicians,
    loadingTechnicians,
    setLoadingTechnicians,
    handleSearch,
    handleStatusFilter,
    handlePriorityFilter,
    handleServiceCategoryFilter,
    handleTechnicianFilter
  } = useWorkOrderFilters();

  // State for selected work orders (batch actions)
  const [selectedWorkOrders, setSelectedWorkOrders] = useState<WorkOrder[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // Calculate status counts
  const statusCounts = useMemo(() => {
    return workOrders.reduce(
      (counts, wo) => {
        if (wo.status === "pending") counts.pending++;
        else if (wo.status === "in-progress") counts.inProgress++;
        else if (wo.status === "completed") counts.completed++;
        return counts;
      },
      { pending: 0, inProgress: 0, completed: 0 }
    );
  }, [workOrders]);

  // Fetch technicians
  useEffect(() => {
    const fetchTechnicians = async () => {
      setLoadingTechnicians(true);
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('first_name, last_name')
          .order('first_name');
          
        if (error) throw error;
        
        const techNames = data.map(tech => 
          `${tech.first_name || ''} ${tech.last_name || ''}`.trim()
        ).filter(name => name.length > 0);
        
        setTechnicians(techNames);
      } catch (err) {
        console.error("Error fetching technicians:", err);
        toast({
          title: "Error",
          description: "Could not load technicians",
          variant: "destructive"
        });
      } finally {
        setLoadingTechnicians(false);
      }
    };
    
    fetchTechnicians();
  }, [setLoadingTechnicians, setTechnicians]);

  // Initial data load
  useEffect(() => {
    searchOrders({});
  }, [searchOrders]);

  // Set up real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('work-order-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'work_orders' },
        (payload) => {
          searchOrders({});
          toast({
            title: "Work Order Updated",
            description: "A work order has been updated",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [searchOrders]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    searchOrders({ page: newPage });
  };

  const handleSelectWorkOrder = (workOrder: WorkOrder, isSelected: boolean) => {
    setSelectedWorkOrders(prev => {
      if (isSelected) {
        return [...prev, workOrder];
      } else {
        return prev.filter(wo => wo.id !== workOrder.id);
      }
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <WorkOrdersPageHeader 
        total={total} 
        currentCount={workOrders.length}
        pendingCount={statusCounts.pending}
        inProgressCount={statusCounts.inProgress}
        completedCount={statusCounts.completed}
      />

      <WorkOrdersFilterSection
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        total={total}
        currentCount={workOrders.length}
        onSearch={(searchTerm) => searchOrders(handleSearch(searchTerm))}
        onStatusFilterChange={(statuses) => searchOrders(handleStatusFilter(statuses))}
        onPriorityFilterChange={(priorities) => searchOrders(handlePriorityFilter(priorities))}
        onServiceCategoryChange={(categoryId) => searchOrders(handleServiceCategoryFilter(categoryId))}
        onTechnicianFilterChange={(techs) => searchOrders(handleTechnicianFilter(techs))}
        technicians={technicians}
      />

      <WorkOrderStatusCards 
        workOrders={workOrders} 
        loading={loading} 
      />

      {selectedWorkOrders.length > 0 && (
        <WorkOrderBatchActions 
          selectedCount={selectedWorkOrders.length}
        />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium">Work Orders</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info size={16} className="text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>View and manage all work orders</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Tabs 
          value={viewMode} 
          onValueChange={(value) => setViewMode(value as 'table' | 'card')}
          className="w-auto"
        >
          <TabsList>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="card">Card</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {viewMode === 'table' ? (
        <WorkOrderTable 
          workOrders={workOrders} 
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={handlePageChange}
          selectedWorkOrders={selectedWorkOrders}
          onSelectWorkOrder={handleSelectWorkOrder}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {workOrders.map((workOrder) => (
            <WorkOrderCardView 
              key={workOrder.id} 
              workOrders={[workOrder]} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
