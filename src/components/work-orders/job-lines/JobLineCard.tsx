import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Clock, DollarSign } from 'lucide-react';
import { useDraggable } from "@dnd-kit/core";
import { EditJobLineDialog } from './EditJobLineDialog';
import { TimeTrackingQuickPanel } from '../time-tracking/TimeTrackingQuickPanel';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatCurrency } from '@/utils/formatters';
import { jobLineStatusMap } from '@/types/jobLine';

interface JobLineCardProps {
  jobLine: WorkOrderJobLine;
  onUpdate?: (jobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  isEditMode?: boolean;
}

export function JobLineCard({
  jobLine,
  onUpdate,
  onDelete,
  isEditMode = false
}: JobLineCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showTimeTracking, setShowTimeTracking] = useState(false);

  const handleUpdate = (updatedJobLine: WorkOrderJobLine) => {
    if (onUpdate) {
      onUpdate(updatedJobLine);
    }
    setIsEditDialogOpen(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(jobLine.id);
    }
    setIsDeleteDialogOpen(false);
  };

  const toggleTimeTracking = () => {
    setShowTimeTracking(!showTimeTracking);
  };

  // Format the estimated hours
  const formattedHours = jobLine.estimated_hours
    ? `${jobLine.estimated_hours} ${jobLine.estimated_hours === 1 ? 'hour' : 'hours'}`
    : 'Not specified';

  // Calculate total if we have both rate and hours
  const total = jobLine.labor_rate && jobLine.estimated_hours
    ? jobLine.labor_rate * jobLine.estimated_hours
    : jobLine.total_amount || 0;

  // Get status display info
  const statusInfo = jobLine.status && jobLineStatusMap[jobLine.status]
    ? jobLineStatusMap[jobLine.status]
    : { label: jobLine.status || 'Unknown', classes: 'bg-gray-100 text-gray-800' };

  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{jobLine.name}</CardTitle>
            {jobLine.category && (
              <div className="text-sm text-muted-foreground mt-1">
                {jobLine.category} {jobLine.subcategory ? `/ ${jobLine.subcategory}` : ''}
              </div>
            )}
          </div>
          
          {jobLine.status && (
            <Badge className={statusInfo.classes}>
              {statusInfo.label}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {jobLine.description && (
          <div className="mb-4">
            <p className="text-sm">{jobLine.description}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div>
            <p className="text-sm text-muted-foreground">Estimated Time</p>
            <p className="font-medium">{formattedHours}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Labor Rate</p>
            <p className="font-medium">
              {jobLine.labor_rate ? formatCurrency(jobLine.labor_rate) : 'Not specified'}
              {jobLine.labor_rate_type && ` (${jobLine.labor_rate_type})`}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="font-medium">{formatCurrency(total)}</p>
          </div>
        </div>
        
        {jobLine.notes && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">Notes</p>
            <p className="text-sm">{jobLine.notes}</p>
          </div>
        )}
        
        {isEditMode && (
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleTimeTracking}
            >
              <Clock className="h-4 w-4 mr-1" />
              <span>Time</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Pencil className="h-4 w-4 mr-1" />
              <span>Edit</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              <span>Delete</span>
            </Button>
          </div>
        )}
        
        {showTimeTracking && (
          <div className="mt-4 pt-4 border-t">
            <TimeTrackingQuickPanel workOrderId={jobLine.work_order_id} />
          </div>
        )}
      </CardContent>
      
      {isEditDialogOpen && (
        <EditJobLineDialog
          jobLine={jobLine}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onUpdate={handleUpdate}
        />
      )}
      
      {isDeleteDialogOpen && (
        <ConfirmDialog
          title="Delete Job Line"
          description="Are you sure you want to delete this job line? This action cannot be undone."
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDelete}
        />
      )}
    </Card>
  );
}
