
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Package } from 'lucide-react';
import { DroppableJobLinePartsSection } from '../parts/DroppableJobLinePartsSection';
import { AddPartsDialog } from '../parts/AddPartsDialog';
import { EditJobLineDialog } from './EditJobLineDialog';

interface JobLineCardProps {
  jobLine: WorkOrderJobLine;
  onUpdate?: (jobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  onPartsChange?: (parts: WorkOrderPart[]) => void;
  isEditMode?: boolean;
  parts?: WorkOrderPart[];
}

export function JobLineCard({
  jobLine,
  onUpdate,
  onDelete,
  onPartsChange,
  isEditMode = false,
  parts = [],
}: JobLineCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const jobLineParts = parts.filter(part => part.job_line_id === jobLine.id);

  // For controlled inline editing
  const [editValues, setEditValues] = useState<Partial<WorkOrderJobLine>>({});

  // Update local state on isEditMode change (reset to jobLine values)
  React.useEffect(() => {
    if (isEditMode) {
      setEditValues({
        name: jobLine.name,
        description: jobLine.description,
        estimated_hours: jobLine.estimated_hours,
        labor_rate: jobLine.labor_rate,
        status: jobLine.status,
        category: jobLine.category,
        total_amount: jobLine.total_amount,
      });
    } else {
      setEditValues({});
    }
  }, [isEditMode, jobLine]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // For number fields convert to number
    setEditValues(prev => ({
      ...prev,
      [name]: name === "estimated_hours" || name === "labor_rate" || name === "total_amount" 
        ? Number(value) 
        : value,
    }));
  };

  const handleBlur = () => {
    // On blur, propagate edits up (optional: only on Save button or auto-save on blur)
    if (onUpdate && isEditMode) {
      onUpdate({
        ...jobLine,
        ...editValues,
      } as WorkOrderJobLine);
    }
  };

  const handleEditJobLine = (updatedJobLine: WorkOrderJobLine) => {
    if (onUpdate) onUpdate(updatedJobLine);
  };

  // Only editable fields for MVP: name, description, estimated hours, labor rate, status
  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg">
                {isEditMode ? (
                  <input
                    type="text"
                    name="name"
                    value={editValues.name ?? ""}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="border p-1 rounded w-full"
                  />
                ) : (
                  jobLine.name
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {isEditMode ? (
                  <input
                    type="text"
                    name="description"
                    value={editValues.description ?? ""}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="border p-1 rounded w-full"
                  />
                ) : (
                  jobLine.description
                )}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">
                  {isEditMode ? (
                    <select
                      name="status"
                      value={editValues.status ?? ""}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className="border p-1 rounded"
                    >
                      <option value="pending">pending</option>
                      <option value="in-progress">in-progress</option>
                      <option value="completed">completed</option>
                      <option value="on-hold">on-hold</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  ) : (
                    jobLine.status
                  )}
                </Badge>
                {jobLine.category && (
                  <Badge variant="secondary">{jobLine.category}</Badge>
                )}
              </div>
            </div>
            {isEditMode && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => onDelete?.(jobLine.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <span className="text-sm text-muted-foreground">Hours</span>
              <p className="font-medium">
                {isEditMode ? (
                  <input
                    type="number"
                    name="estimated_hours"
                    min={0}
                    value={editValues.estimated_hours ?? 0}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="border p-1 rounded w-16 text-right"
                  />
                ) : (
                  jobLine.estimated_hours || 0
                )}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Rate</span>
              <p className="font-medium">
                {isEditMode ? (
                  <input
                    type="number"
                    name="labor_rate"
                    min={0}
                    value={editValues.labor_rate ?? 0}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="border p-1 rounded w-16 text-right"
                  />
                ) : (
                  `$${jobLine.labor_rate || 0}`
                )}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Labor</span>
              <p className="font-medium">
                ${((editValues.estimated_hours ?? jobLine.estimated_hours ?? 0) *
                    (editValues.labor_rate ?? jobLine.labor_rate ?? 0)).toFixed(2)}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Total</span>
              <p className="font-medium font-bold">
                {isEditMode ? (
                  <input
                    type="number"
                    name="total_amount"
                    min={0}
                    value={editValues.total_amount ?? 0}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="border p-1 rounded w-20 text-right"
                  />
                ) : (
                  `$${jobLine.total_amount || 0}`
                )}
              </p>
            </div>
          </div>

          {/* Parts Section - Always show, even when empty */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Parts ({jobLineParts.length})
              </h4>
              {isEditMode && (
                <AddPartsDialog
                  workOrderId={jobLine.work_order_id}
                  jobLineId={jobLine.id}
                  onPartAdd={newPart => onPartsChange?.([...parts, newPart])}
                />
              )}
            </div>

            {/* Always render the droppable section */}
            <DroppableJobLinePartsSection
              jobLineId={jobLine.id}
              parts={jobLineParts}
              onRemovePart={partId => onPartsChange?.(parts.filter(p => p.id !== partId))}
              onEditPart={updatedPart => onPartsChange?.(parts.map(p => p.id === updatedPart.id ? updatedPart : p))}
              isEditMode={isEditMode}
            />
          </div>
        </CardContent>
      </Card>

      <EditJobLineDialog
        jobLine={jobLine}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdate={handleEditJobLine}
      />
    </>
  );
}
