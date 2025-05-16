
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface InventoryFiltersProps {
  categories: string[];
  statuses: string[];
  suppliers: string[];
  locations: string[];
  categoryFilter: string[];
  statusFilter: string[];
  supplierFilter: string;
  locationFilter: string;
  setCategoryFilter: (value: string[]) => void;
  setStatusFilter: (value: string[]) => void;
  setSupplierFilter: (value: string) => void;
  setLocationFilter: (value: string) => void;
  onReset: () => void;
}

export function InventoryFilters({
  categories,
  statuses,
  suppliers,
  locations,
  categoryFilter,
  statusFilter,
  supplierFilter,
  locationFilter,
  setCategoryFilter,
  setStatusFilter,
  setSupplierFilter,
  setLocationFilter,
  onReset
}: InventoryFiltersProps) {
  // Calculate active filter count
  const activeFiltersCount = 
    categoryFilter.length + 
    statusFilter.length + 
    (supplierFilter ? 1 : 0) + 
    (locationFilter ? 1 : 0);
  
  // Category filter handler
  const handleCategoryChange = (category: string) => {
    if (categoryFilter.includes(category)) {
      setCategoryFilter(categoryFilter.filter(c => c !== category));
    } else {
      setCategoryFilter([...categoryFilter, category]);
    }
  };
  
  // Status filter handler
  const handleStatusChange = (status: string) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(s => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Filters</h3>
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{activeFiltersCount}</Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onReset}
              className="h-8 px-2 text-xs"
            >
              Reset
            </Button>
          </div>
        )}
      </div>
      
      {/* Category Filter */}
      <div>
        <h4 className="text-sm font-medium mb-2">Category</h4>
        <ScrollArea className="h-32">
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox 
                  id={`category-${category}`}
                  checked={categoryFilter.includes(category)}
                  onCheckedChange={() => handleCategoryChange(category)}
                />
                <label 
                  htmlFor={`category-${category}`}
                  className="text-sm cursor-pointer"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      {/* Status Filter */}
      <div>
        <h4 className="text-sm font-medium mb-2">Status</h4>
        <div className="space-y-2">
          {statuses.map((status) => (
            <div key={status} className="flex items-center space-x-2">
              <Checkbox 
                id={`status-${status}`}
                checked={statusFilter.includes(status)}
                onCheckedChange={() => handleStatusChange(status)}
              />
              <label 
                htmlFor={`status-${status}`}
                className="text-sm cursor-pointer"
              >
                {status}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Supplier Filter */}
      <div>
        <h4 className="text-sm font-medium mb-2">Supplier</h4>
        <select
          value={supplierFilter}
          onChange={(e) => setSupplierFilter(e.target.value)}
          className="w-full rounded-md border border-input px-3 py-2 text-sm"
        >
          <option value="">All Suppliers</option>
          {suppliers.map((supplier) => (
            <option key={supplier} value={supplier}>
              {supplier}
            </option>
          ))}
        </select>
      </div>
      
      {/* Location Filter */}
      <div>
        <h4 className="text-sm font-medium mb-2">Location</h4>
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="w-full rounded-md border border-input px-3 py-2 text-sm"
        >
          <option value="">All Locations</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
