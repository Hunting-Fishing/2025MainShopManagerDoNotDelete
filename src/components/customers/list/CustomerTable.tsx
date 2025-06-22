
import React from 'react';
import { Link } from 'react-router-dom';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, User } from 'lucide-react';
import { Customer, getCustomerFullName } from '@/types/customer';

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
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading customers...</span>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  if (error) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="text-center py-8">
          <div className="text-red-600">
            Error loading customers: {error}
          </div>
        </TableCell>
      </TableRow>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="text-center py-8">
          <div className="text-muted-foreground">
            No customers found
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {customers.map((customer) => {
        const customerName = getCustomerFullName(customer);
        const displayAddress = customer.address ? 
          `${customer.address}${customer.city ? `, ${customer.city}` : ''}${customer.state ? `, ${customer.state}` : ''}` : 
          'No address provided';

        return (
          <TableRow key={customer.id} className="hover:bg-muted/50">
            <TableCell>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div>
                  <div className="font-medium">{customerName}</div>
                  {customer.company && (
                    <div className="text-sm text-muted-foreground">
                      {customer.company}
                    </div>
                  )}
                </div>
              </div>
            </TableCell>
            
            <TableCell>
              <div className="space-y-1">
                {customer.email && (
                  <div className="text-sm">{customer.email}</div>
                )}
                {customer.phone && (
                  <div className="text-sm text-muted-foreground">{customer.phone}</div>
                )}
              </div>
            </TableCell>
            
            <TableCell>
              <div className="text-sm text-muted-foreground max-w-xs truncate">
                {displayAddress}
              </div>
            </TableCell>
            
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {customer.tags && Array.isArray(customer.tags) && customer.tags.length > 0 ? (
                  customer.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No tags</span>
                )}
                {customer.tags && Array.isArray(customer.tags) && customer.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{customer.tags.length - 2}
                  </Badge>
                )}
              </div>
            </TableCell>
            
            <TableCell className="text-right">
              <div className="flex items-center justify-end space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                  className="h-8 w-8 p-0"
                >
                  <Link to={`/customers/${customer.id}`}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View customer</span>
                  </Link>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                  className="h-8 w-8 p-0"
                >
                  <Link to={`/customers/${customer.id}/edit`}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit customer</span>
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
