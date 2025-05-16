
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { 
  InvoiceFiltersProps, 
  InvoiceFilters as InvoiceFiltersType,
  InvoiceStatus 
} from "@/types/invoice";

export function InvoiceFilters({ 
  filters, 
  onFilterChange, 
  onResetFilters,
  setFilters,
  resetFilters
}: InvoiceFiltersProps) {
  const handleStatusChange = (value: string) => {
    // Convert status to array if it's a string
    let newStatus: string[] = [];
    
    if (Array.isArray(filters.status)) {
      // If status is already an array
      if (filters.status.includes(value)) {
        // Remove if already selected
        newStatus = filters.status.filter(s => s !== value);
      } else {
        // Add if not selected
        newStatus = [...filters.status, value];
      }
    } else {
      // If status is a string
      newStatus = filters.status === value ? [] : [value];
    }
    
    onFilterChange("status", newStatus);
  };
  
  const handleDateRangeChange = (range: DateRange | undefined) => {
    onFilterChange("dateRange", range || { from: null, to: null });
  };
  
  const handleInputChange = (field: keyof InvoiceFiltersType, value: string) => {
    if (field === "minAmount" || field === "maxAmount") {
      // Convert to number or undefined
      const numValue = value ? Number(value) : undefined;
      onFilterChange(field, numValue);
    } else {
      onFilterChange(field, value);
    }
  };
  
  // Use the appropriate callback based on what's available
  const handleReset = () => {
    if (resetFilters) {
      resetFilters();
    } else if (onResetFilters) {
      onResetFilters();
    }
  };
  
  const handleSetFilters = (newFilters: InvoiceFiltersType) => {
    if (setFilters) {
      setFilters(newFilters);
    } else {
      // Manually update each filter field
      Object.keys(newFilters).forEach((key) => {
        const typedKey = key as keyof InvoiceFiltersType;
        onFilterChange(typedKey, newFilters[typedKey]);
      });
    }
  };
  
  // Status options for invoices
  const statusOptions: InvoiceStatus[] = [
    'draft',
    'pending',
    'paid',
    'overdue',
    'cancelled',
    'void',
    'sent'
  ];
  
  // Get status label and style
  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'draft':
        return { label: 'Draft', classes: 'bg-slate-100 text-slate-800 border-slate-300' };
      case 'pending':
        return { label: 'Pending', classes: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'paid':
        return { label: 'Paid', classes: 'bg-green-100 text-green-800 border-green-300' };
      case 'overdue':
        return { label: 'Overdue', classes: 'bg-red-100 text-red-800 border-red-300' };
      case 'cancelled':
        return { label: 'Cancelled', classes: 'bg-slate-100 text-slate-800 border-slate-300' };
      case 'void':
        return { label: 'Void', classes: 'bg-slate-100 text-slate-800 border-slate-300' };
      case 'sent':
        return { label: 'Sent', classes: 'bg-blue-100 text-blue-800 border-blue-300' };
      default:
        return { label: status, classes: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };
  
  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      (Array.isArray(filters.status) && filters.status.length > 0) ||
      (typeof filters.status === 'string' && filters.status !== '') ||
      filters.customerName ||
      filters.customer ||
      filters.minAmount !== undefined ||
      filters.maxAmount !== undefined ||
      filters.dateRange?.from ||
      filters.dateRange?.to
    );
  };

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Customer filter */}
        <div className="space-y-2">
          <Label htmlFor="customerName">Customer Name</Label>
          <Input
            id="customerName"
            placeholder="Filter by customer"
            value={filters.customerName}
            onChange={(e) => handleInputChange("customerName", e.target.value)}
          />
        </div>
        
        {/* Date range filter */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <div className="flex gap-2">
            <DatePicker
              date={filters.dateRange?.from}
              onSelect={(date) => handleDateRangeChange({
                from: date,
                to: filters.dateRange?.to
              })}
              placeholder="From"
            />
            <DatePicker
              date={filters.dateRange?.to}
              onSelect={(date) => handleDateRangeChange({
                from: filters.dateRange?.from,
                to: date
              })}
              placeholder="To"
            />
          </div>
        </div>
        
        {/* Amount range filter */}
        <div className="space-y-2">
          <Label>Amount Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Min"
              type="number"
              value={filters.minAmount ?? ""}
              onChange={(e) => handleInputChange("minAmount", e.target.value)}
            />
            <Input
              placeholder="Max"
              type="number"
              value={filters.maxAmount ?? ""}
              onChange={(e) => handleInputChange("maxAmount", e.target.value)}
            />
          </div>
        </div>
        
        {/* Reset button */}
        <div className="flex items-end">
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={!hasActiveFilters()}
            className="w-full"
          >
            Reset Filters
          </Button>
        </div>
      </div>
      
      {/* Status filters as toggleable badges */}
      <div className="space-y-2">
        <Label>Status</Label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => {
            const { label, classes } = getStatusDetails(status);
            const isSelected = Array.isArray(filters.status) 
              ? filters.status.includes(status)
              : filters.status === status;
            
            return (
              <Button
                key={status}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className={isSelected ? classes : ""}
                onClick={() => handleStatusChange(status)}
              >
                {label}
              </Button>
            );
          })}
        </div>
      </div>
      
      {/* Active filters summary */}
      {hasActiveFilters() && (
        <div className="pt-2">
          <Label>Active Filters:</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {Array.isArray(filters.status) && filters.status.map((status) => {
              const { label, classes } = getStatusDetails(status);
              return (
                <Badge key={status} variant="outline" className={classes}>
                  Status: {label}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-2 -mr-1"
                    onClick={() => handleStatusChange(status)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })}
            
            {filters.customerName && (
              <Badge variant="outline">
                Customer: {filters.customerName}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-2 -mr-1"
                  onClick={() => handleInputChange("customerName", "")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {filters.minAmount !== undefined && (
              <Badge variant="outline">
                Min: ${filters.minAmount}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-2 -mr-1"
                  onClick={() => handleInputChange("minAmount", "")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {filters.maxAmount !== undefined && (
              <Badge variant="outline">
                Max: ${filters.maxAmount}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-2 -mr-1"
                  onClick={() => handleInputChange("maxAmount", "")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
