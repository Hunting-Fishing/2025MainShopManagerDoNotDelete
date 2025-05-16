
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface InventoryFiltersProps {
  categories: string[];
  statuses: string[];
  suppliers: string[];
  locations: string[];
  categoryFilter: string[] | string;
  statusFilter: string[] | string;
  supplierFilter: string;
  locationFilter: string;
  setCategoryFilter: (categories: string[]) => void;
  setStatusFilter: (statuses: string[]) => void;
  setSupplierFilter: (supplier: string) => void;
  setLocationFilter: (location: string) => void;
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
}: InventoryFiltersProps) {
  // Handle string vs array type for categoryFilter and statusFilter
  const categoryArray = Array.isArray(categoryFilter) 
    ? categoryFilter 
    : categoryFilter ? [categoryFilter] : [];
  
  const statusArray = Array.isArray(statusFilter) 
    ? statusFilter 
    : statusFilter ? [statusFilter] : [];
  
  const clearCategoryFilter = (category: string) => {
    const filteredCategories = categoryArray.filter((c) => c !== category);
    setCategoryFilter(filteredCategories);
  };

  const clearStatusFilter = (status: string) => {
    const filteredStatuses = statusArray.filter((s) => s !== status);
    setStatusFilter(filteredStatuses);
  };

  const handleCategoryChange = (category: string) => {
    if (category === "") {
      setCategoryFilter([]);
      return;
    }
    
    if (!categoryArray.includes(category)) {
      setCategoryFilter([...categoryArray, category]);
    }
  };

  const handleStatusChange = (status: string) => {
    if (status === "") {
      setStatusFilter([]);
      return;
    }
    
    if (!statusArray.includes(status)) {
      setStatusFilter([...statusArray, status]);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-background shadow-sm">
      <h3 className="font-semibold mb-3">Filters</h3>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">Category</label>
          <Select value="" onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {categoryArray.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {categoryArray.map((category) => (
                <Badge key={category} variant="outline" className="flex gap-1 items-center">
                  {category}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => clearCategoryFilter(category)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Status</label>
          <Select value="" onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {statusArray.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {statusArray.map((status) => (
                <Badge key={status} variant="outline" className="flex gap-1 items-center">
                  {status}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => clearStatusFilter(status)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Supplier</label>
          <Select value={supplierFilter} onValueChange={setSupplierFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Suppliers</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier} value={supplier}>
                  {supplier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Location</label>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
