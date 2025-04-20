
import React from 'react';
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { WorkOrderSearch } from "./WorkOrderSearch";

export interface WorkOrderFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string[];
  setStatusFilter: (statuses: string[]) => void;
  priorityFilter?: string[];
  setPriorityFilter?: (priorities: string[]) => void;
  technicianFilter?: string[];
  setTechnicianFilter?: (technicians: string[]) => void;
  serviceCategoryFilter?: string | null;
  setServiceCategoryFilter?: (category: string | null) => void;
  showAdvancedFilters?: boolean;
  onAdvancedFilterToggle?: () => void;
}

export const WorkOrderFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  priorityFilter = [],
  setPriorityFilter = () => {},
  technicianFilter = [],
  setTechnicianFilter = () => {},
  serviceCategoryFilter = null,
  setServiceCategoryFilter = () => {},
  showAdvancedFilters = false,
  onAdvancedFilterToggle = () => {}
}: WorkOrderFiltersProps) => {
  // Basic implementation - will need to be expanded
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Search work orders..."
          className="px-4 py-2 border border-gray-300 rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={onAdvancedFilterToggle}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        {/* Advanced filters would go here */}
        {showAdvancedFilters && (
          <div className="grid gap-4 mt-4">
            {/* Filter components would be rendered here */}
          </div>
        )}
      </div>
    </div>
  );
};

// Default export along with named export for flexibility
export default WorkOrderFilters;
