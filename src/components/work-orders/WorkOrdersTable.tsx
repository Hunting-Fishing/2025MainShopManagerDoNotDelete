
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Edit, Trash2, Clock } from "lucide-react";
import { WorkOrder } from "@/types/workOrder";
import { Link } from "react-router-dom";

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
}

// Helper function to get vehicle information with improved error handling
const getVehicleInfo = (workOrder: WorkOrder): string => {
  try {
    // First, try to use vehicle table data if available
    if (workOrder.vehicle) {
      const { year, make, model, license_plate } = workOrder.vehicle;
      const vehicleText = `${year || ''} ${make || ''} ${model || ''}`.trim();
      const plateText = license_plate ? ` (${license_plate})` : '';
      return vehicleText + plateText || 'Vehicle details available';
    }
    
    // Fallback to individual vehicle fields from work order
    const { vehicle_make, vehicle_model, vehicle_year, vehicle_license_plate } = workOrder;
    
    if (vehicle_make || vehicle_model || vehicle_year) {
      const vehicleText = `${vehicle_year || ''} ${vehicle_make || ''} ${vehicle_model || ''}`.trim();
      const plateText = vehicle_license_plate ? ` (${vehicle_license_plate})` : '';
      return vehicleText + plateText;
    }
    
    // If we have a vehicle_id but no vehicle data, show that we have a vehicle reference
    if (workOrder.vehicle_id) {
      return 'Vehicle assigned (loading details...)';
    }
    
    return 'No vehicle assigned';
  } catch (error) {
    console.error('Error getting vehicle info:', error);
    return 'Vehicle information unavailable';
  }
};

// Helper function to get customer name with fallback handling
const getCustomerName = (workOrder: WorkOrder): string => {
  try {
    return workOrder.customer_name || workOrder.customer || 'Unknown Customer';
  } catch (error) {
    console.error('Error getting customer name:', error);
    return 'Customer information unavailable';
  }
};

// Helper function to get status badge variant
const getStatusVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'secondary';
    case 'in-progress':
      return 'default';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'destructive';
    case 'on-hold':
      return 'warning';
    default:
      return 'secondary';
  }
};

// Helper function to get priority badge variant
const getPriorityVariant = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'urgent':
      return 'destructive';
    case 'high':
      return 'warning';
    case 'medium':
      return 'default';
    case 'low':
      return 'secondary';
    default:
      return 'secondary';
  }
};

const WorkOrdersTable: React.FC<WorkOrdersTableProps> = ({ workOrders }) => {
  if (!workOrders || workOrders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No work orders found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Orders ({workOrders.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workOrders.map((workOrder) => (
              <TableRow key={workOrder.id}>
                <TableCell className="font-mono text-xs">
                  {workOrder.id.slice(0, 8)}...
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {getCustomerName(workOrder)}
                  </div>
                  {workOrder.customer_email && (
                    <div className="text-sm text-muted-foreground">
                      {workOrder.customer_email}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {getVehicleInfo(workOrder)}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate" title={workOrder.description || 'No description'}>
                    {workOrder.description || 'No description'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(workOrder.status)}>
                    {workOrder.status?.replace('-', ' ') || 'Unknown'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {workOrder.priority && (
                    <Badge variant={getPriorityVariant(workOrder.priority)}>
                      {workOrder.priority}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {workOrder.created_at ? 
                      new Date(workOrder.created_at).toLocaleDateString() : 
                      'Unknown date'
                    }
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
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
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default WorkOrdersTable;
