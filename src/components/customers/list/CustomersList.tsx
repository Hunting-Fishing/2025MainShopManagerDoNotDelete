
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Customer } from "@/types/customer";
import { CustomerFilterControls, CustomerFilters } from "@/components/customers/filters/CustomerFilterControls";
import { CustomerTable } from "./CustomerTable";

interface CustomersListProps {
  customers: Customer[];
  filteredCustomers: Customer[];
  filters: CustomerFilters;
  loading: boolean;
  error: string | null;
  connectionOk?: boolean | null;
  onFilterChange: (filters: CustomerFilters) => void;
  onRefresh?: () => void;
}

export const CustomersList = ({ 
  customers = [],
  filteredCustomers = [],
  filters = {},
  loading = false,
  error = null,
  connectionOk = true,
  onFilterChange,
  onRefresh 
}: CustomersListProps) => {
  // Ensure arrays are never null
  const safeCustomers = customers || [];
  const safeFilteredCustomers = filteredCustomers || [];

  return (
    <Card className="border border-gray-200">
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <CustomerFilterControls 
            filters={filters}
            onFilterChange={onFilterChange}
            disabled={loading || !connectionOk}
          />
          
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={loading}
              className="ml-2 flex items-center gap-2 bg-white"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          )}
        </div>

        <div className="rounded-md border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <CustomerTable 
                customers={safeFilteredCustomers}
                loading={loading}
                error={error}
                connectionOk={connectionOk}
                onRefresh={onRefresh}
              />
            </TableBody>
          </Table>
        </div>
        
        {safeFilteredCustomers.length > 0 && safeCustomers.length !== safeFilteredCustomers.length && (
          <p className="text-sm text-gray-500 text-center pt-2">
            Showing {safeFilteredCustomers.length} of {safeCustomers.length} customers
          </p>
        )}
      </div>
    </Card>
  );
};
