
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { priorityMap } from '@/utils/workOrders';
import { Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/workOrders';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

interface WorkOrderCardViewProps {
  workOrders: WorkOrder[];
  selectedWorkOrders: WorkOrder[];
  onSelectWorkOrder: (workOrder: WorkOrder, isSelected: boolean) => void;
}

export const WorkOrderCardView: React.FC<WorkOrderCardViewProps> = ({
  workOrders,
  selectedWorkOrders,
  onSelectWorkOrder
}) => {
  const navigate = useNavigate();

  const getStatusClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 border border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  const isSelected = (workOrder: WorkOrder) => {
    return selectedWorkOrders.some(selected => selected.id === workOrder.id);
  };

  const handleViewWorkOrder = (id: string) => {
    navigate(`/work-orders/${id}`);
  };

  if (workOrders.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 border rounded-md">
        <p className="text-gray-500">No work orders found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {workOrders.map((workOrder) => (
        <Card 
          key={workOrder.id} 
          className={cn(
            "relative overflow-hidden border-l-4",
            isSelected(workOrder) ? "bg-indigo-50 border-l-indigo-500" : "border-l-gray-300"
          )}
        >
          <CardContent className="p-0">
            {/* Header with Status & Priority */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={isSelected(workOrder)}
                  onCheckedChange={(checked) => onSelectWorkOrder(workOrder, !!checked)}
                  className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                />
                <div>
                  <p className="font-semibold text-gray-900">#{workOrder.id}</p>
                  <p className="text-sm text-gray-500">{workOrder.customer}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusClass(workOrder.status)}>
                  {workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1).replace("-", " ")}
                </Badge>
                <Badge className={priorityMap[workOrder.priority as keyof typeof priorityMap]?.classes || ""}>
                  {priorityMap[workOrder.priority as keyof typeof priorityMap]?.label || workOrder.priority}
                </Badge>
              </div>
            </div>
            
            {/* Body */}
            <div className="p-4">
              <div className="mb-2">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                <p className="text-sm line-clamp-2">{workOrder.description || "No description provided"}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Technician</h4>
                  <p className="text-sm font-medium">{workOrder.technician || "Unassigned"}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Due Date</h4>
                  <div className="flex items-center text-sm font-medium">
                    <Calendar className="h-3.5 w-3.5 mr-1 text-gray-500" />
                    {formatDate(workOrder.dueDate)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="p-3 border-t bg-gray-50 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewWorkOrder(workOrder.id)}
              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
