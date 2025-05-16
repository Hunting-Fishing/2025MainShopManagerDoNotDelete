
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  setLocationFilter
}: InventoryFiltersProps) {
  const [open, setOpen] = useState(false);

  const handleCategoryChange = (category: string) => {
    if (categoryFilter.includes(category)) {
      setCategoryFilter(categoryFilter.filter(c => c !== category));
    } else {
      setCategoryFilter([...categoryFilter, category]);
    }
  };

  const handleStatusChange = (status: string) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(s => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  const clearFilters = () => {
    setCategoryFilter([]);
    setStatusFilter([]);
    setSupplierFilter('');
    setLocationFilter('');
  };

  const hasFilters = categoryFilter.length > 0 || statusFilter.length > 0 || supplierFilter || locationFilter;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <CardTitle className="text-sm font-medium">Filters</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}>
          <Filter className="h-4 w-4 mr-2" />
          {open ? 'Hide' : 'Show'}
        </Button>
      </CardHeader>

      {open && (
        <CardContent className="p-4 pt-0">
          {/* Categories */}
          <div className="space-y-2 mb-4">
            <Label className="font-medium">Categories</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={categoryFilter.includes(category)}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <Label
                    htmlFor={`category-${category}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Statuses */}
          <div className="space-y-2 mb-4">
            <Label className="font-medium">Status</Label>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={statusFilter.includes(status)}
                    onCheckedChange={() => handleStatusChange(status)}
                  />
                  <Label
                    htmlFor={`status-${status}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {status}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Supplier */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="supplier" className="font-medium">Supplier</Label>
            <Select
              value={supplierFilter}
              onValueChange={setSupplierFilter}
            >
              <SelectTrigger id="supplier">
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

          {/* Location */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="location" className="font-medium">Location</Label>
            <Select
              value={locationFilter}
              onValueChange={setLocationFilter}
            >
              <SelectTrigger id="location">
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

          {hasFilters && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      )}

      {/* Active filters preview */}
      {hasFilters && !open && (
        <CardContent className="p-4 pt-0">
          <div className="flex flex-wrap gap-2">
            {categoryFilter.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {category}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleCategoryChange(category)}
                />
              </Badge>
            ))}
            {statusFilter.map((status) => (
              <Badge
                key={status}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {status}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleStatusChange(status)}
                />
              </Badge>
            ))}
            {supplierFilter && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1"
              >
                {supplierFilter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setSupplierFilter('')}
                />
              </Badge>
            )}
            {locationFilter && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1"
              >
                {locationFilter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setLocationFilter('')}
                />
              </Badge>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
