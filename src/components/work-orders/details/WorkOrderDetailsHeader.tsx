
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, MapPin, Edit, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface WorkOrderDetailsHeaderProps {
  workOrder: WorkOrder;
}

export function WorkOrderDetailsHeader({ workOrder }: WorkOrderDetailsHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'default';
      case 'in-progress': return 'secondary';
      case 'on-hold': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority?: string) => {
    if (!priority) return 'outline';
    switch (priority.toLowerCase()) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant={getStatusColor(workOrder.status)} className="text-sm">
                {workOrder.status?.replace('-', ' ')}
              </Badge>
              {workOrder.priority && (
                <Badge variant={getPriorityColor(workOrder.priority)} className="text-sm">
                  {workOrder.priority} Priority
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {workOrder.customer && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Customer:</span>
                  <span>{workOrder.customer}</span>
                </div>
              )}

              {workOrder.technician && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Technician:</span>
                  <span>{workOrder.technician}</span>
                </div>
              )}

              {workOrder.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Location:</span>
                  <span>{workOrder.location}</span>
                </div>
              )}

              {workOrder.date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Created:</span>
                  <span>{new Date(workOrder.date).toLocaleDateString()}</span>
                </div>
              )}

              {workOrder.dueDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Due Date:</span>
                  <span>{new Date(workOrder.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {workOrder.description && (
              <div className="mt-4">
                <h4 className="font-medium text-sm mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{workOrder.description}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Print Work Order</DropdownMenuItem>
                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                <DropdownMenuItem>Send to Customer</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Delete Work Order</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
