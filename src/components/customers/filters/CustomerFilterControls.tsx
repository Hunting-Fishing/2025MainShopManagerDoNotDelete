
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { TagSelector } from "@/components/customers/form/TagSelector";
import { X, ChevronDown, ChevronUp, Filter, Calendar, Tag } from "lucide-react";
import { SavedSearches } from "./SavedSearches";

export interface CustomerFilters {
  searchQuery: string;
  tags: string[];
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<CustomerFilters>(filters);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Update local state when parent filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Calculate the number of active filters
  useEffect(() => {
    let count = 0;
    if (filters.tags && filters.tags.length > 0) count++;
    if (filters.vehicleType) count++;
    if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) count++;
    if (filters.hasVehicles) count++;
    setActiveFilterCount(count);
  }, [filters]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...localFilters, searchQuery: e.target.value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTagsChange = (newTags: string[]) => {
    const newFilters = { ...localFilters, tags: newTags };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleVehicleTypeChange = (value: string) => {
    const newFilters = { ...localFilters, vehicleType: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    const newFilters = { ...localFilters, dateRange: range };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleHasVehiclesChange = (value: string) => {
    const newFilters = { ...localFilters, hasVehicles: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: CustomerFilters = {
      searchQuery: localFilters.searchQuery, // Keep the search query
      tags: [],
      vehicleType: undefined,
      dateRange: undefined,
      hasVehicles: undefined,
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const handleApplySavedSearch = (savedFilters: Record<string, any>) => {
    const newFilters = { ...savedFilters };
    setLocalFilters(newFilters as CustomerFilters);
    onFilterChange(newFilters as CustomerFilters);
    setIsExpanded(true); // Expand to show the applied filters
  };

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="space-y-4 mb-6 border rounded-lg p-4">
      <div className="flex flex-col gap-4">
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="Search customers..."
            className="pl-8"
            value={localFilters.searchQuery}
            onChange={handleSearchInputChange}
          />
          <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" /> Hide Filters
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" /> Show Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1">
                      {activeFilterCount}
                    </Badge>
                  )}
                </>
              )}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" /> Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t mt-2">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium flex items-center mb-1">
                <Tag className="h-4 w-4 mr-1" /> Customer Tags
              </label>
              <TagSelector 
                value={localFilters.tags || []} 
                onChange={handleTagsChange} 
              />
            </div>

            <div>
              <label className="text-sm font-medium flex items-center mb-1">
                <Calendar className="h-4 w-4 mr-1" /> Service Date Range
              </label>
              <DatePickerWithRange
                date={localFilters.dateRange}
                setDate={handleDateRangeChange}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Vehicle Type</label>
              <Select 
                value={localFilters.vehicleType || ""} 
                onValueChange={handleVehicleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any vehicle type</SelectItem>
                  <SelectItem value="sedan">Sedan</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="coupe">Coupe</SelectItem>
                  <SelectItem value="wagon">Wagon</SelectItem>
                  <SelectItem value="convertible">Convertible</SelectItem>
                  <SelectItem value="hatchback">Hatchback</SelectItem>
                  <SelectItem value="crossover">Crossover</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Has Vehicles</label>
              <Select 
                value={localFilters.hasVehicles || ""} 
                onValueChange={handleHasVehiclesChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  <SelectItem value="yes">Has vehicles</SelectItem>
                  <SelectItem value="no">No vehicles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <SavedSearches 
              currentFilters={localFilters} 
              onApplySearch={handleApplySavedSearch} 
            />
          </div>
        </div>
      )}
    </div>
  );
};
