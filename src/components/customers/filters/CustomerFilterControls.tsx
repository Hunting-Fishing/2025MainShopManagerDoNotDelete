
import React from 'react';
import { DateRange } from 'react-day-picker';
import { CustomerFilterPanel } from './components/CustomerFilterPanel';

export interface CustomerFilters {
  searchQuery?: string;
  tags?: string[];
  vehicleType?: string;
  hasVehicles?: string;
  dateRange?: DateRange;
}

export interface CustomerFilterControlsProps {
  filters: CustomerFilters;
  onFilterChange: (filters: CustomerFilters) => void;
}

export const CustomerFilterControls: React.FC<CustomerFilterControlsProps> = ({
  filters,
  onFilterChange
}) => {
  const handleTagsChange = (tags: string[]) => {
    onFilterChange({ ...filters, tags });
  };

  const handleVehicleTypeChange = (vehicleType: string) => {
    onFilterChange({ ...filters, vehicleType });
  };

  const handleDateRangeChange = (dateRange: DateRange | undefined) => {
    onFilterChange({ ...filters, dateRange });
  };
  
  const handleHasVehiclesChange = (hasVehicles: string) => {
    onFilterChange({ ...filters, hasVehicles });
  };

  const handleApplySearch = (newFilters: CustomerFilters) => {
    onFilterChange(newFilters);
  };

  return (
    <CustomerFilterPanel
      filters={filters}
      onTagsChange={handleTagsChange}
      onVehicleTypeChange={handleVehicleTypeChange}
      onDateRangeChange={handleDateRangeChange}
      onHasVehiclesChange={handleHasVehiclesChange}
      onApplySearch={handleApplySearch}
    />
  );
};
