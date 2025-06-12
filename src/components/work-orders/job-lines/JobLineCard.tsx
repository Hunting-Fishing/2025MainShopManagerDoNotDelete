
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WorkOrderJobLine } from '@/types/jobLine';
import { JobLineEditDialog } from './JobLineEditDialog';
import { Edit, Trash2, Clock, DollarSign } from 'lucide-react';
import { jobLineStatusMap } from '@/types/jobLine';

interface JobLineCardProps {
  jobLine: WorkOrderJobLine;
  onUpdate: (jobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  onPartsChange?: (parts: any[]) => void;
  isEditMode?: boolean;
}

export function JobLineCard({ 
  jobLine, 
  onUpdate, 
  onDelete, 
  onPartsChange,
  isEditMode = false 
}: JobLineCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const statusInfo = jobLineStatusMap[jobLine.status || 'pending'];

  const handleSave = async (updatedJobLine: WorkOrderJobLine) => {
    onUpdate(updatedJobLine);
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this job line?')) {
      onDelete(jobLine.id);
    }
  };

  return (
    <>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">{jobLine.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={statusInfo.classes}>
                {statusInfo.label}
              </Badge>
              {isEditMode && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {jobLine.description && (
            <p className="text-sm text-muted-foreground mb-4">{jobLine.description}</p>
          )}
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Estimated Hours</p>
                <p className="font-medium">{jobLine.estimated_hours || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Labor Rate</p>
                <p className="font-medium">${(jobLine.labor_rate || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t">
            <span className="text-sm text-muted-foreground">Total Amount</span>
            <span className="text-lg font-bold text-green-600">
              ${(jobLine.total_amount || 0).toFixed(2)}
            </span>
          </div>
          
          {jobLine.notes && (
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <span className="font-medium">Notes:</span> {jobLine.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <JobLineEditDialog
        jobLine={jobLine}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSave}
      />
    </>
  );
}
