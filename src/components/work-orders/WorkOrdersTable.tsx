
import React from "react";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, AlertTriangle } from "lucide-react";
import { WorkOrder } from "@/types/workOrder";
import { 
  getCustomerName, 
  getVehicleInfo, 
  getTechnicianName, 
  getWorkOrderDate, 
  getStatusBadgeVariant,
  getPriorityBadgeVariant,
  validateWorkOrderData
} from "@/utils/workOrders/dataHelpers";

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
}

const WorkOrderRow: React.FC<{ workOrder: WorkOrder }> = ({ workOrder }) => {
  const validation = validateWorkOrderData(workOrder);
  const hasWarnings = validation.warnings.length > 0;
  
  return (
    <TableRow key={workOrder.id} className={hasWarnings ? "bg-yellow-50" : ""}>
      <TableCell className="font-mono text-sm">
        <div className="flex items-center gap-2">
          #{workOrder.id.slice(0, 8)}
          {hasWarnings && (
            <AlertTriangle 
              className="h-4 w-4 text-yellow-500" 
              title={`Warnings: ${validation.warnings.join(', ')}`}
            />
          )}
        </div>
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
        <Badge variant={getStatusBadgeVariant(workOrder.status)}>
          {workOrder.status || 'Unknown'}
        </Badge>
      </TableCell>
      
      <TableCell>
        {workOrder.priority && (
          <Badge variant={getPriorityBadgeVariant(workOrder.priority)}>
            {workOrder.priority}
          </Badge>
        )}
      </TableCell>
      
      <TableCell>
        {getTechnicianName(workOrder)}
      </TableCell>
      
      <TableCell>
        {getWorkOrderDate(workOrder)}
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
  );
};

export default function WorkOrdersTable({ workOrders }: WorkOrdersTableProps) {
  if (!workOrders || workOrders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No work orders found.</p>
      </div>
    );
  }

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
            <TableHead>Priority</TableHead>
            <TableHead>Technician</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.map((workOrder) => (
            <WorkOrderRow key={workOrder.id} workOrder={workOrder} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
