
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
  onServiceCategoryChange: (categoryId: string | null) => void;
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
  onServiceCategoryChange,
  onTechnicianFilterChange,
  technicians
}) => {
  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-auto">
          <input
            type="text"
            placeholder="Search work orders..."
            className="px-3 py-2 border border-gray-300 rounded-md w-full"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            Advanced Search
          </Button>
          
          <Button
            variant="outline"
            size="sm"
          >
            Date Range
          </Button>
          
          <Button
            variant="outline"
            size="sm"
          >
            Status
          </Button>

          <Button
            variant="outline"
            size="sm"
          >
            Priority
          </Button>

          <Button
            variant="outline"
            size="sm"
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4">
          <WorkOrderSearch
            onSearch={onSearch}
            onStatusFilterChange={onStatusFilterChange}
            onPriorityFilterChange={onPriorityFilterChange}
            onServiceCategoryChange={onServiceCategoryChange}
            onTechnicianFilterChange={onTechnicianFilterChange}
            technicians={technicians}
          />
        </div>
      )}
    </div>
  );
};
