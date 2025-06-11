
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderDetailsActions } from './WorkOrderDetailsActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, Car, MapPin } from 'lucide-react';

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
  isEditMode 
}: WorkOrderDetailsHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'on-hold':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">
                Work Order #{workOrder.work_order_number || workOrder.id.slice(0, 8)}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getStatusColor(workOrder.status)}>
                  {workOrder.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Created: {new Date(workOrder.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <WorkOrderDetailsActions
              workOrder={workOrder}
              onEdit={onEdit}
              onInvoiceCreated={onInvoiceCreated}
            />
          </div>
        </CardHeader>
        
        {workOrder.description && (
          <CardContent className="pt-0">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Work Description</p>
              <p className="text-sm">{workOrder.description}</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Customer Information Card */}
      <Card className="border-blue-100">
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-transparent">
          <CardTitle className="text-lg flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Details */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">
                    {workOrder.customer_name || 'Unknown Customer'}
                  </p>
                  <p className="text-sm text-gray-500">Customer</p>
                </div>
              </div>
              
              {workOrder.customer_email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-900">{workOrder.customer_email}</p>
                    <p className="text-xs text-gray-500">Email</p>
                  </div>
                </div>
              )}
              
              {workOrder.customer_phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-900">{workOrder.customer_phone}</p>
                    <p className="text-xs text-gray-500">Phone</p>
                  </div>
                </div>
              )}

              {workOrder.customer_address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-900">{workOrder.customer_address}</p>
                    <p className="text-xs text-gray-500">Address</p>
                  </div>
                </div>
              )}
            </div>

            {/* Vehicle/Equipment Information */}
            <div className="space-y-4">
              {(workOrder.vehicle_make || workOrder.vehicle_model || workOrder.equipment_name) && (
                <>
                  <div className="flex items-center space-x-3">
                    <Car className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {workOrder.vehicle_make && workOrder.vehicle_model ? (
                          `${workOrder.vehicle_year || ''} ${workOrder.vehicle_make} ${workOrder.vehicle_model}`.trim()
                        ) : workOrder.equipment_name ? (
                          workOrder.equipment_name
                        ) : (
                          'Vehicle/Equipment'
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        {workOrder.equipment_name ? 'Equipment' : 'Vehicle'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    {workOrder.vehicle_license_plate && (
                      <div>
                        <span className="text-gray-500">License Plate:</span>
                        <p className="font-medium">{workOrder.vehicle_license_plate}</p>
                      </div>
                    )}
                    
                    {workOrder.vehicle_vin && (
                      <div>
                        <span className="text-gray-500">VIN:</span>
                        <p className="font-medium font-mono text-xs">{workOrder.vehicle_vin}</p>
                      </div>
                    )}
                    
                    {workOrder.equipment_type && (
                      <div>
                        <span className="text-gray-500">Equipment Type:</span>
                        <p className="font-medium">{workOrder.equipment_type}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
