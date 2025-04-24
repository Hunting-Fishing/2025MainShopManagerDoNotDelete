
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Customer, getCustomerFullName } from '@/types/customer';
import { Phone, Mail, MapPin } from 'lucide-react';
import { CustomerTags } from './CustomerTags';

interface CustomerRowProps {
  customer: Customer;
}

export const CustomerRow: React.FC<CustomerRowProps> = ({ customer }) => {
  // Guard against missing customer data
  if (!customer) return null;
  
  const customerName = getCustomerFullName(customer);
  
  return (
    <TableRow key={customer.id}>
      <TableCell>
        <div className="font-medium">{customerName}</div>
        {customer.company && (
          <div className="text-sm text-muted-foreground">{customer.company}</div>
        )}
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          {customer.email && (
            <div className="flex items-center text-sm">
              <Mail className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <span>{customer.email}</span>
            </div>
          )}
          {customer.phone && (
            <div className="flex items-center text-sm">
              <Phone className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <span>{customer.phone}</span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        {customer.address && (
          <div className="flex items-start text-sm">
            <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground mt-0.5" />
            <div>
              <div>{customer.address}</div>
              {customer.city && customer.state && (
                <div>
                  {customer.city}, {customer.state} {customer.postal_code}
                </div>
              )}
            </div>
          </div>
        )}
      </TableCell>
      <TableCell>
        {customer.tags && <CustomerTags tags={customer.tags} />}
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" asChild>
          {/* Update the link to use /customers/customerId pattern instead of /customers/id */}
          <Link to={`/customers/${customer.id}`}>View</Link>
        </Button>
      </TableCell>
    </TableRow>
  );
};
