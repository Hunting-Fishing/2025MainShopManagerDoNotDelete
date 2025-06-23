import React from "react";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, AlertTriangle } from "lucide-react";
import { WorkOrder } from "@/types/workOrder";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
}

// Helper function to get customer name with better error handling
const getCustomerDisplayName = (workOrder: WorkOrder): string => {
  // Debug logging to understand the data structure
  console.log('WorkOrder customer data:', {
    customer: workOrder.customer,
    customer_name: workOrder.customer_name,
    customer_id: workOrder.customer_id,
    workOrderId: workOrder.id
  });

  // Try direct customer_name field first
  if (workOrder.customer_name && typeof workOrder.customer_name === 'string' && workOrder.customer_name.trim()) {
    return workOrder.customer_name.trim();
  }
  
  // If customer is an object, extract name parts
  if (typeof workOrder.customer === 'object' && workOrder.customer) {
    const customer = workOrder.customer as any;
    
    // Try first_name + last_name combination
    if (customer.first_name || customer.last_name) {
      const firstName = customer.first_name?.trim() || '';
      const lastName = customer.last_name?.trim() || '';
      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      } else if (firstName) {
        return firstName;
      } else if (lastName) {
        return lastName;
      }
    }
    
    // Try name field
    if (customer.name && customer.name.trim()) {
      return customer.name.trim();
    }
  }
  
  // If customer is a string
  if (typeof workOrder.customer === 'string' && workOrder.customer.trim()) {
    return workOrder.customer.trim();
  }
  
  // User-friendly fallback
  return 'Customer Name Missing';
};

const WorkOrderRow: React.FC<{ workOrder: WorkOrder }> = ({ workOrder }) => {
  const validationIssues: string[] = [];

  if (!workOrder.id) {
    validationIssues.push("Work Order ID is missing.");
  }

  if (!workOrder.customer && !workOrder.customer_name) {
    validationIssues.push("Customer information is missing.");
  }

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

  return (
    <TableRow key={workOrder.id}>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <span>{workOrder.work_order_number || workOrder.id.slice(0, 8)}</span>
          {validationIssues.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertTriangle className="h-4 w-4 text-yellow-500 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-medium">Data Issues:</p>
                    <ul className="text-sm space-y-1">
                      {validationIssues.map((issue, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-yellow-500 mt-0.5">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
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
  );
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
              <WorkOrderRow key={workOrder.id} workOrder={workOrder} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
