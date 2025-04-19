
import React, { useState, useEffect, useCallback } from 'react';
import { WorkOrderSearch } from "@/components/work-orders/WorkOrderSearch";
import { WorkOrderTable } from "@/components/work-orders/WorkOrderTable";
import { useWorkOrderSearch } from "@/hooks/workOrders/useWorkOrderSearch";
import { Button } from "@/components/ui/button";
import { Filter, Plus, FileSpreadsheet } from "lucide-react";
import { Link } from "react-router-dom";
import { WorkOrderStatusCards } from "@/components/work-orders/WorkOrderStatusCards";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

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
  
  const [technicians, setTechnicians] = useState<string[]>([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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
  }, []);

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
          // Refresh work orders when changes occur
          searchOrders({});
          
          // Show notification
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

  const handleSearch = useCallback((searchTerm: string) => {
    searchOrders({ searchTerm });
  }, [searchOrders]);

  const handleStatusFilter = useCallback((statuses: string[]) => {
    searchOrders({ status: statuses });
  }, [searchOrders]);

  const handlePriorityFilter = useCallback((priorities: string[]) => {
    searchOrders({ priority: priorities });
  }, [searchOrders]);

  const handleTechnicianFilter = useCallback((selectedTechs: string[]) => {
    if (selectedTechs.length > 0) {
      searchOrders({ technicianId: selectedTechs[0] });
    }
  }, [searchOrders]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    searchOrders({ page: newPage });
  }, [setPage, searchOrders]);

  const handleExport = (format: string) => {
    // This would connect to a real export service in production
    toast({
      title: "Export Started",
      description: `Exporting work orders as ${format}...`,
    });
    
    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `Work orders have been exported as ${format}`,
      });
    }, 2000);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Work Orders</h1>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-slate-600">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('CSV')}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('PDF')}>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('Print')}>Print Work Orders</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
            <Link to="/work-orders/new">
              <Plus className="h-4 w-4 mr-2" />
              New Work Order
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          
          <div className="text-sm text-slate-500">
            Showing {workOrders.length} of {total} work orders
          </div>
        </div>

        {showFilters && (
          <WorkOrderSearch
            onSearch={handleSearch}
            onStatusFilterChange={handleStatusFilter}
            onPriorityFilterChange={handlePriorityFilter}
            onTechnicianFilterChange={handleTechnicianFilter}
            technicians={technicians}
          />
        )}
      </div>

      <WorkOrderStatusCards workOrders={workOrders} loading={loading} />

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
