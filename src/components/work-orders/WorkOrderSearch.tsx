
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { statusConfig, priorityConfig } from "@/utils/workOrders/statusManagement";
import { DatePicker } from "@/components/ui/date-picker";

export interface WorkOrderFilters {
  searchQuery: string;
  status: string | null;
  priority: string | null;
  technician: string | null;
  dateFrom: Date | null;
  dateTo: Date | null;
}

export interface WorkOrderSearchProps {
  onFilterChange: (filters: WorkOrderFilters) => void;
  technicians: string[];
  isLoading?: boolean;
}

export const WorkOrderSearch: React.FC<WorkOrderSearchProps> = ({
  onFilterChange,
  technicians,
  isLoading = false
}) => {
  const [filters, setFilters] = useState<WorkOrderFilters>({
    searchQuery: '',
    status: null,
    priority: null,
    technician: null,
    dateFrom: null,
    dateTo: null
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, searchQuery: e.target.value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  const handleFilterChange = (field: keyof WorkOrderFilters, value: any) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  const clearFilters = () => {
    const resetFilters = {
      searchQuery: '',
      status: null,
      priority: null,
      technician: null,
      dateFrom: null,
      dateTo: null
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };
  
  const hasActiveFilters = Object.values(filters).some(val => 
    val !== null && val !== '' && (!(val instanceof Date) || !isNaN(val.getTime()))
  );
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search work orders..."
            className="pl-8"
            value={filters.searchQuery}
            onChange={handleInputChange}
            disabled={isLoading}
          />
        </div>
        <Button 
          variant="outline" 
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          disabled={isLoading}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={clearFilters}
            className="text-red-500"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select 
              value={filters.status || ''} 
              onValueChange={(value) => handleFilterChange('status', value || null)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any status</SelectItem>
                {Object.keys(statusConfig).map(status => (
                  <SelectItem key={status} value={status}>
                    {statusConfig[status as keyof typeof statusConfig].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select 
              value={filters.priority || ''} 
              onValueChange={(value) => handleFilterChange('priority', value || null)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any priority</SelectItem>
                {Object.keys(priorityConfig).map(priority => (
                  <SelectItem key={priority} value={priority}>
                    {priorityConfig[priority as keyof typeof priorityConfig].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Technician</label>
            <Select 
              value={filters.technician || ''} 
              onValueChange={(value) => handleFilterChange('technician', value || null)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any technician" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any technician</SelectItem>
                {technicians.map(tech => (
                  <SelectItem key={tech} value={tech}>
                    {tech}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date Range</label>
            <div className="flex items-center gap-2">
              <DatePicker
                date={filters.dateFrom}
                setDate={(date) => handleFilterChange('dateFrom', date)}
                placeholder="From"
                disabled={isLoading}
              />
              <span className="text-muted-foreground">-</span>
              <DatePicker
                date={filters.dateTo}
                setDate={(date) => handleFilterChange('dateTo', date)}
                placeholder="To"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
