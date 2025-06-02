
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Plus, AlertTriangle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Customer } from '@/types/customer';
import { WorkOrder } from '@/types/workOrder';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CustomerWorkOrdersTabProps {
  customer: Customer;
  workOrders: WorkOrder[];
  loading?: boolean;
  error?: string;
}

export const CustomerWorkOrdersTab: React.FC<CustomerWorkOrdersTabProps> = ({
  customer,
  workOrders,
  loading = false,
  error
}) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading work orders...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Work Orders</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Work Orders</CardTitle>
        <Button asChild>
          <Link to={`/work-orders/create?customerId=${customer.id}&customerName=${encodeURIComponent(`${customer.first_name} ${customer.last_name}`)}`}>
            <Plus className="mr-2 h-4 w-4" />
            Create Work Order
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {!workOrders || workOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No work orders found for this customer.</p>
            <Button asChild variant="outline">
              <Link to={`/work-orders/create?customerId=${customer.id}&customerName=${encodeURIComponent(`${customer.first_name} ${customer.last_name}`)}`}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Work Order
              </Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.map((workOrder) => (
                  <TableRow key={workOrder.id}>
                    <TableCell className="font-mono text-sm">
                      #{workOrder.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      {workOrder.description || 'No description'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(workOrder.status)}>
                        {workOrder.status || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {workOrder.vehicle_year && workOrder.vehicle_make && workOrder.vehicle_model
                        ? `${workOrder.vehicle_year} ${workOrder.vehicle_make} ${workOrder.vehicle_model}`
                        : 'No vehicle info'
                      }
                    </TableCell>
                    <TableCell>
                      {formatDate(workOrder.created_at)}
                    </TableCell>
                    <TableCell>
                      {workOrder.total_cost 
                        ? `$${workOrder.total_cost.toFixed(2)}` 
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/work-orders/${workOrder.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
