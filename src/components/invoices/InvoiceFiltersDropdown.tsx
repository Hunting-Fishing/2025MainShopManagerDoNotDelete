import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter } from "lucide-react";
import { InvoiceFiltersDropdownProps } from "@/types/invoice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function InvoiceFiltersDropdown({ filters, onFilterChange, onResetFilters, onApplyFilters }: InvoiceFiltersDropdownProps) {
  const [localFilters, setLocalFilters] = useState({
    status: filters?.status || "",
    customer: filters?.customer || "",
    dateFrom: "",
    dateTo: "",
    minAmount: "",
    maxAmount: ""
  });

  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
    
    if (onFilterChange) {
      onFilterChange({ [key]: value });
    }
  };

  const handleApplyFilters = () => {
    onApplyFilters(localFilters);
  };

  const handleReset = () => {
    if (onResetFilters) {
      onResetFilters();
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          <h3 className="font-medium">Filters</h3>
          
          <div className="space-y-2">
            <Label>Status</Label>
            <Select 
              value={localFilters.status} 
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Customer</Label>
            <Input 
              placeholder="Search by customer name"
              value={localFilters.customer}
              onChange={(e) => handleFilterChange('customer', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-sm">From Date</Label>
              <Input 
                type="date"
                value={localFilters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">To Date</Label>
              <Input 
                type="date"
                value={localFilters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-sm">Min Amount ($)</Label>
              <Input 
                type="number"
                value={localFilters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Max Amount ($)</Label>
              <Input 
                type="number"
                value={localFilters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
              />
            </div>
          </div>
          
          <Button className="w-full" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
