
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Car, MapPin } from 'lucide-react';

interface WorkOrderDetailsHeaderProps {
  workOrder: WorkOrder;
  customer?: Customer | null;
}

export function WorkOrderDetailsHeader({ workOrder, customer }: WorkOrderDetailsHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'on-hold':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold">Work Order Overview</h1>
              <Badge className={getStatusColor(workOrder.status)}>
                {workOrder.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium">
                  {customer ? `${customer.first_name} ${customer.last_name}` : workOrder.customer_name || 'Unknown'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">
                  {new Date(workOrder.created_at).toLocaleDateString()}
                </span>
              </div>
              
              {(workOrder.vehicle_make || workOrder.vehicle_model || workOrder.vehicle_year) && (
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Vehicle:</span>
                  <span className="font-medium">
                    {[workOrder.vehicle_year, workOrder.vehicle_make, workOrder.vehicle_model]
                      .filter(Boolean)
                      .join(' ')}
                  </span>
                </div>
              )}
              
              {workOrder.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{workOrder.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {workOrder.description && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-muted-foreground mb-1">Description:</p>
            <p className="text-sm">{workOrder.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
