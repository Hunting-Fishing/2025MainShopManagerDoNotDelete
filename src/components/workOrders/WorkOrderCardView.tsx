
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User } from 'lucide-react';
import { WorkOrder } from '@/types/workOrder';
import { priorityMap } from '@/utils/workOrders';
import { useNavigate } from 'react-router-dom';

interface WorkOrderCardViewProps {
  workOrders: WorkOrder[];
}

export const WorkOrderCardView: React.FC<WorkOrderCardViewProps> = ({ workOrders }) => {
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

  return (
    <>
      {workOrders.map((workOrder) => (
        <Card key={workOrder.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-medium line-clamp-2">
                {workOrder.description}
              </CardTitle>
              <Badge className={getStatusClass(workOrder.status)}>
                {workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1).replace("-", " ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <span>{workOrder.customer}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span>{workOrder.dueDate}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <Badge
                  className={
                    priorityMap[workOrder.priority as keyof typeof priorityMap]?.classes ||
                    "bg-gray-100 text-gray-800 border border-gray-300"
                  }
                >
                  {priorityMap[workOrder.priority as keyof typeof priorityMap]?.label || workOrder.priority}
                </Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/work-orders/${workOrder.id}`)}
            >
              View Details
            </Button>
          </CardFooter>
        </Card>
      ))}
    </>
  );
};
