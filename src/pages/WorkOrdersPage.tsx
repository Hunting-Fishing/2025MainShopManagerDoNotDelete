
import React, { useState } from 'react';
import { WorkOrderSearch } from "@/components/work-orders/WorkOrderSearch";
import { WorkOrderTable } from "@/components/work-orders/WorkOrderTable";
import { useWorkOrderSearch } from "@/hooks/workOrders/useWorkOrderSearch";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function WorkOrdersPage() {
  const { workOrders, loading, searchOrders } = useWorkOrderSearch();
  const [technicians] = useState<string[]>([]);  // This would be populated from your backend

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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Work Orders</h1>
        <Button asChild>
          <Link to="/work-orders/new">
            <Plus className="h-4 w-4 mr-2" />
            New Work Order
          </Link>
        </Button>
      </div>

      <WorkOrderSearch
        onSearch={handleSearch}
        onStatusFilterChange={handleStatusFilter}
        onPriorityFilterChange={handlePriorityFilter}
        onTechnicianFilterChange={handleTechnicianFilter}
        technicians={technicians}
      />

      <WorkOrderTable workOrders={workOrders} loading={loading} />
    </div>
  );
}
