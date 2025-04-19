
import React from 'react';
import { Button } from '@/components/ui/button';
import { WorkOrderStatusType } from '@/types/workOrder';
import { CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';

interface WorkOrderActionsProps {
  currentStatus: WorkOrderStatusType;
  onStatusChange: (newStatus: WorkOrderStatusType) => void;
}

export function WorkOrderActions({ 
  currentStatus, 
  onStatusChange 
}: WorkOrderActionsProps) {
  const getStatusButton = (status: WorkOrderStatusType) => {
    switch (status) {
      case 'pending':
        return (
          <Button 
            onClick={() => onStatusChange('pending')}
            variant={currentStatus === 'pending' ? 'default' : 'outline'}
            size="sm"
            disabled={currentStatus === 'pending'}
            className="flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Pending
          </Button>
        );
      case 'in-progress':
        return (
          <Button 
            onClick={() => onStatusChange('in-progress')}
            variant={currentStatus === 'in-progress' ? 'default' : 'outline'}
            size="sm"
            disabled={currentStatus === 'in-progress'}
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            In Progress
          </Button>
        );
      case 'completed':
        return (
          <Button 
            onClick={() => onStatusChange('completed')}
            variant={currentStatus === 'completed' ? 'default' : 'outline'}
            size="sm"
            disabled={currentStatus === 'completed'}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Complete
          </Button>
        );
      case 'cancelled':
        return (
          <Button 
            onClick={() => onStatusChange('cancelled')}
            variant={currentStatus === 'cancelled' ? 'destructive' : 'outline'}
            size="sm"
            disabled={currentStatus === 'cancelled'}
            className="flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Cancel
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {getStatusButton('pending')}
      {getStatusButton('in-progress')}
      {getStatusButton('completed')}
      {getStatusButton('cancelled')}
    </div>
  );
}
