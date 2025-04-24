
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SavedSearches } from "./SavedSearches";

export interface CustomerFilters {
  search?: string;
  hasVehicles?: boolean;
  noVehicles?: boolean;
  hasWorkOrders?: boolean;
  status?: string;
  dateFrom?: Date | null;
  dateTo?: Date | null;
  segment?: string;
  tags?: string[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface CustomerFilterControlsProps {
  filters: CustomerFilters;
  onFilterChange: (filters: CustomerFilters) => void;
  disabled?: boolean; // Added disabled prop to the interface
}

export const CustomerFilterControls: React.FC<CustomerFilterControlsProps> = ({ 
  filters, 
  onFilterChange,
  disabled = false 
}) => {
  // Ensure filters is never null or undefined
  const safeFilters = filters || {};
  
  const [searchInput, setSearchInput] = useState(safeFilters.search || "");
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...safeFilters, search: searchInput });
  };

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <form onSubmit={handleSearchSubmit} className="flex flex-1 space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search customers..."
            className="pl-8"
            value={searchInput}
            onChange={handleSearchChange}
            disabled={disabled}
          />
        </div>
        <Button type="submit" variant="default" disabled={disabled}>
          Search
        </Button>
      </form>
      <SavedSearches disabled={disabled} />
    </div>
  );
};
