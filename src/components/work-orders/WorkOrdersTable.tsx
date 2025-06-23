
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
}

// Helper function to get customer display name
const getCustomerDisplayName = (workOrder: WorkOrder): string => {
  console.log('Processing work order customer data:', {
    workOrderId: workOrder.id,
    customer_name: workOrder.customer_name,
    customer_first_name: workOrder.customer_first_name,
    customer_last_name: workOrder.customer_last_name,
    customer: workOrder.customer,
    customer_id: workOrder.customer_id
  });

  // Try customer_name field first
  if (workOrder.customer_name && typeof workOrder.customer_name === 'string') {
    return workOrder.customer_name;
  }

  // Try first_name + last_name combination
  if (workOrder.customer_first_name || workOrder.customer_last_name) {
    const firstName = workOrder.customer_first_name || '';
    const lastName = workOrder.customer_last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) {
      return fullName;
    }
  }

  // Try customer field if it's a string
  if (workOrder.customer && typeof workOrder.customer === 'string') {
    return workOrder.customer;
  }

  // Try customer field if it's an object with name properties
  if (workOrder.customer && typeof workOrder.customer === 'object') {
    const customerObj = workOrder.customer as any;
    if (customerObj.first_name || customerObj.last_name) {
      const firstName = customerObj.first_name || '';
      const lastName = customerObj.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) {
        return fullName;
      }
    }
    if (customerObj.name) {
      return customerObj.name;
    }
  }

  return 'Customer Name Missing';
};

export function WorkOrdersTable({ workOrders }: WorkOrdersTableProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'in-progress':
        return 'bg-blue-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-black';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (workOrders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No work orders found</h3>
            <p className="text-gray-500 mb-6">
              Get started by creating your first work order.
            </p>
            <Button asChild>
              <Link to="/work-orders/create">
                Create Work Order
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Work Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workOrders.map((workOrder) => (
              <TableRow key={workOrder.id}>
                <TableCell className="font-medium">
                  {workOrder.work_order_number || workOrder.id.slice(0, 8)}
                </TableCell>
                <TableCell>
                  {getCustomerDisplayName(workOrder)}
                </TableCell>
                <TableCell>
                  {workOrder.description || 'No description'}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(workOrder.status)}>
                    {workOrder.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {workOrder.created_at ? new Date(workOrder.created_at).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/work-orders/${workOrder.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Named export (this is what we're using)
export default WorkOrdersTable;
