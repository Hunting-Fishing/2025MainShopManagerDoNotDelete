
import React, { useEffect, useState } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { supabase } from '@/lib/supabase';
import { useWorkOrderSearch } from '@/hooks/workOrders/useWorkOrderSearch';
import { useWorkOrderFilters } from '@/hooks/workOrders/useWorkOrderFilters';
import { toast } from '@/components/ui/use-toast';
import { WorkOrdersPageContent } from './WorkOrdersPageContent';
import { Skeleton } from '@/components/ui/skeleton';

export function WorkOrdersContainer() {
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

  const [selectedWorkOrders, setSelectedWorkOrders] = useState<WorkOrder[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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

  // Separate the initial load from other search operations
  useEffect(() => {
    const loadInitialData = async () => {
      await searchOrders({});
      setIsInitialLoad(false);
    };
    
    if (isInitialLoad) {
      loadInitialData();
    }
  }, [isInitialLoad, searchOrders]);

  useEffect(() => {
    const channel = supabase
      .channel('work-order-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'work_orders' },
        () => {
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

  // Show loading state only during the initial load
  if (isInitialLoad && loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <WorkOrdersPageContent
      workOrders={workOrders}
      loading={loading && !isInitialLoad}
      total={total}
      page={page}
      pageSize={pageSize}
      showFilters={showFilters}
      setShowFilters={setShowFilters}
      selectedWorkOrders={selectedWorkOrders}
      viewMode={viewMode}
      setViewMode={setViewMode}
      onPageChange={handlePageChange}
      onSelectWorkOrder={handleSelectWorkOrder}
      onSearch={(searchTerm) => searchOrders(handleSearch(searchTerm))}
      onStatusFilterChange={(statuses) => searchOrders(handleStatusFilter(statuses))}
      onPriorityFilterChange={(priorities) => searchOrders(handlePriorityFilter(priorities))}
      onServiceCategoryChange={(categoryId) => searchOrders(handleServiceCategoryFilter(categoryId))}
      onTechnicianFilterChange={(techs) => searchOrders(handleTechnicianFilter(techs))}
      technicians={technicians}
    />
  );
}
