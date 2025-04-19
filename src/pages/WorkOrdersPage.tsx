
import React, { useState, useEffect } from 'react';
import { WorkOrderSearch } from "@/components/work-orders/WorkOrderSearch";
import { WorkOrderTable } from "@/components/work-orders/WorkOrderTable";
import { useWorkOrderSearch } from "@/hooks/workOrders/useWorkOrderSearch";
import { Button } from "@/components/ui/button";
import { Filter, Plus, FileSpreadsheet } from "lucide-react";
import { Link } from "react-router-dom";
import { WorkOrderStatusCards } from "@/components/work-orders/WorkOrderStatusCards";
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
  
  const [technicians] = useState<string[]>([]);  // This would be populated from your backend
  const [showFilters, setShowFilters] = useState(false);

  // Initial data load
  useEffect(() => {
    searchOrders({});
  }, []);

  const handleSearch = (searchTerm: string) => {
    searchOrders({ searchTerm });
  };

  const handleStatusFilter = (statuses: string[]) => {
    searchOrders({ status: statuses });
  };

  const handlePriorityFilter = (priorities: string[]) => {
    searchOrders({ priority: priorities });
  };

  const handleTechnicianFilter = (selectedTechs: string[]) => {
    if (selectedTechs.length > 0) {
      searchOrders({ technicianId: selectedTechs[0] });
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    searchOrders({ page: newPage });
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
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem>Print Work Orders</DropdownMenuItem>
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
