
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
  onFilterChange: (filters: CustomerFilters) => void;
  onRefresh?: () => void;
}

export const CustomersList = ({ 
  customers,
  filteredCustomers,
  filters,
  loading,
  error,
  onFilterChange,
  onRefresh 
}: CustomersListProps) => {
  return (
    <Card>
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <CustomerFilterControls 
            filters={filters}
            onFilterChange={onFilterChange}
          />
          
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={loading}
              className="ml-2"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          )}
        </div>

        <div className="rounded-md border">
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
                customers={filteredCustomers}
                loading={loading}
                error={error}
              />
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
};
