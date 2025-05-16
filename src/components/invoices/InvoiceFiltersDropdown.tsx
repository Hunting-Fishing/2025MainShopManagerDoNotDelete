
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { ChevronDown, Filter } from "lucide-react";

export interface InvoiceFiltersDropdownProps {
  onApplyFilters: (filters: any) => void;
}

export const InvoiceFiltersDropdown: React.FC<InvoiceFiltersDropdownProps> = ({ onApplyFilters }) => {
  const [filters, setFilters] = useState({
    status: 'all',
    searchTerm: '',
    dateRange: {
      from: null,
      to: null,
    },
    created_by: '',
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDateChange = (key: 'from' | 'to', value: Date | null) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [key]: value
      }
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      status: 'all',
      searchTerm: '',
      dateRange: {
        from: null,
        to: null,
      },
      created_by: '',
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="grid gap-4">
          <h4 className="font-semibold">Filter Invoices</h4>
          
          <div className="grid gap-2">
            <label htmlFor="status" className="text-sm">Status</label>
            <Select 
              value={filters.status} 
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="search" className="text-sm">Search</label>
            <Input 
              id="search"
              placeholder="Search by invoice #, customer..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="from" className="text-sm">From Date</label>
            <DatePicker
              id="from"
              selected={filters.dateRange.from}
              onSelect={(date) => handleDateChange('from', date)}
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="to" className="text-sm">To Date</label>
            <DatePicker
              id="to" 
              selected={filters.dateRange.to}
              onSelect={(date) => handleDateChange('to', date)}
            />
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset
            </Button>
            <Button size="sm" onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
