import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Customer } from '@/types/customer';
import { WorkOrder } from '@/types/workOrder';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, ClipboardList, MoreVertical } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface CustomerWorkOrdersTabProps {
  customer: Customer;
  workOrders: WorkOrder[];
}

export function CustomerWorkOrdersTab({ 
  customer, 
  workOrders 
}: CustomerWorkOrdersTabProps) {
  const navigate = useNavigate();

  const handleCreateWorkOrder = () => {
    navigate(`/work-orders/new?customerId=${customer.id}`);
  };

  const handleViewWorkOrder = (workOrderId: string) => {
    navigate(`/work-orders/${workOrderId}`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, label: string }> = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'in_progress': { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
      'completed': { color: 'bg-green-100 text-green-800', label: 'Completed' },
      'cancelled': { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      'on_hold': { color: 'bg-purple-100 text-purple-800', label: 'On Hold' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Work Orders</h3>
        <Button onClick={handleCreateWorkOrder} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Work Order
        </Button>
      </div>

      <Card>
        {workOrders && workOrders.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Work Order #</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workOrders.map((workOrder) => (
                <TableRow key={workOrder.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <ClipboardList className="h-4 w-4 mr-2 text-muted-foreground" />
                      {workOrder.id}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(workOrder.createdAt)}</TableCell>
                  <TableCell>{workOrder.service_type || 'General'}</TableCell>
                  <TableCell>{getStatusBadge(workOrder.status)}</TableCell>
                  <TableCell>
                    {workOrder.vehicle_id ? (
                      `${workOrder.vehicle_make || ''} ${workOrder.vehicle_model || ''}`
                    ) : (
                      <span className="text-muted-foreground">No vehicle</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewWorkOrder(workOrder.id)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/work-orders/${workOrder.id}/edit`)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/invoices/new?workOrderId=${workOrder.id}`)}>
                          Create Invoice
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-12 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Work Orders</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              This customer doesn't have any work orders yet. Create one to start tracking their service history.
            </p>
            <Button onClick={handleCreateWorkOrder}>
              <Plus className="h-4 w-4 mr-2" />
              Create Work Order
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
