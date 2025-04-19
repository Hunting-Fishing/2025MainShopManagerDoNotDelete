
import React, { useState } from 'react';
import { useWorkOrderSearch } from "@/hooks/workOrders/useWorkOrderSearch";
import { WorkOrderSearchParams } from "@/types/workOrder";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiSelect } from "@/components/ui/multi-select";
import { statusConfig, priorityConfig } from "@/utils/workOrders/statusManagement";

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
      <div className="flex space-x-2">
        <Input 
          placeholder="Search work orders" 
          onChange={handleSearchTermChange}
          className="max-w-sm"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="w-48">
          <MultiSelect
            placeholder="Filter by status"
            options={statusOptions}
            selected={searchParams.status || []}
            onChange={handleStatusChange}
          />
        </div>

        <div className="w-48">
          <MultiSelect
            placeholder="Filter by priority"
            options={priorityOptions}
            selected={searchParams.priority || []}
            onChange={handlePriorityChange}
          />
        </div>

        <div className="w-48">
          <MultiSelect
            placeholder="Filter by technician"
            options={technicianOptions}
            selected={searchParams.technicianId ? [searchParams.technicianId] : []}
            onChange={handleTechnicianChange}
          />
        </div>
      </div>
    </div>
  );
};
