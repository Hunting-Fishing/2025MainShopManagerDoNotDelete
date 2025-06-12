
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
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
}

export const CustomersList = ({ 
  customers,
  filteredCustomers,
  filters,
  loading,
  error,
  onFilterChange 
}: CustomersListProps) => {
  console.log('CustomersList - customers:', customers);
  console.log('CustomersList - filteredCustomers:', filteredCustomers);
  console.log('CustomersList - loading:', loading);
  console.log('CustomersList - error:', error);
  
  if (loading) {
    return (
      <Card>
        <div className="p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading customers...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="p-6">
          <div className="text-center py-8">
            <p className="text-red-600">Error: {error}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6 space-y-4">
        <CustomerFilterControls 
          filters={filters}
          onFilterChange={onFilterChange}
        />

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
                loading={false}
                error={null}
              />
            </TableBody>
          </Table>
        </div>
        
        {/* Show customer count */}
        <div className="text-sm text-muted-foreground">
          {filteredCustomers && filteredCustomers.length > 0 && (
            <p>
              Showing {filteredCustomers.length} of {customers?.length || 0} customers
            </p>
          )}
          {(!filteredCustomers || filteredCustomers.length === 0) && (
            <p>No customers to display</p>
          )}
        </div>
      </div>
    </Card>
  );
};
