
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface InventoryFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string[];
  setCategoryFilter: (categories: string[]) => void;
  statusFilter: string[];
  setStatusFilter: (statuses: string[]) => void;
  supplierFilter: string;
  setSupplierFilter: (supplier: string) => void;
}

export function InventoryFilters({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  supplierFilter,
  setSupplierFilter,
}: InventoryFiltersProps) {
  const [filtersVisible, setFiltersVisible] = React.useState(false);

  // Function to remove a category from the filter
  const removeCategory = (category: string) => {
    setCategoryFilter(categoryFilter.filter((c) => c !== category));
  };

  // Function to remove a status from the filter
  const removeStatus = (status: string) => {
    setStatusFilter(statusFilter.filter((s) => s !== status));
  };

  // Function to clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setCategoryFilter([]);
    setStatusFilter([]);
    setSupplierFilter('all');
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery !== '' ||
    categoryFilter.length > 0 ||
    statusFilter.length > 0 ||
    supplierFilter !== 'all';

  return (
    <div className="space-y-4">
      {/* Search and filter buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search inventory items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
          variant={filtersVisible ? 'secondary' : 'outline'}
          onClick={() => setFiltersVisible(!filtersVisible)}
          className="gap-1"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1">
              {categoryFilter.length + statusFilter.length + (supplierFilter !== 'all' ? 1 : 0)}
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearAllFilters} size="sm">
            Clear all
          </Button>
        )}
      </div>

      {/* Filter options */}
      {filtersVisible && (
        <div className="bg-muted/40 border rounded-md p-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Category</label>
            <Select
              value="placeholder"
              onValueChange={(value) => {
                if (value !== 'placeholder' && !categoryFilter.includes(value)) {
                  setCategoryFilter([...categoryFilter, value]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placeholder" disabled>
                  Select category
                </SelectItem>
                <SelectItem value="Brakes">Brakes</SelectItem>
                <SelectItem value="Engine">Engine</SelectItem>
                <SelectItem value="Suspension">Suspension</SelectItem>
                <SelectItem value="Electrical">Electrical</SelectItem>
                <SelectItem value="Body">Body</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Status</label>
            <Select
              value="placeholder"
              onValueChange={(value) => {
                if (value !== 'placeholder' && !statusFilter.includes(value)) {
                  setStatusFilter([...statusFilter, value]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placeholder" disabled>
                  Select status
                </SelectItem>
                <SelectItem value="In Stock">In Stock</SelectItem>
                <SelectItem value="Low Stock">Low Stock</SelectItem>
                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Supplier</label>
            <Select
              value={supplierFilter}
              onValueChange={(value) => setSupplierFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                <SelectItem value="AutoZone">AutoZone</SelectItem>
                <SelectItem value="NAPA">NAPA</SelectItem>
                <SelectItem value="O'Reilly">O'Reilly</SelectItem>
                <SelectItem value="Advance Auto">Advance Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {categoryFilter.map((category) => (
            <Badge key={category} variant="outline" className="flex items-center gap-1">
              {category}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCategory(category)}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {statusFilter.map((status) => (
            <Badge
              key={status}
              variant="outline"
              className={cn("flex items-center gap-1", {
                "border-green-200 bg-green-100 text-green-800": status === "In Stock",
                "border-yellow-200 bg-yellow-100 text-yellow-800": status === "Low Stock",
                "border-red-200 bg-red-100 text-red-800": status === "Out of Stock",
              })}
            >
              {status}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeStatus(status)}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {supplierFilter !== 'all' && (
            <Badge variant="outline" className="flex items-center gap-1">
              Supplier: {supplierFilter}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSupplierFilter('all')}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
