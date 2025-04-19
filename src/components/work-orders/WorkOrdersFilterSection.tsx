
import React from 'react';
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { WorkOrderSearch } from "./WorkOrderSearch";

interface WorkOrdersFilterSectionProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  total: number;
  currentCount: number;
  onSearch: (searchTerm: string) => void;
  onStatusFilterChange: (statuses: string[]) => void;
  onPriorityFilterChange: (priorities: string[]) => void;
  onTechnicianFilterChange: (techs: string[]) => void;
  technicians: string[];
}

export const WorkOrdersFilterSection: React.FC<WorkOrdersFilterSectionProps> = ({
  showFilters,
  setShowFilters,
  total,
  currentCount,
  onSearch,
  onStatusFilterChange,
  onPriorityFilterChange,
  onTechnicianFilterChange,
  technicians
}) => {
  return (
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
          Showing {currentCount} of {total} work orders
        </div>
      </div>

      {showFilters && (
        <WorkOrderSearch
          onSearch={onSearch}
          onStatusFilterChange={onStatusFilterChange}
          onPriorityFilterChange={onPriorityFilterChange}
          onTechnicianFilterChange={onTechnicianFilterChange}
          technicians={technicians}
        />
      )}
    </div>
  );
};
