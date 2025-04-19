
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Check, Calendar } from "lucide-react";
import { WorkOrderStatusType, WorkOrderPriorityType } from "@/types/workOrder";
import { statusMap, priorityMap } from "@/utils/workOrders";

interface WorkOrderSearchProps {
  onSearch: (searchTerm: string) => void;
  onStatusFilterChange: (statuses: string[]) => void;
  onPriorityFilterChange: (priorities: string[]) => void;
  onTechnicianFilterChange: (technicians: string[]) => void;
  technicians: string[];
}

export function WorkOrderSearch({
  onSearch,
  onStatusFilterChange,
  onPriorityFilterChange,
  onTechnicianFilterChange,
  technicians
}: WorkOrderSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<string>("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleStatusChange = (status: string) => {
    const newSelectedStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status];
    
    setSelectedStatuses(newSelectedStatuses);
    onStatusFilterChange(newSelectedStatuses);
  };

  const handlePriorityChange = (priority: string) => {
    const newSelectedPriorities = selectedPriorities.includes(priority)
      ? selectedPriorities.filter(p => p !== priority)
      : [...selectedPriorities, priority];
    
    setSelectedPriorities(newSelectedPriorities);
    onPriorityFilterChange(newSelectedPriorities);
  };

  const handleTechnicianChange = (value: string) => {
    setSelectedTechnician(value);
    onTechnicianFilterChange(value ? [value] : []);
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setSelectedTechnician("");
    onStatusFilterChange([]);
    onPriorityFilterChange([]);
    onTechnicianFilterChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search orders by customer, ID, or description..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700">
            Search
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Status filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Status
                {selectedStatuses.length > 0 && (
                  <Badge className="ml-1 bg-indigo-500 hover:bg-indigo-600">
                    {selectedStatuses.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(statusMap).map(([value, label]) => (
                <DropdownMenuCheckboxItem
                  key={value}
                  checked={selectedStatuses.includes(value)}
                  onCheckedChange={() => handleStatusChange(value)}
                >
                  <div className="flex items-center gap-2">
                    {selectedStatuses.includes(value) && <Check className="h-3 w-3" />}
                    {label}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Priority filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Priority
                {selectedPriorities.length > 0 && (
                  <Badge className="ml-1 bg-indigo-500 hover:bg-indigo-600">
                    {selectedPriorities.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(priorityMap).map(([value, config]) => (
                <DropdownMenuCheckboxItem
                  key={value}
                  checked={selectedPriorities.includes(value)}
                  onCheckedChange={() => handlePriorityChange(value)}
                >
                  <div className="flex items-center gap-2">
                    {selectedPriorities.includes(value) && <Check className="h-3 w-3" />}
                    {config.label}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Technician filter */}
          <Select value={selectedTechnician} onValueChange={handleTechnicianChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Technician" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Technicians</SelectItem>
              {technicians.map((tech) => (
                <SelectItem key={tech} value={tech}>
                  {tech}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Active filters display */}
      {(selectedStatuses.length > 0 || selectedPriorities.length > 0 || selectedTechnician) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-slate-500">Active filters:</span>
          {selectedStatuses.map((status) => (
            <Badge key={status} variant="outline" className="bg-slate-100">
              Status: {statusMap[status as WorkOrderStatusType]}
              <button
                className="ml-1 hover:text-slate-700"
                onClick={() => handleStatusChange(status)}
              >
                ×
              </button>
            </Badge>
          ))}
          {selectedPriorities.map((priority) => (
            <Badge key={priority} variant="outline" className="bg-slate-100">
              Priority: {priorityMap[priority as WorkOrderPriorityType].label}
              <button
                className="ml-1 hover:text-slate-700"
                onClick={() => handlePriorityChange(priority)}
              >
                ×
              </button>
            </Badge>
          ))}
          {selectedTechnician && (
            <Badge variant="outline" className="bg-slate-100">
              Technician: {selectedTechnician}
              <button
                className="ml-1 hover:text-slate-700"
                onClick={() => handleTechnicianChange("")}
              >
                ×
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-slate-700"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
