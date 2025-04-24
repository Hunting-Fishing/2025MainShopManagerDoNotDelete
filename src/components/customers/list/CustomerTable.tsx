
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CustomerRow } from './CustomerRow';
import { Customer } from '@/types/customer';
import { RefreshCw } from 'lucide-react';

interface CustomerTableProps {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  connectionOk?: boolean | null;
  onRefresh?: () => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers = [],
  loading = false,
  error = null,
  connectionOk = true,
  onRefresh
}) => {
  // Display loading state
  if (loading) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="h-64 text-center">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-slate-600 font-medium">Loading customers...</p>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  // Display error state
  if (error || connectionOk === false) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="h-64 text-center">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-red-500 text-xl mb-4">❌</div>
            <p className="text-lg text-red-600 font-medium mb-4">
              {error || "Failed to connect to the database"}
            </p>
            {onRefresh && (
              <Button 
                onClick={onRefresh} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  }

  // Display empty state
  if (customers.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="h-64 text-center">
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-lg text-slate-600 font-medium mb-2">No customers found</p>
            <p className="text-muted-foreground">
              Try adjusting your filters or add a new customer.
            </p>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  // Display customers table
  return (
    <>
      {customers.map((customer) => (
        <CustomerRow key={customer.id} customer={customer} />
      ))}
    </>
  );
};
