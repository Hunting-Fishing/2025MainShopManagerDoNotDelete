
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, User, Car, AlertTriangle } from "lucide-react";
import { Customer, getCustomerFullName } from "@/types/customer";
import { WorkOrder } from "@/types/workOrder";
import { formatDate } from "@/utils/dateUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CustomerWorkOrdersTabProps {
  customer: Customer;
  workOrders: WorkOrder[];
  loading?: boolean;
  error?: string;
}

export function CustomerWorkOrdersTab({ 
  customer, 
  workOrders, 
  loading = false, 
  error 
}: CustomerWorkOrdersTabProps) {
  const customerName = getCustomerFullName(customer);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'on-hold':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Work Orders</h3>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            New Work Order
          </Button>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading work orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Work Orders</h3>
          <Button asChild>
            <Link to={`/work-orders/new?customer=${encodeURIComponent(customerName)}&customerId=${customer.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              New Work Order
            </Link>
          </Button>
        </div>
        
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading work orders: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Work Orders</h3>
        <Button asChild>
          <Link to={`/work-orders/new?customer=${encodeURIComponent(customerName)}&customerId=${customer.id}`}>
            <Plus className="mr-2 h-4 w-4" />
            New Work Order
          </Link>
        </Button>
      </div>

      {workOrders && workOrders.length > 0 ? (
        <div className="grid gap-4">
          {workOrders.map((workOrder) => (
            <Card key={workOrder.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    <Link 
                      to={`/work-orders/${workOrder.id}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      Work Order #{workOrder.id.slice(0, 8)}
                    </Link>
                  </CardTitle>
                  <Badge className={getStatusColor(workOrder.status)}>
                    {workOrder.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {workOrder.description || 'No description provided'}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(workOrder.created_at)}</span>
                  </div>
                  
                  {workOrder.technician_id && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{workOrder.technician_id}</span>
                    </div>
                  )}
                  
                  {(workOrder.vehicle_make || workOrder.vehicle_model || workOrder.vehicle_year) && (
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {[workOrder.vehicle_year, workOrder.vehicle_make, workOrder.vehicle_model]
                          .filter(Boolean)
                          .join(' ')}
                      </span>
                    </div>
                  )}
                </div>

                {workOrder.total_cost && (
                  <div className="pt-2 border-t">
                    <span className="text-sm font-medium">
                      Total: ${workOrder.total_cost.toFixed(2)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">No work orders found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  This customer doesn't have any work orders yet.
                </p>
              </div>
              <Button asChild>
                <Link to={`/work-orders/new?customer=${encodeURIComponent(customerName)}&customerId=${customer.id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Work Order
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
