
import React, { useEffect, useState } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { supabase } from '@/lib/supabase';
import { useWorkOrderSearch } from '@/hooks/workOrders/useWorkOrderSearch';
import { useWorkOrderFilters } from '@/hooks/workOrders/useWorkOrderFilters';
import { toast } from '@/components/ui/use-toast';
import { WorkOrdersPageContent } from './WorkOrdersPageContent';

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

  useEffect(() => {
    searchOrders({});
  }, [searchOrders]);

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

  return (
    <WorkOrdersPageContent
      workOrders={workOrders}
      loading={loading}
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
