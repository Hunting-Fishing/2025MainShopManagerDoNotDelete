import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Define customer filter interface
export interface CustomerFilters {
  searchQuery: string;
  tags: string[];
  hasVehicles: 'yes' | 'no' | 'all';
  vehicleType: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

const VEHICLE_TYPES = [
  "all",
  "sedan",
  "suv",
  "truck",
  "van",
  "coupe",
  "wagon",
  "hatchback",
  "convertible",
  "motorcycle",
  "other"
];

const CUSTOMER_TAGS = [
  "VIP",
  "Regular",
  "Commercial",
  "Fleet",
  "Warranty",
  "New",
  "Referral",
  "Discount",
  "Late Payment",
  "Special Pricing"
];

// Export the component itself
export function CustomerFilterControls({ 
  filters, 
  onFilterChange 
}: { 
  filters: CustomerFilters; 
  onFilterChange: (filters: CustomerFilters) => void;
}) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      searchQuery: e.target.value
    });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    
    onFilterChange({
      ...filters,
      tags: newTags
    });
  };

  const handleVehicleTypeChange = (value: string) => {
    onFilterChange({
      ...filters,
      vehicleType: value
    });
  };

  const handleHasVehiclesChange = (value: 'yes' | 'no' | 'all') => {
    onFilterChange({
      ...filters,
      hasVehicles: value
    });
  };

  const handleDateRangeChange = (field: 'from' | 'to', value: Date | null) => {
    onFilterChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value
      }
    });
  };

  const clearFilters = () => {
    onFilterChange({
      searchQuery: '',
      tags: [],
      hasVehicles: 'all',
      vehicleType: 'all',
      dateRange: {
        from: null,
        to: null
      }
    });
  };

  const hasActiveFilters = 
    filters.searchQuery !== '' || 
    filters.tags.length > 0 || 
    filters.hasVehicles !== 'all' || 
    filters.vehicleType !== 'all' ||
    filters.dateRange.from !== null ||
    filters.dateRange.to !== null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search customers by name, email, phone..."
            className="pl-9"
            value={filters.searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="flex gap-2">
          <Select 
            value={filters.vehicleType} 
            onValueChange={handleVehicleTypeChange}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Vehicle Type" />
            </SelectTrigger>
            <SelectContent>
              {VEHICLE_TYPES.map(type => (
                <SelectItem key={type} value={type}>
                  {type === 'all' ? 'All Vehicles' : type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={filters.hasVehicles} 
            onValueChange={handleHasVehiclesChange as (value: string) => void}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Has Vehicles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              <SelectItem value="yes">With Vehicles</SelectItem>
              <SelectItem value="no">No Vehicles</SelectItem>
            </SelectContent>
          </Select>
          
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              onClick={clearFilters}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium text-gray-500">Tags:</span>
        {CUSTOMER_TAGS.map(tag => (
          <Badge 
            key={tag}
            variant={filters.tags.includes(tag) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleTagToggle(tag)}
          >
            {tag}
          </Badge>
        ))}
        
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">Date Range:</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !filters.dateRange.from && !filters.dateRange.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                      {format(filters.dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(filters.dateRange.from, "LLL dd, y")
                  )
                ) : (
                  "Select date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange.from || undefined}
                selected={{
                  from: filters.dateRange.from || undefined,
                  to: filters.dateRange.to || undefined,
                }}
                onSelect={(range) => {
                  handleDateRangeChange('from', range?.from || null);
                  handleDateRangeChange('to', range?.to || null);
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
