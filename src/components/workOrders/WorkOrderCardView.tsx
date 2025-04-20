
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Tool, User, MapPin, FileText } from "lucide-react";
import { WorkOrder } from "@/types/workOrder";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

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

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border border-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "low":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM dd, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  if (workOrders.length === 0) {
    return (
      <Card className="text-center p-6">
        <p className="text-muted-foreground">No work orders found</p>
      </Card>
    );
  }

  return (
    <>
      {workOrders.map((workOrder) => (
        <Card key={workOrder.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="bg-muted/20 pb-2">
            <div className="flex justify-between">
              <div className="font-semibold">{workOrder.id.substring(0, 8)}</div>
              <div className="flex gap-2">
                <Badge className={getStatusClass(workOrder.status)}>
                  {workOrder.status.charAt(0).toUpperCase() +
                    workOrder.status.slice(1).replace("-", " ")}
                </Badge>
                <Badge className={getPriorityClass(workOrder.priority)}>
                  {workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1)}
                </Badge>
              </div>
            </div>
            <p className="mt-2 font-medium">{workOrder.description}</p>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-500">Customer</p>
                  <p>{workOrder.customer || 'Unassigned'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Tool className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-500">Technician</p>
                  <p>{workOrder.technician || 'Unassigned'}</p>
                </div>
              </div>

              {(workOrder.vehicleMake || workOrder.vehicleModel) && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-gray-500">Vehicle</p>
                    <p>{`${workOrder.vehicleMake || ''} ${workOrder.vehicleModel || ''}`.trim()}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-500">Service Type</p>
                  <p>{workOrder.serviceType || workOrder.service_type || 'Not specified'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-500">Created</p>
                  <p>{formatDate(workOrder.date || workOrder.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-500">Due Date</p>
                  <p>{workOrder.dueDate ? formatDate(workOrder.dueDate) : 'Not set'}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/10 border-t flex justify-end py-2">
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
