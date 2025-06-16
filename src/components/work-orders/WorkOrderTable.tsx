
import React from "react";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";
import { WorkOrder } from "@/types/workOrder";
import { formatDate } from "@/utils/dateUtils";

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
}

export function WorkOrderTable({ workOrders }: WorkOrderTableProps) {
  console.log('WorkOrderTable rendering with:', workOrders?.length || 0, 'work orders');

  if (!workOrders || workOrders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No work orders found.</p>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getCustomerName = (workOrder: WorkOrder) => {
    if (workOrder.customer_name) return workOrder.customer_name;
    if (workOrder.customer) return workOrder.customer;
    return 'Unknown Customer';
  };

  const getVehicleInfo = (workOrder: WorkOrder) => {
    const parts = [];
    if (workOrder.vehicle_year) parts.push(workOrder.vehicle_year);
    if (workOrder.vehicle_make) parts.push(workOrder.vehicle_make);
    if (workOrder.vehicle_model) parts.push(workOrder.vehicle_model);
    
    if (parts.length > 0) {
      return parts.join(' ');
    }
    
    return 'No vehicle info';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Total</TableHead>
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
                <div className="font-medium">
                  {getCustomerName(workOrder)}
                </div>
              </TableCell>
              
              <TableCell>
                {getVehicleInfo(workOrder)}
              </TableCell>
              
              <TableCell>
                <div className="max-w-xs truncate" title={workOrder.description}>
                  {workOrder.description || 'No description'}
                </div>
              </TableCell>
              
              <TableCell>
                <Badge variant={getStatusVariant(workOrder.status)}>
                  {workOrder.status || 'Unknown'}
                </Badge>
              </TableCell>
              
              <TableCell>
                {workOrder.created_at ? formatDate(workOrder.created_at) : 'Unknown'}
              </TableCell>
              
              <TableCell>
                {workOrder.total_cost ? `$${workOrder.total_cost.toFixed(2)}` : 'N/A'}
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/work-orders/${workOrder.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/work-orders/${workOrder.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
