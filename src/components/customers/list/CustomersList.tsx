
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Customer } from "@/types/customer";
import { CustomerFilters, CustomerFilterControls } from "@/components/customers/filters/CustomerFilterControls";
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
