
import React, { useState } from 'react';
import { useWorkOrderSearch } from "@/hooks/workOrders/useWorkOrderSearch";
import { WorkOrderSearchParams } from "@/types/workOrder";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiSelect } from "@/components/ui/multi-select";
import { statusConfig, priorityConfig } from "@/utils/workOrders/statusManagement";
import { Search } from "lucide-react";

interface WorkOrderSearchProps {
  onSearch: (term: string) => void;
  onStatusFilterChange: (statuses: string[]) => void;
  onPriorityFilterChange: (priorities: string[]) => void;
  onTechnicianFilterChange: (techs: string[]) => void;
  technicians: string[];
}

export const WorkOrderSearch: React.FC<WorkOrderSearchProps> = ({
  onSearch,
  onStatusFilterChange,
  onPriorityFilterChange,
  onTechnicianFilterChange,
  technicians
}) => {
  const [searchParams, setSearchParams] = useState<WorkOrderSearchParams>({});
  const { searchOrders, loading } = useWorkOrderSearch();

  const handleSearch = () => {
    searchOrders(searchParams);
  };

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => ({ ...prev, searchTerm: e.target.value }));
    onSearch(e.target.value);
  };

  const handleStatusChange = (selectedStatuses: string[]) => {
    setSearchParams(prev => ({ ...prev, status: selectedStatuses }));
    onStatusFilterChange(selectedStatuses);
  };

  const handlePriorityChange = (selectedPriorities: string[]) => {
    setSearchParams(prev => ({ ...prev, priority: selectedPriorities }));
    onPriorityFilterChange(selectedPriorities);
  };

  const handleTechnicianChange = (selectedTechs: string[]) => {
    setSearchParams(prev => ({ ...prev, technicianId: selectedTechs[0] }));
    onTechnicianFilterChange(selectedTechs);
  };

  const statusOptions = Object.entries(statusConfig).map(([value, config]) => ({
    value,
    label: config.label
  }));

  const priorityOptions = Object.entries(priorityConfig).map(([value, config]) => ({
    value,
    label: config.label
  }));

  const technicianOptions = technicians.map(tech => ({
    value: tech,
    label: tech
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search work orders" 
            onChange={handleSearchTermChange}
            className="pl-10"
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Search
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="w-full sm:w-48">
          <MultiSelect
            placeholder="Filter by status"
            options={statusOptions}
            selected={searchParams.status || []}
            onChange={handleStatusChange}
            className="w-full"
          />
        </div>

        <div className="w-full sm:w-48">
          <MultiSelect
            placeholder="Filter by priority"
            options={priorityOptions}
            selected={searchParams.priority || []}
            onChange={handlePriorityChange}
            className="w-full"
          />
        </div>

        {technicians.length > 0 && (
        <div className="w-full sm:w-48">
          <MultiSelect
            placeholder="Filter by technician"
            options={technicianOptions}
            selected={searchParams.technicianId ? [searchParams.technicianId] : []}
            onChange={handleTechnicianChange}
            className="w-full"
          />
        </div>
        )}
      </div>
    </div>
  );
};
