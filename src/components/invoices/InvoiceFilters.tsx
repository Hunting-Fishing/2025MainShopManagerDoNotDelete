
import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Search, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface InvoiceFiltersProps {
  filters: {
    status: string;
    customer: string;
    dateRange: DateRange;
  };
  setFilters: (filters: any) => void;
  resetFilters: () => void;
}

export function InvoiceFilters({ filters, setFilters, resetFilters }: InvoiceFiltersProps) {
  const handleStatusChange = (value: string) => {
    setFilters({ ...filters, status: value });
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, customer: e.target.value });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setFilters({
      ...filters,
      dateRange: range || { from: null, to: null }
    });
  };

  return (
    <div className="bg-white border-slate-200 border p-4 rounded-md space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Filters</h3>
        <Button
          onClick={resetFilters}
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs"
        >
          <X className="h-3 w-3" /> Clear
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status filter */}
        <div>
          <label className="text-xs text-slate-500 mb-1.5 block">
            Status
          </label>
          <Select
            value={filters.status}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Customer search */}
        <div>
          <label className="text-xs text-slate-500 mb-1.5 block">
            Customer
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search customer"
              className="pl-9"
              value={filters.customer}
              onChange={handleCustomerChange}
            />
          </div>
        </div>

        {/* Date range */}
        <div>
          <label className="text-xs text-slate-500 mb-1.5 block">
            Date range
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.dateRange.from && !filters.dateRange.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "LLL dd, y")} - {format(filters.dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(filters.dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Select date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange.from || new Date()}
                selected={filters.dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
