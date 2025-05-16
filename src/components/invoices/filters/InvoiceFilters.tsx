
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InvoiceFilters as InvoiceFiltersType, InvoiceFiltersProps } from '@/types/invoice';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Checkbox } from '@/components/ui/checkbox';

export const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters
}) => {
  const handleStatusChange = (status: string) => {
    const currentStatuses = [...filters.status];
    const index = currentStatuses.indexOf(status);
    
    if (index === -1) {
      // Add the status
      currentStatuses.push(status);
    } else {
      // Remove the status
      currentStatuses.splice(index, 1);
    }
    
    onFilterChange('status', currentStatuses);
  };

  const handleCustomerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange('customerName', e.target.value);
  };

  const handleMinAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined;
    onFilterChange('minAmount', value);
  };

  const handleMaxAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined;
    onFilterChange('maxAmount', value);
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    onFilterChange('dateRange', range);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <Label className="mb-2 block">Status</Label>
            <div className="flex flex-wrap gap-2">
              {['draft', 'sent', 'paid', 'overdue', 'void', 'pending', 'cancelled'].map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`status-${status}`} 
                    checked={filters.status.includes(status)}
                    onCheckedChange={() => handleStatusChange(status)}
                  />
                  <label 
                    htmlFor={`status-${status}`}
                    className="text-sm capitalize cursor-pointer"
                  >
                    {status}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Date Range</Label>
            <DatePickerWithRange 
              date={{
                from: filters.dateRange.from,
                to: filters.dateRange.to
              }}
              setDate={handleDateRangeChange}
            />
          </div>

          <div>
            <Label htmlFor="customerName" className="mb-2 block">Customer Name</Label>
            <Input
              id="customerName"
              value={filters.customerName}
              onChange={handleCustomerNameChange}
              placeholder="Search by customer name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minAmount" className="mb-2 block">Min Amount</Label>
              <Input
                id="minAmount"
                type="number"
                value={filters.minAmount || ''}
                onChange={handleMinAmountChange}
                placeholder="Min"
              />
            </div>
            <div>
              <Label htmlFor="maxAmount" className="mb-2 block">Max Amount</Label>
              <Input
                id="maxAmount"
                type="number"
                value={filters.maxAmount || ''}
                onChange={handleMaxAmountChange}
                placeholder="Max"
              />
            </div>
          </div>

          <Button 
            onClick={onResetFilters} 
            variant="outline" 
            className="w-full"
          >
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
