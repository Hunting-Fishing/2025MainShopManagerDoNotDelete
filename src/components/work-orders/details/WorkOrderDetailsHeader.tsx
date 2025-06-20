
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrder } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { Loader2 } from 'lucide-react';
import { statusMap } from '@/utils/workOrders/constants';

interface WorkOrderDetailsHeaderProps {
  workOrder: WorkOrder;
  customer: Customer | null;
  currentStatus: string;
  isUpdatingStatus: boolean;
  onStatusChange: (status: string) => void;
  isEditMode: boolean;
}

export function WorkOrderDetailsHeader({
  workOrder,
  customer,
  currentStatus,
  isUpdatingStatus,
  onStatusChange,
  isEditMode
}: WorkOrderDetailsHeaderProps) {
  const getStatusVariant = (status: string): "default" | "destructive" | "success" | "warning" | "outline" | "secondary" | "info" => {
    // Map work order statuses to badge variants
    switch (status) {
      case 'completed':
        return 'success';
      case 'cancelled':
      case 'on-hold':
        return 'destructive';
      case 'in-progress':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
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
                        {statusMap[currentStatus as keyof typeof statusMap] || currentStatus}
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
              {!isEditMode && (
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    Read Only - Work Order Completed
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
