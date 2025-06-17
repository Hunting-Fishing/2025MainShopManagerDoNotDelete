
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Phone, Mail, MapPin } from 'lucide-react';

interface WorkOrderCustomerCardProps {
  customer: Customer | null;
  workOrder: WorkOrder;
}

export function WorkOrderCustomerCard({ customer, workOrder }: WorkOrderCustomerCardProps) {
  if (!customer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No customer information available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Customer Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="font-medium">{customer.first_name} {customer.last_name}</p>
          {customer.company && (
            <p className="text-sm text-muted-foreground">{customer.company}</p>
          )}
        </div>
        
        {customer.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3 w-3" />
            <span>{customer.email}</span>
          </div>
        )}
        
        {customer.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3 w-3" />
            <span>{customer.phone}</span>
          </div>
        )}
        
        {customer.address && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-3 w-3" />
            <span>
              {customer.address}
              {customer.city && `, ${customer.city}`}
              {customer.state && `, ${customer.state}`}
              {customer.postal_code && ` ${customer.postal_code}`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
