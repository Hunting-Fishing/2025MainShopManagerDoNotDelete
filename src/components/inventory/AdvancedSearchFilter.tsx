
import React, { useState, useEffect } from "react";
import { Search, Filter, X, ChevronDown, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

export interface ColumnVisibility {
  id: string;
  header: string;
  show: boolean;
}

interface AdvancedSearchFilterProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  categoryFilter: string[];
  setCategoryFilter: (value: string[]) => void;
  statusFilter: string[];
  setStatusFilter: (value: string[]) => void;
  supplierFilter: string;
  setSupplierFilter: (value: string) => void;
  locationFilter: string;
  setLocationFilter: (value: string) => void;
  priceRange: [number | null, number | null];
  setPriceRange: (value: [number | null, number | null]) => void;
  quantityRange: [number | null, number | null];
  setQuantityRange: (value: [number | null, number | null]) => void;
  dateRange: [string | null, string | null];
  setDateRange: (value: [string | null, string | null]) => void;
  categories: string[];
  statuses: string[];
  suppliers: string[];
  locations: string[];
  columns: ColumnVisibility[];
  setColumns: (value: ColumnVisibility[]) => void;
  onSearch: () => void;
  onClearAll: () => void;
}

export function AdvancedSearchFilter({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  supplierFilter,
  setSupplierFilter,
  locationFilter,
  setLocationFilter,
  priceRange,
  setPriceRange,
  quantityRange,
  setQuantityRange,
  dateRange,
  setDateRange,
  categories,
  statuses,
  suppliers,
  locations,
  columns,
  setColumns,
  onSearch,
  onClearAll
}: AdvancedSearchFilterProps) {
  const [advancedMode, setAdvancedMode] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Update active filters whenever a filter changes
  useEffect(() => {
    const filters: string[] = [];
    
    if (searchQuery) filters.push("Search");
    if (categoryFilter.length > 0) filters.push("Category");
    if (statusFilter.length > 0) filters.push("Status");
    if (supplierFilter !== "all") filters.push("Supplier");
    if (locationFilter !== "all") filters.push("Location");
    if (priceRange[0] !== null || priceRange[1] !== null) filters.push("Price");
    if (quantityRange[0] !== null || quantityRange[1] !== null) filters.push("Quantity");
    if (dateRange[0] !== null || dateRange[1] !== null) filters.push("Date");
    
    setActiveFilters(filters);
  }, [
    searchQuery, 
    categoryFilter, 
    statusFilter, 
    supplierFilter, 
    locationFilter,
    priceRange,
    quantityRange,
    dateRange
  ]);

  const handleCategoryToggle = (category: string) => {
    if (categoryFilter.includes(category)) {
      setCategoryFilter(categoryFilter.filter((c) => c !== category));
    } else {
      setCategoryFilter([...categoryFilter, category]);
    }
  };

  const handleStatusToggle = (status: string) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter((s) => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  const handleColumnVisibilityChange = (columnId: string, isVisible: boolean) => {
    setColumns(
      columns.map(col => 
        col.id === columnId ? { ...col, show: isVisible } : col
      )
    );
  };

  const handleRemoveFilter = (filter: string) => {
    switch (filter) {
      case "Search":
        setSearchQuery("");
        break;
      case "Category":
        setCategoryFilter([]);
        break;
      case "Status":
        setStatusFilter([]);
        break;
      case "Supplier":
        setSupplierFilter("all");
        break;
      case "Location":
        setLocationFilter("all");
        break;
      case "Price":
        setPriceRange([null, null]);
        break;
      case "Quantity":
        setQuantityRange([null, null]);
        break;
      case "Date":
        setDateRange([null, null]);
        break;
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
      {/* Basic Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by name, SKU, Part #, or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="whitespace-nowrap rounded-full">
              <Filter className="mr-2 h-4 w-4" />
              Quick Filters
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel className="font-normal text-xs text-gray-500">Category</DropdownMenuLabel>
            {categories.slice(0, 5).map((category) => (
              <DropdownMenuCheckboxItem
                key={category}
                checked={categoryFilter.includes(category)}
                onCheckedChange={() => handleCategoryToggle(category)}
              >
                {category}
              </DropdownMenuCheckboxItem>
            ))}
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="font-normal text-xs text-gray-500">Status</DropdownMenuLabel>
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

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="whitespace-nowrap rounded-full">
              <ChevronDown className="mr-2 h-4 w-4" />
              Columns
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-0" align="end">
            <div className="p-3 border-b">
              <h4 className="font-medium">Show/Hide Columns</h4>
              <p className="text-xs text-gray-500">Select columns to display</p>
            </div>
            <ScrollArea className="h-[300px]">
              <div className="p-3 space-y-2">
                {columns.map(column => (
                  <div key={column.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`column-${column.id}`} 
                      checked={column.show}
                      onCheckedChange={(checked) => 
                        handleColumnVisibilityChange(column.id, checked as boolean)
                      }
                    />
                    <label 
                      htmlFor={`column-${column.id}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {column.header}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>

        <Button 
          variant={advancedMode ? "secondary" : "outline"}
          className="whitespace-nowrap rounded-full"
          onClick={() => setAdvancedMode(!advancedMode)}
        >
          {advancedMode ? "Simple View" : "Advanced Search"}
        </Button>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map(filter => (
            <Badge key={filter} variant="outline" className="flex items-center gap-1 text-xs">
              {filter}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFilter(filter)}
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs text-gray-500 h-5 px-2 hover:bg-gray-100"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Advanced Search Panel */}
      {advancedMode && (
        <ResizablePanelGroup
          direction="horizontal"
          className="border rounded-lg overflow-hidden"
        >
          {/* Filters Panel */}
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="h-full p-4 bg-gray-50">
              <h3 className="font-medium mb-3">Filters</h3>
              
              <div className="space-y-5">
                {/* Category Filter */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Category</h4>
                  <Select
                    value={categoryFilter.length > 0 ? categoryFilter[0] : ""}
                    onValueChange={(value) => {
                    if (value && value !== "all") {
                        setCategoryFilter([value]);
                      } else {
                        setCategoryFilter([]);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Status Filter */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Status</h4>
                  <div className="space-y-2">
                    {statuses.map(status => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`status-${status}`} 
                          checked={statusFilter.includes(status)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setStatusFilter([...statusFilter, status]);
                            } else {
                              setStatusFilter(statusFilter.filter(s => s !== status));
                            }
                          }}
                        />
                        <label 
                          htmlFor={`status-${status}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
                  <Select
                    value={supplierFilter}
                    onValueChange={setSupplierFilter}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Suppliers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Suppliers</SelectItem>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier} value={supplier}>
                          {supplier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Location Filter */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Location</h4>
                  <Select
                    value={locationFilter}
                    onValueChange={setLocationFilter}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Price Range */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Price Range</h4>
                  <div className="flex space-x-2 items-center">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0] !== null ? priceRange[0] : ""}
                      onChange={(e) => setPriceRange([
                        e.target.value ? Number(e.target.value) : null,
                        priceRange[1]
                      ])}
                      className="w-full"
                    />
                    <span>to</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1] !== null ? priceRange[1] : ""}
                      onChange={(e) => setPriceRange([
                        priceRange[0],
                        e.target.value ? Number(e.target.value) : null
                      ])}
                      className="w-full"
                    />
                  </div>
                </div>
                
                {/* Quantity Range */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Quantity Range</h4>
                  <div className="flex space-x-2 items-center">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={quantityRange[0] !== null ? quantityRange[0] : ""}
                      onChange={(e) => setQuantityRange([
                        e.target.value ? Number(e.target.value) : null,
                        quantityRange[1]
                      ])}
                      className="w-full"
                    />
                    <span>to</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={quantityRange[1] !== null ? quantityRange[1] : ""}
                      onChange={(e) => setQuantityRange([
                        quantityRange[0],
                        e.target.value ? Number(e.target.value) : null
                      ])}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Results Panel */}
          <ResizablePanel defaultSize={70}>
            <div className="h-full p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Search Results Preview</h3>
                <Button 
                  variant="default" 
                  onClick={onSearch}
                  className="rounded-full"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Apply Filters
                </Button>
              </div>
              
              <div className="text-sm text-gray-500">
                <p>Your current search will filter for:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {searchQuery && <li>Items containing "<strong>{searchQuery}</strong>"</li>}
                  {categoryFilter.length > 0 && (
                    <li>In category: <strong>{categoryFilter.join(", ")}</strong></li>
                  )}
                  {statusFilter.length > 0 && (
                    <li>With status: <strong>{statusFilter.join(", ")}</strong></li>
                  )}
                  {supplierFilter !== "all" && (
                    <li>From supplier: <strong>{supplierFilter}</strong></li>
                  )}
                  {locationFilter !== "all" && (
                    <li>In location: <strong>{locationFilter}</strong></li>
                  )}
                  {(priceRange[0] !== null || priceRange[1] !== null) && (
                    <li>
                      Price range: <strong>
                        {priceRange[0] !== null ? `$${priceRange[0]}` : "$0"} to {priceRange[1] !== null ? `$${priceRange[1]}` : "any"}
                      </strong>
                    </li>
                  )}
                  {(quantityRange[0] !== null || quantityRange[1] !== null) && (
                    <li>
                      Quantity range: <strong>
                        {quantityRange[0] !== null ? quantityRange[0] : "0"} to {quantityRange[1] !== null ? quantityRange[1] : "any"}
                      </strong>
                    </li>
                  )}
                </ul>
                
                {activeFilters.length === 0 && (
                  <p className="mt-2 italic">No filters applied. All items will be shown.</p>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );
}
