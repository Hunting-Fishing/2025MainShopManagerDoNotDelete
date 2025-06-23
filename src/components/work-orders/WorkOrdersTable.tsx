
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

function getCustomerDisplayName(workOrder: WorkOrder): string {
  console.log('Getting customer display name for work order:', workOrder.id, {
    customer_first_name: workOrder.customer_first_name,
    customer_last_name: workOrder.customer_last_name,
    customer_name: workOrder.customer_name,
    customer: workOrder.customer
  });

  // Try first_name + last_name first
  if (workOrder.customer_first_name || workOrder.customer_last_name) {
    const fullName = `${workOrder.customer_first_name || ''} ${workOrder.customer_last_name || ''}`.trim();
    if (fullName) return fullName;
  }

  // Fallback to customer_name
  if (workOrder.customer_name) {
    return workOrder.customer_name;
  }

  // Fallback to customer (legacy field)
  if (workOrder.customer) {
    return typeof workOrder.customer === 'string' ? workOrder.customer : 'Unknown Customer';
  }

  return 'Customer Name Missing';
}

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