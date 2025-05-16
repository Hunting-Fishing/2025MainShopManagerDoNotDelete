
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Search, FilterX } from 'lucide-react';

interface InvoiceFiltersProps {
  filters: {
    status: string;
    customer: string;
    dateRange: {
      from: Date | null;
      to: Date | null;
    };
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    status: string;
    customer: string;
    dateRange: {
      from: Date | null;
      to: Date | null;
    };
  }>>;
  resetFilters: () => void;
}

export function InvoiceFilters({ 
  filters, 
  setFilters, 
  resetFilters 
}: InvoiceFiltersProps) {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Status Filter */}
        <div className="w-full sm:w-auto">
          <Select 
            value={filters.status} 
            onValueChange={(value) => setFilters({...filters, status: value})}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="void">Void</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Customer Filter */}
        <div className="relative w-full sm:w-auto">
          <Input
            placeholder="Search by customer"
            value={filters.customer}
            onChange={(e) => setFilters({...filters, customer: e.target.value})}
            className="w-full sm:w-[250px] pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        {/* Date Range Filter */}
        <div className="w-full sm:w-auto">
          <DateRangePicker
            value={{
              from: filters.dateRange.from,
              to: filters.dateRange.to
            }}
            onChange={(range) => setFilters({
              ...filters,
              dateRange: {
                from: range.from,
                to: range.to
              }
            })}
          />
        </div>

        {/* Reset Filters Button */}
        <div className="w-full sm:w-auto ml-auto">
          <Button 
            variant="outline" 
            onClick={resetFilters}
            className="w-full sm:w-auto"
          >
            <FilterX className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
