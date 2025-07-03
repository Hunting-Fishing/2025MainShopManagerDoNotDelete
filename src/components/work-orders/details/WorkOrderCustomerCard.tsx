
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
    <Card className="work-order-card">
      <CardHeader className="pb-4">
        <CardTitle className="section-title flex items-center gap-2">
          <User className="h-5 w-5 text-work-order-accent" />
          Customer Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="font-semibold text-lg text-foreground">
            {customer.first_name} {customer.last_name}
          </p>
          {customer.company && (
            <p className="text-sm font-medium text-muted-foreground">{customer.company}</p>
          )}
        </div>
        
        <div className="space-y-3">
          {customer.email && (
            <div className="flex items-center gap-3 p-2 rounded-md bg-muted/30">
              <Mail className="h-4 w-4 text-work-order-accent flex-shrink-0" />
              <span className="text-sm font-medium">{customer.email}</span>
            </div>
          )}
          
          {customer.phone && (
            <div className="flex items-center gap-3 p-2 rounded-md bg-muted/30">
              <Phone className="h-4 w-4 text-work-order-accent flex-shrink-0" />
              <span className="text-sm font-medium">{customer.phone}</span>
            </div>
          )}
          
          {customer.address && (
            <div className="flex items-start gap-3 p-2 rounded-md bg-muted/30">
              <MapPin className="h-4 w-4 text-work-order-accent flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium leading-relaxed">
                {customer.address}
                {customer.city && `, ${customer.city}`}
                {customer.state && `, ${customer.state}`}
                {customer.postal_code && ` ${customer.postal_code}`}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
