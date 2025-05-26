
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal } from 'lucide-react';
import { DateRange } from 'react-day-picker';

export interface CustomerFilters {
  search?: string;
  searchQuery?: string;
  status?: string;
  sortBy?: string;
  tags?: string[];
  vehicleType?: string;
  hasVehicles?: string;
  dateRange?: DateRange;
}

interface CustomerFilterControlsProps {
  filters: CustomerFilters;
  onFilterChange: (filters: Partial<CustomerFilters>) => void;
}

export const CustomerFilterControls: React.FC<CustomerFilterControlsProps> = ({
  filters,
  onFilterChange
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search customers by name, email, phone..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="pl-10"
        />
      </div>
      
      <div className="flex gap-2">
        <Select
          value={filters.sortBy || 'name'}
          onValueChange={(value) => onFilterChange({ sortBy: value })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="created">Created Date</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline" className="rounded-full">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>
    </div>
  );
};
