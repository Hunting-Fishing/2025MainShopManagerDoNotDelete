
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statusMap } from "@/utils/workOrders";

interface WorkOrderFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string[];
  setStatusFilter: (statuses: string[]) => void;
  selectedTechnician: string;
  setSelectedTechnician: (technician: string) => void;
  technicians: string[];
  resetFilters: () => void;
}

const WorkOrderFilters: React.FC<WorkOrderFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  selectedTechnician,
  setSelectedTechnician,
  technicians,
  resetFilters,
}) => {
  const handleStatusChange = (status: string) => {
    // Fixed: Use a direct value instead of a callback function
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(s => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search work orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Status {statusFilter.length > 0 && `(${statusFilter.length})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(statusMap).map(([key, label]) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={statusFilter.includes(key)}
                onCheckedChange={() => handleStatusChange(key)}
              >
                {String(label)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Technician Filter */}
        <Select
          value={selectedTechnician}
          onValueChange={(value) => setSelectedTechnician(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All technicians" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All technicians</SelectItem>
            {technicians.map((tech) => (
              <SelectItem key={tech} value={tech}>
                {tech}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset Filters */}
        <Button variant="ghost" onClick={resetFilters}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

export default WorkOrderFilters;
