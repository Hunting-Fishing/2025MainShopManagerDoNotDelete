
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronDown, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TagSelector } from "../form/TagSelector";
import { SavedSearches } from "./SavedSearches";
import { DateRange } from "react-day-picker";

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
  const [tempTags, setTempTags] = useState<string[]>(filters.tags || []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      searchQuery: e.target.value,
    });
  };

  const handleTagsChange = (newTags: string[]) => {
    setTempTags(newTags);
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
    setTempTags([]);
  };

  const activeFiltersCount = 
    (filters.tags && filters.tags.length > 0 ? 1 : 0) +
    (filters.vehicleType ? 1 : 0) +
    (filters.dateRange && (filters.dateRange.from || filters.dateRange.to) ? 1 : 0) +
    (filters.hasVehicles ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-grow">
          <Input
            placeholder="Search customers..."
            value={filters.searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </div>
        <div className="flex gap-2">
          <Button
            variant={expanded ? "secondary" : "outline"}
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={resetFilters}
              title="Clear all filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {expanded && (
        <Card className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Tags</Label>
              <TagSelector 
                form={{ 
                  setValue: (_name: string, value: string[]) => handleTagsChange(value), 
                  watch: () => tempTags
                }}
                field={{ 
                  name: "tags", 
                  value: tempTags,
                  onChange: (value: string[]) => handleTagsChange(value) 
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Vehicle Type</Label>
              <Select
                value={filters.vehicleType || ""}
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
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Service Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateRange?.from && !filters.dateRange?.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange?.from ? (
                      filters.dateRange.to ? (
                        <>
                          {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                          {format(filters.dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(filters.dateRange.from, "LLL dd, y")
                      )
                    ) : filters.dateRange?.to ? (
                      format(filters.dateRange.to, "LLL dd, y")
                    ) : (
                      <span>Service date range</span>
                    )}
                    {(filters.dateRange?.from || filters.dateRange?.to) && (
                      <X 
                        className="ml-auto h-4 w-4 hover:scale-110 transition-transform cursor-pointer" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDateRangeChange(undefined);
                        }}
                      />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={filters.dateRange}
                    onSelect={handleDateRangeChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Has Vehicles</Label>
              <Select
                value={filters.hasVehicles || ""}
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
          </div>

          <SavedSearches
            currentFilters={filters}
            onApplySearch={onFilterChange}
          />
        </Card>
      )}
    </div>
  );
};
