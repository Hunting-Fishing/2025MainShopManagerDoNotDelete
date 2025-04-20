
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Wrench, User, MapPin, FileText, Tag, Tool } from "lucide-react";
import { WorkOrder } from "@/types/workOrder";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    if (!dateStr) return "Not set";
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
        <Card key={workOrder.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white border border-gray-100">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-slate-50 pb-2">
            <div className="flex justify-between">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="font-semibold text-indigo-700">{workOrder.id.substring(0, 8)}</div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{workOrder.id}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="mt-2 font-medium line-clamp-2">{workOrder.description}</p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{workOrder.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-indigo-500 mt-0.5" />
                <div>
                  <p className="text-gray-500">Customer</p>
                  <p className="font-medium">{workOrder.customer || 'Unassigned'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Wrench className="h-4 w-4 text-indigo-500 mt-0.5" />
                <div>
                  <p className="text-gray-500">Technician</p>
                  <p className="font-medium">{workOrder.technician || 'Unassigned'}</p>
                </div>
              </div>

              {(workOrder.vehicleMake || workOrder.vehicleModel) && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-indigo-500 mt-0.5" />
                  <div>
                    <p className="text-gray-500">Vehicle</p>
                    <p className="font-medium">{`${workOrder.vehicleMake || ''} ${workOrder.vehicleModel || ''}`.trim()}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-indigo-500 mt-0.5" />
                <div>
                  <p className="text-gray-500">Service Type</p>
                  <p className="font-medium">{workOrder.serviceType || workOrder.service_type || 'Not specified'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-indigo-500 mt-0.5" />
                <div>
                  <p className="text-gray-500">Created</p>
                  <p className="font-medium">{formatDate(workOrder.date || workOrder.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-indigo-500 mt-0.5" />
                <div>
                  <p className="text-gray-500">Due Date</p>
                  <p className="font-medium">{workOrder.dueDate ? formatDate(workOrder.dueDate) : 'Not set'}</p>
                </div>
              </div>
              
              {workOrder.total_cost && (
                <div className="flex items-start gap-2">
                  <Tag className="h-4 w-4 text-indigo-500 mt-0.5" />
                  <div>
                    <p className="text-gray-500">Total Cost</p>
                    <p className="font-medium">${Number(workOrder.total_cost).toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-gradient-to-r from-slate-50 to-indigo-50 border-t flex justify-end py-3">
            <Button 
              variant="default" 
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700"
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
