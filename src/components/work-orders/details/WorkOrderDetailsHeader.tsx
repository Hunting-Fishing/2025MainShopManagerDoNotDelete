
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Calendar, User, MapPin, Clock } from 'lucide-react';
import { WorkOrder } from '@/types/workOrder';
import { statusMap, priorityMap } from '@/types/workOrder';

interface WorkOrderDetailsHeaderProps {
  workOrder: WorkOrder;
}

export function WorkOrderDetailsHeader({ workOrder }: WorkOrderDetailsHeaderProps) {
  const navigate = useNavigate();

  const handleEditClick = () => {
    navigate(`/work-orders/${workOrder.id}/edit`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="text-xl">Work Order Details</CardTitle>
            <Badge variant={workOrder.status === 'completed' ? 'default' : 'secondary'}>
              {statusMap[workOrder.status] || workOrder.status}
            </Badge>
            {workOrder.priority && (
              <Badge className={priorityMap[workOrder.priority]?.classes || 'bg-gray-100 text-gray-800'}>
                {priorityMap[workOrder.priority]?.label || workOrder.priority}
              </Badge>
            )}
          </div>
          <Button onClick={handleEditClick} size="sm" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Work Order
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-medium">{workOrder.customer || 'Not assigned'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Technician</p>
              <p className="font-medium">{workOrder.technician || 'Not assigned'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="font-medium">
                {workOrder.dueDate || workOrder.due_date 
                  ? new Date(workOrder.dueDate || workOrder.due_date!).toLocaleDateString()
                  : 'Not set'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{workOrder.location || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {workOrder.description && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{workOrder.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
