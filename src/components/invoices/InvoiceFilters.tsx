
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, FilterX } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { InvoiceFiltersProps } from "@/types/invoice";

export function InvoiceFilters({ onApplyFilters, filters, setFilters, resetFilters }: InvoiceFiltersProps) {
  // If filters and setFilters aren't provided, create local state
  const [localFilters, setLocalFilters] = React.useState(filters || {
    status: "all",
    customer: "",
    dateRange: {
      from: null,
      to: null
    }
  });

  // Use either provided setFilters or local state
  const handleFiltersChange = (updatedFilters: any) => {
    if (setFilters) {
      setFilters(updatedFilters);
    } else {
      setLocalFilters(updatedFilters);
      onApplyFilters(updatedFilters);
    }
  };

  // Use either provided resetFilters or reset local state
  const handleResetFilters = () => {
    if (resetFilters) {
      resetFilters();
    } else {
      const defaultFilters = {
        status: "all",
        customer: "",
        dateRange: {
          from: null,
          to: null
        }
      };
      setLocalFilters(defaultFilters);
      onApplyFilters(defaultFilters);
    }
  };

  const activeFilters = filters || localFilters;
  
  const handleStatusChange = (value: string) => {
    handleFiltersChange({ ...activeFilters, status: value });
  };
  
  const handleCustomerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFiltersChange({ ...activeFilters, customer: event.target.value });
  };
  
  const handleDateRangeChange = (field: "from" | "to", value: Date | null) => {
    handleFiltersChange({
      ...activeFilters,
      dateRange: {
        ...activeFilters.dateRange,
        [field]: value
      }
    });
  };
  
  return (
    <div className="bg-white border rounded-lg p-4 mb-6 grid gap-4 md:grid-cols-4">
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={activeFilters.status} onValueChange={handleStatusChange}>
          <SelectTrigger id="status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="customer">Customer</Label>
        <Input
          id="customer"
          placeholder="Search by customer name"
          value={activeFilters.customer}
          onChange={handleCustomerChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Date Range</Label>
        <div className="flex space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !activeFilters.dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {activeFilters.dateRange.from ? (
                  format(activeFilters.dateRange.from, "PPP")
                ) : (
                  <span>Start date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={activeFilters.dateRange.from || undefined}
                onSelect={(date) => handleDateRangeChange("from", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !activeFilters.dateRange.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {activeFilters.dateRange.to ? (
                  format(activeFilters.dateRange.to, "PPP")
                ) : (
                  <span>End date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={activeFilters.dateRange.to || undefined}
                onSelect={(date) => handleDateRangeChange("to", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="flex items-end">
        <Button variant="outline" onClick={handleResetFilters} className="w-full">
          <FilterX className="mr-2 h-4 w-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
