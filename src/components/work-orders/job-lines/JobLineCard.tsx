
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkOrderJobLine, jobLineStatusMap } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DroppableJobLinePartsSection } from '../parts/DroppableJobLinePartsSection';
import { AddPartsDialog } from '../parts/AddPartsDialog';
import { EditPartDialog } from '../parts/EditPartDialog';
import { JobLineDialog } from './JobLineDialog';
import { Separator } from '@/components/ui/separator';
import { useJobLines } from '@/hooks/useJobLines';
import { toast } from 'sonner';
import { getJobLineParts } from '@/services/workOrder/workOrderPartsService';
import { useParts } from '@/hooks/useParts';

interface JobLineCardProps {
  jobLine: WorkOrderJobLine;
  isEditMode?: boolean;
  onPartsChange?: (newParts: WorkOrderPart[]) => void;
}

export function JobLineCard({ 
  jobLine, 
  isEditMode = false, 
  onPartsChange 
}: JobLineCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddPartsOpen, setIsAddPartsOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<WorkOrderPart | null>(null);
  const [parts, setParts] = useState<WorkOrderPart[]>(jobLine.parts || []);
  const { removePart } = useParts();

  // Load parts when component mounts or jobLine changes
  useEffect(() => {
    const loadParts = async () => {
      if (jobLine.id) {
        try {
          const jobLineParts = await getJobLineParts(jobLine.id);
          setParts(jobLineParts);
        } catch (error) {
          console.error('Error loading parts for job line:', error);
        }
      }
    };

    loadParts();
  }, [jobLine.id]);

  // Update parent when parts change
  useEffect(() => {
    if (onPartsChange) {
      onPartsChange(parts);
    }
  }, [parts, onPartsChange]);

  const handleRemovePart = async (partId: string) => {
    try {
      const success = await removePart(partId);
      if (success) {
        setParts(prev => prev.filter(p => p.id !== partId));
        toast.success('Part removed successfully');
      } else {
        toast.error('Failed to remove part');
      }
    } catch (error) {
      console.error('Error removing part:', error);
      toast.error('Failed to remove part');
    }
  };

  const handleEditPart = (part: WorkOrderPart) => {
    setEditingPart(part);
  };

  const handlePartUpdated = () => {
    // Refresh parts after update
    const loadParts = async () => {
      if (jobLine.id) {
        try {
          const jobLineParts = await getJobLineParts(jobLine.id);
          setParts(jobLineParts);
        } catch (error) {
          console.error('Error reloading parts:', error);
        }
      }
    };
    loadParts();
    setEditingPart(null);
  };

  const handlePartsAdded = () => {
    // Refresh parts after adding
    const loadParts = async () => {
      if (jobLine.id) {
        try {
          const jobLineParts = await getJobLineParts(jobLine.id);
          setParts(jobLineParts);
        } catch (error) {
          console.error('Error reloading parts:', error);
        }
      }
    };
    loadParts();
    setIsAddPartsOpen(false);
  };

  const totalAmount = jobLine.totalAmount || 0;
  const estimatedHours = jobLine.estimatedHours || 0;
  const partsTotal = parts.reduce((sum, part) => sum + (part.customerPrice * part.quantity), 0);

  return (
    <>
      <Card className="border-slate-200">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  <div>
                    <CardTitle className="text-lg">{jobLine.name}</CardTitle>
                    {jobLine.description && (
                      <p className="text-sm text-slate-600 mt-1">{jobLine.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="secondary" 
                    className={jobLineStatusMap[jobLine.status]?.classes || 'bg-gray-100 text-gray-800'}
                  >
                    {jobLineStatusMap[jobLine.status]?.label || jobLine.status}
                  </Badge>
                  {isEditMode && (
                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditDialogOpen(true)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2 text-sm text-slate-600">
                <div className="flex items-center space-x-4">
                  {estimatedHours > 0 && (
                    <span>{estimatedHours} hours</span>
                  )}
                  <span>{parts.length} parts</span>
                </div>
                <div className="text-right">
                  <div className="font-medium text-slate-900">
                    ${(totalAmount + partsTotal).toFixed(2)}
                  </div>
                  <div className="text-xs">
                    Labor: ${totalAmount.toFixed(2)} + Parts: ${partsTotal.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="pt-0">
              <Separator className="mb-4" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-900">Parts ({parts.length})</h4>
                  {isEditMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddPartsOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Parts
                    </Button>
                  )}
                </div>

                <DroppableJobLinePartsSection
                  jobLineId={jobLine.id}
                  parts={parts}
                  onRemovePart={isEditMode ? handleRemovePart : undefined}
                  onEditPart={isEditMode ? handleEditPart : undefined}
                  isEditMode={isEditMode}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Add Parts Dialog */}
      <AddPartsDialog
        open={isAddPartsOpen}
        onOpenChange={setIsAddPartsOpen}
        workOrderId={jobLine.workOrderId || ''}
        jobLineId={jobLine.id}
        onPartsAdd={handlePartsAdded}
      />

      {/* Edit Part Dialog */}
      {editingPart && (
        <EditPartDialog
          open={true}
          onOpenChange={(open) => !open && setEditingPart(null)}
          part={editingPart}
          onSave={handlePartUpdated}
        />
      )}

      {/* Edit Job Line Dialog */}
      <JobLineDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        jobLine={jobLine}
        onUpdate={() => {}}
      />
    </>
  );
}
