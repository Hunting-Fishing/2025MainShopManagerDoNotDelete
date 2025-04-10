
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";

export interface InvoiceFiltersProps {
  filters: {
    status: string;
    customer: string;
    dateRange: {
      from: Date | undefined;
      to: Date | undefined;
    };
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    status: string;
    customer: string;
    dateRange: {
      from: Date | undefined;
      to: Date | undefined;
    };
  }>>;
  onFilterChange: (newFilters: {
    status: string;
    customer: string;
    dateRange: {
      from: Date | undefined;
      to: Date | undefined;
    };
  }) => void;
  resetFilters: () => void;
}

export function InvoiceFilters({ filters, setFilters, onFilterChange, resetFilters }: InvoiceFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(filters.customer);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>(filters.dateRange);

  const applyFilters = () => {
    const updatedFilters = {
      ...filters,
      customer: searchTerm,
      dateRange
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleStatusChange = (status: string) => {
    const updatedFilters = {
      ...filters,
      status
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    const updatedFilters = {
      ...filters,
      customer: ""
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleDateSelect = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
    // Don't apply filters immediately on date select to allow selecting both from and to
  };

  const handleApplyDateRange = () => {
    applyFilters();
  };

  const hasAnyFilter = 
    filters.status !== "all" || 
    filters.customer !== "" || 
    filters.dateRange.from !== undefined;

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <button 
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </form>
      </div>

      <div className="flex flex-row gap-2">
        <Select
          value={filters.status}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[160px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "P")} - {format(dateRange.to, "P")}
                  </>
                ) : (
                  format(dateRange.from, "P")
                )
              ) : (
                "Date Range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleDateSelect}
              initialFocus
            />
            <div className="flex justify-end p-2 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleApplyDateRange}
              >
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {hasAnyFilter && (
          <Button variant="ghost" onClick={resetFilters}>
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
