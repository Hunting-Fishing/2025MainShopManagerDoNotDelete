
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderDetailsActions } from './WorkOrderDetailsActions';
import { ChevronLeft, User, Phone, Mail, MapPin, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { statusMap, priorityMap } from '@/types/workOrder';

interface WorkOrderDetailsHeaderProps {
  workOrder: WorkOrder;
  onEdit?: () => void;
  onInvoiceCreated?: (invoiceId: string) => void;
  isEditMode?: boolean;
}

export function WorkOrderDetailsHeader({
  workOrder,
  onEdit,
  onInvoiceCreated,
  isEditMode = false
}: WorkOrderDetailsHeaderProps) {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    return priorityMap[priority]?.classes || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/work-orders')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Work Orders
        </Button>
      </div>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Work Order #{workOrder.work_order_number || workOrder.id?.slice(0, 8)}
            </h1>
            <Badge className={getStatusColor(workOrder.status)}>
              {statusMap[workOrder.status] || workOrder.status}
            </Badge>
            {workOrder.priority && (
              <Badge className={getPriorityColor(workOrder.priority)}>
                {priorityMap[workOrder.priority]?.label || workOrder.priority}
              </Badge>
            )}
          </div>
          
          {workOrder.description && (
            <p className="text-lg text-muted-foreground max-w-2xl">
              {workOrder.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {workOrder.created_at && (
              <span>Created: {new Date(workOrder.created_at).toLocaleDateString()}</span>
            )}
            {workOrder.dueDate && (
              <span>Due: {new Date(workOrder.dueDate).toLocaleDateString()}</span>
            )}
            {workOrder.technician && (
              <span>Technician: {workOrder.technician}</span>
            )}
          </div>
        </div>

        <WorkOrderDetailsActions
          workOrder={workOrder}
          onEdit={onEdit}
          onInvoiceCreated={onInvoiceCreated}
        />
      </div>

      {/* Customer and Vehicle Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <User className="h-5 w-5 mr-2 text-green-600" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {workOrder.customer_name && (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{workOrder.customer_name}</span>
              </div>
            )}
            
            {workOrder.customer_email && (
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{workOrder.customer_email}</span>
              </div>
            )}
            
            {workOrder.customer_phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{workOrder.customer_phone}</span>
              </div>
            )}
            
            {workOrder.customer_address && (
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                <span className="text-sm text-gray-600">{workOrder.customer_address}</span>
              </div>
            )}
            
            {!workOrder.customer_name && !workOrder.customer && (
              <p className="text-sm text-gray-500">No customer information available</p>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Car className="h-5 w-5 mr-2 text-blue-600" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Vehicle from the vehicle object */}
            {workOrder.vehicle && (
              <div className="space-y-2">
                <div>
                  <span className="text-gray-500 text-sm">Vehicle:</span>
                  <p className="font-medium">
                    {workOrder.vehicle.year} {workOrder.vehicle.make} {workOrder.vehicle.model}
                    {workOrder.vehicle.trim && ` ${workOrder.vehicle.trim}`}
                  </p>
                </div>
                
                {workOrder.vehicle.license_plate && (
                  <div>
                    <span className="text-gray-500 text-sm">License Plate:</span>
                    <p className="font-medium">{workOrder.vehicle.license_plate}</p>
                  </div>
                )}
                
                {workOrder.vehicle.vin && (
                  <div>
                    <span className="text-gray-500 text-sm">VIN:</span>
                    <p className="font-medium font-mono text-xs">{workOrder.vehicle.vin}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Fallback to individual vehicle fields if vehicle object doesn't exist */}
            {!workOrder.vehicle && (workOrder.vehicle_make || workOrder.vehicle_model) && (
              <div className="space-y-2">
                <div>
                  <span className="text-gray-500 text-sm">Vehicle:</span>
                  <p className="font-medium">
                    {workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}
                  </p>
                </div>
                
                {workOrder.vehicle_license_plate && (
                  <div>
                    <span className="text-gray-500 text-sm">License Plate:</span>
                    <p className="font-medium">{workOrder.vehicle_license_plate}</p>
                  </div>
                )}
                
                {workOrder.vehicle_vin && (
                  <div>
                    <span className="text-gray-500 text-sm">VIN:</span>
                    <p className="font-medium font-mono text-xs">{workOrder.vehicle_vin}</p>
                  </div>
                )}
                
                {workOrder.vehicle_odometer && (
                  <div>
                    <span className="text-gray-500 text-sm">Odometer:</span>
                    <p className="font-medium">{workOrder.vehicle_odometer}</p>
                  </div>
                )}
              </div>
            )}
            
            {!workOrder.vehicle && !workOrder.vehicle_make && !workOrder.vehicle_model && (
              <p className="text-sm text-gray-500">No vehicle information available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
