
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Play, CheckCircle, Pause } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { UnifiedJobLineEditDialog } from './UnifiedJobLineEditDialog';
import { EditService } from '@/services/workOrder/editService';
import { toast } from '@/hooks/use-toast';

interface EnhancedJobLineItemProps {
  jobLine: WorkOrderJobLine;
  onUpdate: (updatedJobLine: WorkOrderJobLine) => void;
  isEditMode?: boolean;
}

export function EnhancedJobLineItem({
  jobLine,
  onUpdate,
  isEditMode = false
}: EnhancedJobLineItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const updatedJobLine = await EditService.updateJobLine(jobLine.id, {
        status: newStatus
      });
      onUpdate(updatedJobLine);
      toast({
        title: "Status Updated",
        description: `Job line status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveJobLine = async (updatedJobLine: WorkOrderJobLine) => {
    onUpdate(updatedJobLine);
    setIsEditDialogOpen(false);
  };

  const getQuickActions = () => {
    const currentStatus = jobLine.status || 'pending';
    const actions = [];

    if (currentStatus === 'pending') {
      actions.push({
        label: 'Start Work',
        icon: <Play className="h-3 w-3" />,
        status: 'in-progress',
        variant: 'default' as const
      });
    }

    if (currentStatus === 'in-progress') {
      actions.push({
        label: 'Complete',
        icon: <CheckCircle className="h-3 w-3" />,
        status: 'completed',
        variant: 'default' as const
      });
      actions.push({
        label: 'Pause',
        icon: <Pause className="h-3 w-3" />,
        status: 'on-hold',
        variant: 'outline' as const
      });
    }

    return actions;
  };

  return (
    <>
      <Card className="hover:shadow-sm transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-base">{jobLine.name}</h4>
                <StatusBadge status={jobLine.status || 'pending'} type="jobLine" />
              </div>
              {jobLine.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {jobLine.description}
                </p>
              )}
            </div>
            
            {isEditMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
                className="ml-2"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm mb-3">
            <div>
              <span className="text-muted-foreground">Hours: </span>
              <span className="font-medium">{jobLine.estimated_hours || 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Rate: </span>
              <span className="font-medium">${jobLine.labor_rate || 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total: </span>
              <span className="font-medium">${jobLine.total_amount || 0}</span>
            </div>
          </div>

          {isEditMode && (
            <div className="flex gap-2 flex-wrap">
              {getQuickActions().map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  size="sm"
                  onClick={() => handleStatusChange(action.status)}
                  disabled={isUpdatingStatus}
                  className="text-xs"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {jobLine.parts && jobLine.parts.length > 0 && (
            <div className="mt-4 pt-3 border-t">
              <h5 className="text-sm font-medium mb-2">Associated Parts:</h5>
              <div className="space-y-2">
                {jobLine.parts.map((part) => (
                  <div key={part.id} className="flex justify-between items-center text-sm">
                    <div>
                      <span className="font-medium">{part.name}</span>
                      <span className="text-muted-foreground ml-2">
                        Qty: {part.quantity}
                      </span>
                    </div>
                    <span>${part.unit_price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <UnifiedJobLineEditDialog
        jobLine={jobLine}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveJobLine}
      />
    </>
  );
}
