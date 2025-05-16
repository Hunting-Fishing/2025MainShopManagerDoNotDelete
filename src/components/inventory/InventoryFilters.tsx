
import React from "react";
import { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Filter } from "lucide-react";

export interface InventoryFiltersProps {
  categories: string[];
  statuses: string[];
  suppliers: string[];
  locations: string[];
  categoryFilter: string[];
  statusFilter: string[];
  supplierFilter: string;
  locationFilter: string;
  setCategoryFilter: Dispatch<SetStateAction<string[]>>;
  setStatusFilter: Dispatch<SetStateAction<string[]>>;
  setSupplierFilter: Dispatch<SetStateAction<string>>;
  setLocationFilter: Dispatch<SetStateAction<string>>;
  onReset: () => void;
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
  onReset
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center mb-4">
        <Filter className="w-5 h-5 mr-2 text-gray-500" />
        <h2 className="text-lg font-medium">Filters</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onReset}
          className="ml-auto text-sm"
        >
          Reset
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Categories</label>
          <MultiSelect 
            options={categories.map(cat => ({ label: cat, value: cat }))}
            selected={categoryFilter}
            onChange={setCategoryFilter}
            placeholder="Select categories"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <MultiSelect 
            options={statuses.map(status => ({ label: status, value: status }))}
            selected={statusFilter}
            onChange={setStatusFilter}
            placeholder="Select status"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Supplier</label>
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
        
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
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
