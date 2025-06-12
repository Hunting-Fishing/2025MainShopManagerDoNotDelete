
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, User, Wrench } from 'lucide-react';
import { Customer } from '@/types/customer';
import { useWorkOrdersByCustomer } from '@/hooks/useWorkOrdersByCustomer';
import { formatDate } from '@/lib/formatters';

interface CustomerWorkOrdersTabProps {
  customer: Customer;
}

export function CustomerWorkOrdersTab({ customer }: CustomerWorkOrdersTabProps) {
  const navigate = useNavigate();
  const { workOrders, isLoading } = useWorkOrdersByCustomer(customer.id);

  const handleCreateWorkOrder = () => {
    // Pre-populate with customer information
    const params = new URLSearchParams({
      customerId: customer.id,
      customerName: `${customer.first_name} ${customer.last_name}`,
      customerEmail: customer.email || '',
      customerPhone: customer.phone || '',
      customerAddress: [
        customer.address,
        customer.city,
        customer.state,
        customer.zip_code
      ].filter(Boolean).join(', ')
    });

    // If customer has vehicles, add the first vehicle info
    if (customer.vehicles && customer.vehicles.length > 0) {
      const vehicle = customer.vehicles[0];
      params.append('vehicleMake', vehicle.make || '');
      params.append('vehicleModel', vehicle.model || '');
      params.append('vehicleYear', vehicle.year?.toString() || '');
      params.append('vehicleLicensePlate', vehicle.license_plate || '');
      params.append('vehicleVin', vehicle.vin || '');
    }

    navigate(`/work-orders/create?${params.toString()}`);
  };

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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Work Orders</h2>
          <Button 
            onClick={handleCreateWorkOrder}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Work Order
          </Button>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Work Orders</h2>
        <Button 
          onClick={handleCreateWorkOrder}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Work Order
        </Button>
      </div>

      {workOrders && workOrders.length > 0 ? (
        <div className="grid gap-4">
          {workOrders.map((workOrder) => (
            <Card 
              key={workOrder.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/work-orders/${workOrder.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {workOrder.title || `Work Order #${workOrder.id.slice(0, 8)}`}
                  </CardTitle>
                  <Badge className={getStatusColor(workOrder.status)}>
                    {workOrder.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {workOrder.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {workOrder.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(new Date(workOrder.created_at))}
                    </div>
                    
                    {workOrder.assigned_to && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {workOrder.assigned_to}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Wrench className="h-4 w-4" />
                      Priority: {workOrder.priority || 'Medium'}
                    </div>
                  </div>

                  {workOrder.total_cost && (
                    <div className="mt-2 text-right">
                      <span className="text-lg font-semibold text-green-600">
                        ${workOrder.total_cost.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Work Orders Found
            </h3>
            <p className="text-gray-500 mb-6">
              This customer doesn't have any work orders yet. Create one to get started.
            </p>
            <Button 
              onClick={handleCreateWorkOrder}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create First Work Order
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
