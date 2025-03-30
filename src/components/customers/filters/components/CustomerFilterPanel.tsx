
import React from "react";
import { Card } from "@/components/ui/card";
import { CustomerFilterTags } from "./CustomerFilterTags";
import { CustomerVehicleTypeFilter } from "./CustomerVehicleTypeFilter";
import { CustomerDateRangeFilter } from "./CustomerDateRangeFilter";
import { CustomerHasVehiclesFilter } from "./CustomerHasVehiclesFilter";
import { SavedSearches } from "../SavedSearches";
import { DateRange } from "react-day-picker";
import { CustomerFilters } from "../CustomerFilterControls";

interface CustomerFilterPanelProps {
  filters: CustomerFilters;
  onTagsChange: (tags: string[]) => void;
  onVehicleTypeChange: (type: string) => void;
  onDateRangeChange: (range?: DateRange) => void;
  onHasVehiclesChange: (value: string) => void;
  onApplySearch: (filters: CustomerFilters) => void;
}

export const CustomerFilterPanel: React.FC<CustomerFilterPanelProps> = ({
  filters,
  onTagsChange,
  onVehicleTypeChange,
  onDateRangeChange,
  onHasVehiclesChange,
  onApplySearch,
}) => {
  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <CustomerFilterTags
          initialTags={filters.tags || []}
          onTagsChange={onTagsChange}
        />

        <CustomerVehicleTypeFilter
          vehicleType={filters.vehicleType}
          onVehicleTypeChange={onVehicleTypeChange}
        />

        <CustomerDateRangeFilter
          dateRange={filters.dateRange}
          onDateRangeChange={onDateRangeChange}
        />

        <CustomerHasVehiclesFilter
          hasVehicles={filters.hasVehicles}
          onHasVehiclesChange={onHasVehiclesChange}
        />
      </div>

      <SavedSearches
        currentFilters={filters}
        onApplySearch={onApplySearch}
      />
    </Card>
  );
};
