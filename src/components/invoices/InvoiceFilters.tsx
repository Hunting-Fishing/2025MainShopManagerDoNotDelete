
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface InvoiceFiltersProps {
  filters: {
    status: string;
    customer: string;
    dateRange: {
      from: Date | null;
      to: Date | null;
    };
  };
  setFilters: (filters: any) => void;
  resetFilters: () => void;
  onFilterChange?: (newFilters: {
    status: string;
    customer: string;
    dateRange: { from: any; to: any };
  }) => void;
}

export const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({ 
  filters, 
  setFilters, 
  resetFilters,
  onFilterChange
}) => {
  // Handler for status change
  const handleStatusChange = (value: string) => {
    const newFilters = { ...filters, status: value };
    setFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };

  // Handler for customer search
  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, customer: e.target.value };
    setFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };

  // Handler for reset
  const handleReset = () => {
    resetFilters();
    if (onFilterChange) {
      onFilterChange({
        status: '',
        customer: '',
        dateRange: { from: null, to: null }
      });
    }
  };

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4 pb-4">
      <div className="relative w-full md:w-64">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search customer..."
          value={filters.customer}
          onChange={handleCustomerChange}
          className="pl-9"
        />
      </div>
      
      <Select value={filters.status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-full md:w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Statuses</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
      
      <Button variant="ghost" onClick={handleReset} className="h-9 px-2 lg:px-3">
        <X className="h-4 w-4 mr-2" />
        Reset
      </Button>
    </div>
  );
};

export default InvoiceFilters;
