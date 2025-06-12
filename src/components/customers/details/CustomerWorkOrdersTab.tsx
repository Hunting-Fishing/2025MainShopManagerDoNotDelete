
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Wrench, Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Customer } from '@/types/customer';
import { WorkOrder } from '@/types/workOrder';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface CustomerWorkOrdersTabProps {
  customer: Customer;
  workOrders?: WorkOrder[];
  loading?: boolean;
  error?: string;
}

export const CustomerWorkOrdersTab: React.FC<CustomerWorkOrdersTabProps> = ({ 
  customer, 
  workOrders = [], 
  loading = false, 
  error 
}) => {
  const navigate = useNavigate();

  const handleCreateWorkOrder = () => {
    // Navigate to the main work orders page with customer pre-population
    const params = new URLSearchParams({
      customerId: customer.id,
      customerName: `${customer.first_name} ${customer.last_name}`,
      customerEmail: customer.email || '',
      customerPhone: customer.phone || '',
      customerAddress: customer.address || '',
    });

    // Navigate to the existing work orders page instead of the separate create page
    navigate(`/work-orders?${params.toString()}&action=create`);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Work Orders</h3>
            <p className="text-sm text-muted-foreground">
              Manage service requests and maintenance for this customer
            </p>
          </div>
          <Button onClick={handleCreateWorkOrder} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Work Order
          </Button>
        </div>
        
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading work orders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Work Orders</h3>
            <p className="text-sm text-muted-foreground">
              Manage service requests and maintenance for this customer
            </p>
          </div>
          <Button onClick={handleCreateWorkOrder} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Work Order
          </Button>
        </div>
        
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Work Orders Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Work Orders</h3>
          <p className="text-sm text-muted-foreground">
            Manage service requests and maintenance for this customer
          </p>
        </div>
        <Button onClick={handleCreateWorkOrder} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {workOrders.length === 0 ? 'Create First Work Order' : 'Create Work Order'}
        </Button>
      </div>

      {/* Work Orders List or Empty State */}
      {workOrders.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-full">
              <Wrench className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">No work orders yet</h4>
              <p className="text-sm text-gray-500 mt-1">
                Create the first work order for {customer.first_name} {customer.last_name} to get started
              </p>
            </div>
            <Button onClick={handleCreateWorkOrder} variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Work Order
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {workOrders.map((workOrder) => (
            <Card key={workOrder.id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/work-orders/${workOrder.id}`)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Work Order #{workOrder.work_order_number || workOrder.id.slice(0, 8)}
                  </CardTitle>
                  <Badge className={getStatusBadgeColor(workOrder.status)}>
                    {workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-2">{workOrder.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Created {formatDistanceToNow(new Date(workOrder.created_at), { addSuffix: true })}
                  </span>
                  {workOrder.total_cost && (
                    <span className="font-medium">${workOrder.total_cost.toFixed(2)}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
