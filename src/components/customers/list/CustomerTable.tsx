
import { Link } from "react-router-dom";
import { TableCell, TableRow } from "@/components/ui/table";
import { UserRound, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Customer, getCustomerFullName } from "@/types/customer";

interface CustomerTableProps {
  customers: Customer[];
  loading: boolean;
  error: string | null;
}

export const CustomerTable = ({ customers, loading, error }: CustomerTableProps) => {
  if (loading) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="text-center py-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading customers...</p>
          </div>
        </TableCell>
      </TableRow>
    );
  }
  
  if (error) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="text-center py-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div>
              <p className="font-medium">Error loading customers</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }
  
  if (!customers || customers.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
          No customers found.
        </TableCell>
      </TableRow>
    );
  }
  
  return (
    <>
      {customers.map((customer) => (
        <TableRow key={customer.id}>
          <TableCell>
            <div className="flex items-center gap-2">
              <div className="bg-slate-100 p-2 rounded-full">
                <UserRound className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <Link 
                  to={`/customers/${customer.id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {getCustomerFullName(customer)}
                </Link>
                {customer.company && (
                  <p className="text-xs text-slate-500">{customer.company}</p>
                )}
              </div>
            </div>
          </TableCell>
          <TableCell>
            <div className="text-sm">
              <p>{customer.email}</p>
              <p className="text-slate-500">{customer.phone}</p>
            </div>
          </TableCell>
          <TableCell>
            <p className="text-sm">{customer.address}</p>
          </TableCell>
          <TableCell>
            {customer.tags && customer.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {customer.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-green-100 text-green-800 border border-green-300">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-sm text-slate-400">No tags</span>
            )}
          </TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                asChild
                className="rounded-full text-sm px-4 border-blue-500 text-blue-600"
              >
                <Link to={`/customers/${customer.id}`}>
                  View Details
                </Link>
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};
