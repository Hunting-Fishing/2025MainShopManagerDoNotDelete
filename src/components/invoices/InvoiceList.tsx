import React, { useState } from 'react';
import { InvoiceListHeader } from './InvoiceListHeader';
import { InvoiceListTable } from './InvoiceListTable';
import { InvoiceListExportMenu } from './InvoiceListExportMenu';
import { InvoiceFilters } from './filters/InvoiceFilters';
import { InvoiceFilters as InvoiceFiltersType } from '@/types/invoice';
import { DateRange } from 'react-day-picker';

export const InvoiceList = () => {
  const [filters, setFilters] = useState<InvoiceFiltersType>({
    status: [],
    customerName: '',
    minAmount: undefined,
    maxAmount: undefined,
    dateRange: { from: null, to: null }
  });

  const handleFilterChange = (field: keyof InvoiceFiltersType, value: any) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [field]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: [],
      customerName: '',
      minAmount: undefined,
      maxAmount: undefined,
      dateRange: { from: null, to: null }
    });
  };
  
  // Placeholder for actual data
  const invoices = [];
  const isLoading = false;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <InvoiceListHeader />
        <InvoiceListExportMenu />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <InvoiceFilters 
            filters={filters} 
            onFilterChange={handleFilterChange}
            onResetFilters={resetFilters}
          />
        </div>
        <div className="lg:col-span-3">
          <InvoiceListTable 
            invoices={invoices}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
