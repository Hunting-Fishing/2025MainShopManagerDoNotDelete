
import React from "react";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface InventoryFiltersProps {
  categories: string[];
  statuses: string[];
  suppliers: string[];
  locations: string[];
  categoryFilter: string[];
  statusFilter: string[];
  supplierFilter: string;
  locationFilter: string;
  setCategoryFilter: (categories: string[]) => void;
  setStatusFilter: (statuses: string[]) => void;
  setSupplierFilter: (supplier: string) => void;
  setLocationFilter: (location: string) => void;
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
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
}) => {
  const handleCategoryToggle = (category: string) => {
    if (categoryFilter.includes(category)) {
      setCategoryFilter(categoryFilter.filter(c => c !== category));
    } else {
      setCategoryFilter([...categoryFilter, category]);
    }
  };

  const handleStatusToggle = (status: string) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(s => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  const resetFilters = () => {
    setCategoryFilter([]);
    setStatusFilter([]);
    setSupplierFilter("");
    setLocationFilter("");
  };

  const hasActiveFilters = categoryFilter.length > 0 || statusFilter.length > 0 || 
                           supplierFilter !== "" || locationFilter !== "";

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-700 flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </h3>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetFilters} 
            className="text-xs text-gray-500"
          >
            Clear all
          </Button>
        )}
      </div>
      
      <div className="space-y-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-between text-left"
            >
              Categories {categoryFilter.length > 0 && `(${categoryFilter.length})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Filter by category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {categories.map((category) => (
              <DropdownMenuCheckboxItem
                key={category}
                checked={categoryFilter.includes(category)}
                onCheckedChange={() => handleCategoryToggle(category)}
              >
                {category}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-between text-left"
            >
              Status {statusFilter.length > 0 && `(${statusFilter.length})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {statuses.map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={statusFilter.includes(status)}
                onCheckedChange={() => handleStatusToggle(status)}
              >
                {status}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="space-y-2">
          <label className="text-sm text-gray-500">Supplier</label>
          <Select value={supplierFilter} onValueChange={setSupplierFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All suppliers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All suppliers</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier} value={supplier}>
                  {supplier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-500">Location</label>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All locations</SelectItem>
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
};
