
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { WorkOrder } from '@/types/workOrder';
import { priorityMap, statusMap } from '@/utils/workOrderUtils';
import { formatDate } from '@/utils/workOrderUtils';

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
  isLoading?: boolean;
}

const WorkOrdersTable: React.FC<WorkOrdersTableProps> = ({ 
  workOrders,
  isLoading = false
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!workOrders || workOrders.length === 0) {
    return <div>No work orders found.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Vehicle</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Technician</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workOrders.map((workOrder) => (
          <TableRow key={workOrder.id} className="cursor-pointer hover:bg-gray-50">
            <TableCell onClick={() => navigate(`/work-orders/${workOrder.id}`)}>
              {workOrder.id.substring(0, 8)}
            </TableCell>
            <TableCell onClick={() => navigate(`/work-orders/${workOrder.id}`)}>
              {workOrder.customer || 'N/A'}
            </TableCell>
            <TableCell onClick={() => navigate(`/work-orders/${workOrder.id}`)}>
              {workOrder.vehicleMake && workOrder.vehicleModel 
                ? `${workOrder.vehicleMake} ${workOrder.vehicleModel}` 
                : 'N/A'}
            </TableCell>
            <TableCell onClick={() => navigate(`/work-orders/${workOrder.id}`)}>
              {formatDate(workOrder.created_at)}
            </TableCell>
            <TableCell onClick={() => navigate(`/work-orders/${workOrder.id}`)}>
              <Badge variant="outline" className={`
                ${workOrder.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' : ''}
                ${workOrder.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border-blue-300' : ''}
                ${workOrder.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-300' : ''}
                ${workOrder.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-300' : ''}
                ${workOrder.status === 'on-hold' ? 'bg-purple-100 text-purple-800 border-purple-300' : ''}
              `}>
                {statusMap[workOrder.status]}
              </Badge>
            </TableCell>
            <TableCell onClick={() => navigate(`/work-orders/${workOrder.id}`)}>
              {workOrder.priority && (
                <Badge variant="outline" className={priorityMap[workOrder.priority]?.classes || ''}>
                  {priorityMap[workOrder.priority]?.label || workOrder.priority}
                </Badge>
              )}
            </TableCell>
            <TableCell onClick={() => navigate(`/work-orders/${workOrder.id}`)}>
              {workOrder.technician || 'Unassigned'}
            </TableCell>
            <TableCell>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/work-orders/${workOrder.id}/edit`);
                }}
              >
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export { WorkOrdersTable };
export default WorkOrdersTable;
