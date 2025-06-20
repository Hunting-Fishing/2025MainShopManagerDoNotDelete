
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrder } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { Edit, Save, X, Loader2 } from 'lucide-react';
import { statusMap } from '@/utils/workOrders/constants';

interface WorkOrderDetailsHeaderProps {
  workOrder: WorkOrder;
  customer: Customer | null;
  currentStatus: string;
  isUpdatingStatus: boolean;
  onStatusChange: (status: string) => void;
  isEditMode: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
}

export function WorkOrderDetailsHeader({
  workOrder,
  customer,
  currentStatus,
  isUpdatingStatus,
  onStatusChange,
  isEditMode,
  onStartEdit,
  onCancelEdit,
  onSaveEdit
}: WorkOrderDetailsHeaderProps) {
  const getStatusVariant = (status: string) => {
    const statusInfo = statusMap[status];
    if (!statusInfo) return 'outline';
    
    // Since statusMap returns a string, we'll use a simple color mapping
    const colorMap: { [key: string]: string } = {
      'pending': 'default',
      'in-progress': 'default', 
      'completed': 'default',
      'cancelled': 'destructive',
      'on-hold': 'destructive'
    };
    
    return colorMap[status] || 'outline';
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">
                Work Order #{workOrder.work_order_number || workOrder.id.slice(0, 8)}
              </h1>
              <div className="flex items-center gap-2">
                <Select 
                  value={currentStatus} 
                  onValueChange={onStatusChange}
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue>
                      <Badge variant={getStatusVariant(currentStatus)}>
                        {isUpdatingStatus && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                        {statusMap[currentStatus] || currentStatus}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusMap).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        <Badge variant={getStatusVariant(key)} className="mr-2">
                          {label}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="text-slate-600 space-y-1">
              {customer && (
                <p><strong>Customer:</strong> {customer.first_name} {customer.last_name}</p>
              )}
              {workOrder.description && (
                <p><strong>Description:</strong> {workOrder.description}</p>
              )}
              <p><strong>Created:</strong> {new Date(workOrder.created_at || '').toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isEditMode ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onStartEdit}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={onSaveEdit}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onCancelEdit}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
