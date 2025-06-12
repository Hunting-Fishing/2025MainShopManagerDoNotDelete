
import React from 'react';
import { Customer } from '@/types/customer';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

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
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-muted-foreground">Loading customers...</span>
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
            <p className="font-medium">Error loading customers</p>
            <p className="text-sm mt-1">{error}</p>
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
            <p className="font-medium">No customers found</p>
            <p className="text-sm mt-1">Try adjusting your search criteria or add your first customer.</p>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {customers.map((customer) => (
        <TableRow key={customer.id} className="hover:bg-muted/50">
          <TableCell>
            <div className="space-y-1">
              <div className="font-medium">
                <Link 
                  to={`/customers/${customer.id}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  {customer.first_name} {customer.last_name}
                </Link>
              </div>
              {customer.company && (
                <div className="text-sm text-muted-foreground">
                  {customer.company}
                </div>
              )}
            </div>
          </TableCell>
          
          <TableCell>
            <div className="space-y-1">
              {customer.email && (
                <div className="flex items-center gap-1 text-sm">
                  <Mail className="h-3 w-3" />
                  <span>{customer.email}</span>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-1 text-sm">
                  <Phone className="h-3 w-3" />
                  <span>{customer.phone}</span>
                </div>
              )}
            </div>
          </TableCell>
          
          <TableCell>
            <div className="text-sm">
              {customer.address && (
                <div>{customer.address}</div>
              )}
              {(customer.city || customer.state) && (
                <div className="text-muted-foreground">
                  {customer.city}{customer.city && customer.state ? ', ' : ''}{customer.state} {customer.postal_code}
                </div>
              )}
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
                  +{customer.tags.length - 2} more
                </Badge>
              )}
            </div>
          </TableCell>
          
          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to={`/customers/${customer.id}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to={`/customers/${customer.id}/edit`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};
