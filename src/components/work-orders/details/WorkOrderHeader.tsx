
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X, Calendar, User, Wrench } from 'lucide-react';
import { statusMap } from '@/utils/workOrders/constants';

interface WorkOrderHeaderProps {
  workOrder: WorkOrder;
  customer: Customer | null;
  isEditMode: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
}

export function WorkOrderHeader({
  workOrder,
  customer,
  isEditMode,
  onStartEdit,
  onCancelEdit,
  onSaveEdit
}: WorkOrderHeaderProps) {
  const statusInfo = statusMap[workOrder.status] || { label: workOrder.status, classes: 'bg-gray-100 text-gray-800' };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <CardTitle className="text-2xl">
                Work Order #{workOrder.work_order_number || workOrder.id.slice(-8)}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {customer && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {customer.first_name} {customer.last_name}
                  </div>
                )}
                {workOrder.created_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(workOrder.created_at).toLocaleDateString()}
                  </div>
                )}
                {workOrder.technician && (
                  <div className="flex items-center gap-1">
                    <Wrench className="h-4 w-4" />
                    {workOrder.technician}
                  </div>
                )}
              </div>
            </div>
            <Badge variant="outline" className={statusInfo.classes}>
              {statusInfo.label}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            {isEditMode ? (
              <>
                <Button onClick={onSaveEdit} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button onClick={onCancelEdit} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={onStartEdit} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      {workOrder.description && (
        <CardContent className="pt-0">
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-muted-foreground">{workOrder.description}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
