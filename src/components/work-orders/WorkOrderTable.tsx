
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WorkOrder } from '@/types/workOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Clock, User, Calendar } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';
import { toast } from 'sonner';

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
}

export function WorkOrderTable({ workOrders }: WorkOrderTableProps) {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'on-hold':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewWorkOrder = (workOrderId: string) => {
    try {
      console.log('Navigating to work order details:', workOrderId);
      navigate(`/work-orders/${workOrderId}`);
    } catch (error) {
      console.error('Error navigating to work order details:', error);
      toast.error('Failed to open work order details');
    }
  };

  const handleEditWorkOrder = (workOrderId: string) => {
    try {
      console.log('Navigating to work order edit:', workOrderId);
      navigate(`/work-orders/${workOrderId}/edit`);
    } catch (error) {
      console.error('Error navigating to work order edit:', error);
      toast.error('Failed to open work order editor');
    }
  };

  if (!workOrders || workOrders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Work Orders Found</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No work orders are currently available.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {workOrders.map((workOrder) => (
        <Card key={workOrder.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <CardTitle className="text-lg">
                  {workOrder.description || `Work Order ${workOrder.id.slice(0, 8)}`}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {workOrder.customer_name && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{workOrder.customer_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(workOrder.created_at)}</span>
                  </div>
                  {workOrder.estimated_hours && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{workOrder.estimated_hours}h estimated</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(workOrder.status)}>
                  {workOrder.status.replace('-', ' ')}
                </Badge>
                {workOrder.priority && (
                  <Badge variant="outline" className={getPriorityColor(workOrder.priority)}>
                    {workOrder.priority}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {workOrder.service_type && (
                  <span className="font-medium">Service: {workOrder.service_type}</span>
                )}
                {workOrder.total_cost && (
                  <span className="ml-4">Cost: ${workOrder.total_cost}</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewWorkOrder(workOrder.id)}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditWorkOrder(workOrder.id)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
