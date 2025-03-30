
import React, { useState } from "react";
import { DateRange } from "react-day-picker";
import { CustomerFilterHeader } from "./components/CustomerFilterHeader";
import { CustomerFilterPanel } from "./components/CustomerFilterPanel";

export interface CustomerFilters {
  searchQuery: string;
  tags?: string[];
  vehicleType?: string;
  dateRange?: DateRange;
  hasVehicles?: string;
}

interface CustomerFilterControlsProps {
  filters: CustomerFilters;
  onFilterChange: (filters: CustomerFilters) => void;
}

export const CustomerFilterControls: React.FC<CustomerFilterControlsProps> = ({
  filters,
  onFilterChange,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      searchQuery: e.target.value,
    });
  };

  const handleTagsChange = (newTags: string[]) => {
    onFilterChange({
      ...filters,
      tags: newTags,
    });
  };

  const handleVehicleTypeChange = (value: string) => {
    onFilterChange({
      ...filters,
      vehicleType: value || undefined,
    });
  };

  const handleHasVehiclesChange = (value: string) => {
    onFilterChange({
      ...filters,
      hasVehicles: value,
    });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    onFilterChange({
      ...filters,
      dateRange: range,
    });
  };

  const resetFilters = () => {
    onFilterChange({
      searchQuery: "",
      tags: [],
      vehicleType: undefined,
      dateRange: undefined,
      hasVehicles: undefined,
    });
  };

  const activeFiltersCount = 
    (filters.tags && filters.tags.length > 0 ? 1 : 0) +
    (filters.vehicleType ? 1 : 0) +
    (filters.dateRange && (filters.dateRange.from || filters.dateRange.to) ? 1 : 0) +
    (filters.hasVehicles ? 1 : 0);

  return (
    <div className="space-y-4">
      <CustomerFilterHeader
        searchQuery={filters.searchQuery}
        onSearchChange={handleSearchChange}
        expanded={expanded}
        setExpanded={setExpanded}
        activeFiltersCount={activeFiltersCount}
        onResetFilters={resetFilters}
      />

      {expanded && (
        <CustomerFilterPanel
          filters={filters}
          onTagsChange={handleTagsChange}
          onVehicleTypeChange={handleVehicleTypeChange}
          onDateRangeChange={handleDateRangeChange}
          onHasVehiclesChange={handleHasVehiclesChange}
          onApplySearch={onFilterChange}
        />
      )}
    </div>
  );
};
