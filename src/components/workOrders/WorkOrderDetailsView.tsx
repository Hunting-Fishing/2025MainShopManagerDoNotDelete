import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Printer,
  Share,
  Clock,
  MoreHorizontal,
  ArrowLeft
} from "lucide-react";
import { WorkOrder } from "@/types/workOrder";
import { Link } from "react-router-dom";
import { WorkOrderDetailsTabs } from "./details/WorkOrderDetailsTabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useProfileStore } from "@/stores/profileStore";
import { TimeEntry } from "@/types/workOrder";
import { formatTimeInHoursAndMinutes } from "@/utils/workOrders";
import { useWorkOrderAutomation } from '@/hooks/workOrders/useWorkOrderAutomation';

interface WorkOrderDetailsViewProps {
  workOrder: WorkOrder;
  onUpdateTimeEntries?: (entries: TimeEntry[]) => void;
}

export default function WorkOrderDetailsView({
  workOrder,
  onUpdateTimeEntries = () => {}
}: WorkOrderDetailsViewProps) {
  const { user } = useAuth();
  const profile = useProfileStore(state => state.profile);
  
  const { handleStatusChange } = useWorkOrderAutomation();
  
  const handleUpdateTimeEntries = (entries: TimeEntry[]) => {
    onUpdateTimeEntries(entries);
  };

  const handleWorkOrderUpdate = async (updatedWorkOrder: WorkOrder) => {
    await handleStatusChange(updatedWorkOrder);
  };

  const totalBillableTime = workOrder.timeEntries 
    ? workOrder.timeEntries
        .filter(entry => entry.billable)
        .reduce((total, entry) => total + (entry.duration || 0), 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            asChild
          >
            <Link to="/work-orders">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Work Order #{workOrder.id}</h1>
            <p className="text-muted-foreground">
              {workOrder.customer}{workOrder.vehicleMake && workOrder.vehicleModel 
                ? ` • ${workOrder.vehicleMake} ${workOrder.vehicleModel}` 
                : ''}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 self-end sm:self-auto">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/work-orders/${workOrder.id}/edit`}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
          
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
          
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-1" />
            Share
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                Create Invoice
              </DropdownMenuItem>
              <DropdownMenuItem>
                Duplicate Work Order
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-500">
                Cancel Work Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {workOrder.status}
            </div>
            <p className="text-xs text-muted-foreground">
              Last updated: {workOrder.lastUpdatedAt ? new Date(workOrder.lastUpdatedAt).toLocaleDateString() : 'N/A'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Billable Time
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTimeInHoursAndMinutes(totalBillableTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              {workOrder.timeEntries?.length || 0} time entries
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Parts & Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workOrder.inventoryItems?.length || 0} items
            </div>
            <p className="text-xs text-muted-foreground">
              Total value: ${workOrder.inventoryItems?.reduce((total, item) => total + (item.unitPrice * item.quantity), 0).toFixed(2) || "0.00"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${workOrder.total_cost?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Not yet invoiced
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main content with tabs */}
      <WorkOrderDetailsTabs 
        workOrder={workOrder} 
        onUpdateTimeEntries={handleUpdateTimeEntries}
      />
    </div>
  );
}
