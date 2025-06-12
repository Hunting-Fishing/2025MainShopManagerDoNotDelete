
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Edit, Trash2, Plus, Package } from 'lucide-react';
import { JobLineEditDialog } from './JobLineEditDialog';
import { AddPartsDialog } from '../parts/AddPartsDialog';
import { PartDetailsCard } from '../parts/PartDetailsCard';
import { jobLineStatusMap } from '@/types/jobLine';
import { getJobLineParts } from '@/services/workOrder/workOrderPartsService';

interface JobLineCardProps {
  jobLine: WorkOrderJobLine;
  onUpdate?: (jobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  onPartsChange?: (parts: WorkOrderPart[]) => void;
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
  const [isAddPartsOpen, setIsAddPartsOpen] = useState(false);
  const [jobLineParts, setJobLineParts] = useState<WorkOrderPart[]>([]);

  // Filter parts that belong to this job line
  const associatedParts = parts.filter(part => part.job_line_id === jobLine.id);

  useEffect(() => {
    const fetchJobLineParts = async () => {
      try {
        const fetchedParts = await getJobLineParts(jobLine.id);
        setJobLineParts(fetchedParts);
      } catch (error) {
        console.error('Error fetching job line parts:', error);
      }
    };

    if (jobLine.id) {
      fetchJobLineParts();
    }
  }, [jobLine.id]);

  // Combine parts from props and fetched parts, removing duplicates
  const allJobLineParts = [...associatedParts, ...jobLineParts.filter(
    part => !associatedParts.some(aPart => aPart.id === part.id)
  )];

  const handleSave = async (updatedJobLine: WorkOrderJobLine) => {
    if (onUpdate) {
      await onUpdate(updatedJobLine);
    }
  };

  const handlePartAdded = (newPart: WorkOrderPart) => {
    setJobLineParts(prev => [...prev, newPart]);
    if (onPartsChange) {
      onPartsChange([...parts, newPart]);
    }
  };

  const handlePartUpdate = (updatedPart: WorkOrderPart) => {
    setJobLineParts(prev => prev.map(p => p.id === updatedPart.id ? updatedPart : p));
    if (onPartUpdate) {
      onPartUpdate(updatedPart);
    }
  };

  const handlePartRemove = (partId: string) => {
    setJobLineParts(prev => prev.filter(p => p.id !== partId));
    if (onPartRemove) {
      onPartRemove(partId);
    }
  };

  // Calculate totals with proper null checks
  const laborTotal = (jobLine.estimated_hours || 0) * (jobLine.labor_rate || 0);
  const partsTotal = allJobLineParts.reduce((sum, part) => {
    const quantity = part.quantity || 0;
    const price = part.customer_price || part.unit_price || 0;
    return sum + (quantity * price);
  }, 0);
  const jobLineTotal = laborTotal + partsTotal;

  const statusInfo = jobLineStatusMap[jobLine.status || 'pending'];

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">{jobLine.name}</CardTitle>
              <Badge className={statusInfo?.classes || 'bg-gray-100 text-gray-800'}>
                {statusInfo?.label || 'Unknown'}
              </Badge>
            </div>
            
            {isEditMode && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddPartsOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Parts
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(jobLine.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {jobLine.description && (
            <p className="text-sm text-muted-foreground mt-2">
              {jobLine.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          {/* Labor Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <span className="text-sm text-muted-foreground">Estimated Hours</span>
              <p className="font-medium">{(jobLine.estimated_hours || 0).toFixed(1)}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Labor Rate</span>
              <p className="font-medium">${(jobLine.labor_rate || 0).toFixed(2)}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Labor Total</span>
              <p className="font-medium">${laborTotal.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Job Line Total</span>
              <p className="font-semibold text-lg">${jobLineTotal.toFixed(2)}</p>
            </div>
          </div>

          {/* Parts Section */}
          {allJobLineParts.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Parts ({allJobLineParts.length})
                  </span>
                  <span className="text-sm text-muted-foreground">
                    - Total: ${partsTotal.toFixed(2)}
                  </span>
                </div>
                
                {allJobLineParts.map((part) => (
                  <PartDetailsCard
                    key={part.id}
                    part={part}
                    onUpdate={handlePartUpdate}
                    onRemove={handlePartRemove}
                    isEditMode={isEditMode}
                    compact={true}
                  />
                ))}
              </div>
            </>
          )}

          {jobLine.notes && (
            <>
              <Separator className="my-4" />
              <div>
                <span className="text-sm text-muted-foreground">Notes</span>
                <p className="text-sm mt-1">{jobLine.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <JobLineEditDialog
        jobLine={jobLine}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSave}
      />

      {/* Add Parts Dialog */}
      <AddPartsDialog
        open={isAddPartsOpen}
        onOpenChange={setIsAddPartsOpen}
        workOrderId={jobLine.work_order_id}
        jobLineId={jobLine.id}
        onPartAdded={handlePartAdded}
      />
    </>
  );
}
