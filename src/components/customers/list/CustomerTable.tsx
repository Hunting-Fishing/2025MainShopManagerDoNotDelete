
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
  console.log('CustomerTable - customers:', customers);
  console.log('CustomerTable - loading:', loading);
  console.log('CustomerTable - error:', error);
  
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
      {customers.map((customer) => {
        console.log('Rendering customer:', customer);
        
        return (
          <TableRow key={customer.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-2 rounded-full">
                  <UserRound className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <Link 
                    to={`/customers/${customer.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    {getCustomerFullName(customer)}
                  </Link>
                  {customer.company && (
                    <p className="text-xs text-slate-500 mt-1">{customer.company}</p>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm space-y-1">
                {customer.email && (
                  <p className="flex items-center gap-1">
                    📧 {customer.email}
                  </p>
                )}
                {customer.phone && (
                  <p className="flex items-center gap-1 text-slate-600">
                    📞 {customer.phone}
                  </p>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {customer.address && (
                  <p>{customer.address}</p>
                )}
                {(customer.city || customer.state) && (
                  <p className="text-slate-500">
                    {[customer.city, customer.state].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </TableCell>
            <TableCell>
              {customer.tags && customer.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {customer.tags.slice(0, 2).map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-xs bg-green-50 text-green-700 border-green-200"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {customer.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{customer.tags.length - 2}
                    </Badge>
                  )}
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
                  className="rounded-full"
                >
                  <Link to={`/customers/${customer.id}`}>
                    View Details
                  </Link>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
};
