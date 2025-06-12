
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { JobLineEditDialog } from './JobLineEditDialog';
import { AddPartsDialog } from '../parts/AddPartsDialog';
import { PartDetailsCard } from '../parts/PartDetailsCard';
import { Edit, Trash2, Clock, DollarSign, Package, Plus } from 'lucide-react';
import { jobLineStatusMap } from '@/types/jobLine';

interface JobLineCardProps {
  jobLine: WorkOrderJobLine;
  onUpdate: (jobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  onPartsChange?: (parts: any[]) => void;
  isEditMode?: boolean;
  parts?: WorkOrderPart[];
  onPartUpdate?: (part: WorkOrderPart) => void;
  onPartRemove?: (partId: string) => void;
}

export function JobLineCard({ 
  jobLine, 
  onUpdate, 
  onDelete, 
  onPartsChange,
  isEditMode = false,
  parts = [],
  onPartUpdate,
  onPartRemove
}: JobLineCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showAddPartsDialog, setShowAddPartsDialog] = useState(false);
  
  const statusInfo = jobLineStatusMap[jobLine.status || 'pending'];
  const jobLineParts = parts.filter(part => part.job_line_id === jobLine.id);

  const handleSave = async (updatedJobLine: WorkOrderJobLine) => {
    onUpdate(updatedJobLine);
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this job line?')) {
      onDelete(jobLine.id);
    }
  };

  const handlePartAdd = (partData: any) => {
    // This will be handled by the parent component
    console.log('Part added to job line:', jobLine.id, partData);
    setShowAddPartsDialog(false);
  };

  const partsTotal = jobLineParts.reduce((sum, part) => sum + part.total_price, 0);
  const totalWithParts = (jobLine.total_amount || 0) + partsTotal;

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

          {/* Parts Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Parts ({jobLineParts.length})</span>
              </div>
              {isEditMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddPartsDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Parts
                </Button>
              )}
            </div>
            
            {jobLineParts.length > 0 ? (
              <div className="space-y-2 bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                {jobLineParts.map((part) => (
                  <div key={part.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{part.name}</span>
                      <span className="text-muted-foreground ml-2">
                        Qty: {part.quantity} × ${part.unit_price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">${part.total_price.toFixed(2)}</span>
                      {isEditMode && onPartRemove && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPartRemove(part.id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Parts Subtotal:</span>
                    <span>${partsTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground bg-slate-50 dark:bg-slate-900 rounded-lg">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No parts added yet</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t">
            <span className="text-sm text-muted-foreground">Total Amount (Labor + Parts)</span>
            <span className="text-lg font-bold text-green-600">
              ${totalWithParts.toFixed(2)}
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

      {showAddPartsDialog && (
        <AddPartsDialog
          workOrderId={jobLine.work_order_id}
          jobLineId={jobLine.id}
          onPartAdd={handlePartAdd}
          open={showAddPartsDialog}
          onOpenChange={setShowAddPartsDialog}
        />
      )}
    </>
  );
}
