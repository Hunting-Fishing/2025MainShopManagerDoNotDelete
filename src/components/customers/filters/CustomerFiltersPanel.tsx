
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { CustomerFilters } from "@/domain/customer/repositories/CustomerRepository";

interface CustomerFiltersPanelProps {
  filters: CustomerFilters;
  onFilterChange: (filters: Partial<CustomerFilters>) => void;
  onClearFilters: () => void;
}

export function CustomerFiltersPanel({ 
  filters, 
  onFilterChange, 
  onClearFilters 
}: CustomerFiltersPanelProps) {
  const hasActiveFilters = Boolean(
    filters.search || 
    filters.hasVehicles || 
    filters.vehicleType ||
    filters.tags?.length ||
    filters.dateRange?.from ||
    filters.dateRange?.to
  );

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-900">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search customers..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="pl-10"
          />
        </div>

        <Select
          value={filters.hasVehicles || ''}
          onValueChange={(value) => onFilterChange({ 
            hasVehicles: value as 'yes' | 'no' | '' 
          })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Has vehicles?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All customers</SelectItem>
            <SelectItem value="yes">With vehicles</SelectItem>
            <SelectItem value="no">Without vehicles</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.vehicleType || ''}
          onValueChange={(value) => onFilterChange({ vehicleType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Vehicle type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All types</SelectItem>
            <SelectItem value="car">Car</SelectItem>
            <SelectItem value="truck">Truck</SelectItem>
            <SelectItem value="motorcycle">Motorcycle</SelectItem>
            <SelectItem value="suv">SUV</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
