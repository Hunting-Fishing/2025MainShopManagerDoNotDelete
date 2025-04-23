
import { Link } from "react-router-dom";
import { TableCell, TableRow } from "@/components/ui/table";
import { UserRound, Loader2, AlertCircle, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Customer, getCustomerFullName } from "@/types/customer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CustomerTableProps {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  connectionOk?: boolean | null;
  onRefresh?: () => void;
}

export const CustomerTable = ({ customers, loading, error, connectionOk, onRefresh }: CustomerTableProps) => {
  if (connectionOk === false) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="text-center py-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-red-100 p-3 rounded-full">
              <WifiOff className="h-8 w-8 text-red-600" />
            </div>
            <div className="text-center">
              <p className="font-medium text-lg">Database Connection Error</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
                Unable to connect to the database. This could be due to network issues or server unavailability.
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={onRefresh}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }
  
  if (loading) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="text-center py-12">
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
        <TableCell colSpan={5} className="text-center py-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <p className="font-medium">Error loading customers</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={onRefresh}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
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
        <TableCell colSpan={5} className="text-center py-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <UserRound className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">No customers found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {connectionOk ? 
                  "There are no customers in the database yet." : 
                  "No customers available. Connection status unknown."}
              </p>
            </div>
            {connectionOk && 
              <Button asChild variant="outline">
                <Link to="/customers/create">Add Your First Customer</Link>
              </Button>
            }
          </div>
        </TableCell>
      </TableRow>
    );
  }
  
  return (
    <>
      {customers.map((customer) => (
        <TableRow key={customer.id} className="bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
          <TableCell>
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <UserRound className="h-4 w-4 text-blue-600" />
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
              {customer.email && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="truncate max-w-[150px]">{customer.email}</p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{customer.email}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {customer.phone && <p className="text-slate-500">{customer.phone}</p>}
            </div>
          </TableCell>
          <TableCell>
            {customer.address ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm truncate max-w-[150px]">{customer.address}</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {customer.address}
                      {customer.city && `, ${customer.city}`}
                      {customer.state && `, ${customer.state}`}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <span className="text-sm text-slate-400">No address</span>
            )}
          </TableCell>
          <TableCell>
            {customer.tags && customer.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {customer.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-300">
                    {tag}
                  </Badge>
                ))}
                {customer.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs bg-gray-100">
                    +{customer.tags.length - 3}
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
                className="border-blue-200 hover:border-blue-300 text-blue-600 hover:bg-blue-50"
                asChild
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
