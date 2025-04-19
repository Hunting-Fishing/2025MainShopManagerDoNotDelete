
import React, { useEffect } from 'react';
import { WorkOrdersPageHeader } from "@/components/work-orders/WorkOrdersPageHeader";
import { WorkOrdersFilterSection } from "@/components/work-orders/WorkOrdersFilterSection";
import { WorkOrderStatusCards } from "@/components/work-orders/WorkOrderStatusCards";
import { WorkOrderTable } from "@/components/work-orders/WorkOrderTable";
import { useWorkOrderSearch } from "@/hooks/workOrders/useWorkOrderSearch";
import { useWorkOrderFilters } from "@/hooks/workOrders/useWorkOrderFilters";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <WorkOrdersPageHeader 
        total={total} 
        currentCount={workOrders.length} 
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

      <WorkOrderTable 
        workOrders={workOrders} 
        loading={loading}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
