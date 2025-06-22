
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Customer } from '@/types/customer';

interface CustomerTableProps {
  customers: Customer[];
  loading: boolean;
  error: string | null;
}

export function CustomerTable({ customers, loading, error }: CustomerTableProps) {
  console.log('CustomerTable - customers:', customers);
  console.log('CustomerTable - loading:', loading);
  console.log('CustomerTable - error:', error);

  if (loading) {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <TableRow key={i}>
            <TableCell>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </TableCell>
            <TableCell>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-28 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </TableCell>
            <TableCell>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-40"></div>
              </div>
            </TableCell>
            <TableCell>
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </TableCell>
            <TableCell>
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </>
    );
  }

  if (error) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="text-center py-8">
          <p className="text-red-600">Error loading customers: {error}</p>
        </TableCell>
      </TableRow>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="text-center py-8">
          <p className="text-muted-foreground">No customers found</p>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {customers.map((customer) => (
        <TableRow key={customer.id}>
          <TableCell>
            <div>
              <div className="font-medium">
                {customer.first_name} {customer.last_name}
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
                <div className="flex items-center text-sm">
                  <Mail className="h-3 w-3 mr-1" />
                  <a 
                    href={`mailto:${customer.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {customer.email}
                  </a>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="h-3 w-3 mr-1" />
                  <a 
                    href={`tel:${customer.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {customer.phone}
                  </a>
                </div>
              )}
            </div>
          </TableCell>
          <TableCell>
            <div className="text-sm">
              {customer.address && (
                <div>{customer.address}</div>
              )}
              {(customer.city || customer.state || customer.postal_code) && (
                <div className="text-muted-foreground">
                  {[customer.city, customer.state, customer.postal_code]
                    .filter(Boolean)
                    .join(', ')
                  }
                </div>
              )}
            </div>
          </TableCell>
          <TableCell>
            <div className="flex flex-wrap gap-1">
              {customer.tags && Array.isArray(customer.tags) && customer.tags.length > 0 ? (
                customer.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">No tags</span>
              )}
              {customer.tags && Array.isArray(customer.tags) && customer.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{customer.tags.length - 3}
                </Badge>
              )}
            </div>
          </TableCell>
          <TableCell className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <Link to={`/customers/${customer.id}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
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
}
