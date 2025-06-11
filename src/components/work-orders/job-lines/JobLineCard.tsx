import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus, Package } from 'lucide-react';
import { WorkOrderJobLine, jobLineStatusMap } from '@/types/jobLine';
import { AddPartsDialog } from '../parts/AddPartsDialog';
import { JobLinePartsDisplay } from '../parts/JobLinePartsDisplay';
import { deleteWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from 'sonner';
interface JobLineCardProps {
  jobLine: WorkOrderJobLine;
  onUpdate?: (jobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  onPartsUpdate?: () => void;
  isEditMode?: boolean;
}
export function JobLineCard({
  jobLine,
  onUpdate,
  onDelete,
  onPartsUpdate,
  isEditMode = false
}: JobLineCardProps) {
  const [addPartsDialogOpen, setAddPartsDialogOpen] = useState(false);
  const [localJobLine, setLocalJobLine] = useState(jobLine);
  useEffect(() => {
    setLocalJobLine(jobLine);
  }, [jobLine]);
  const handlePartsAdded = () => {
    setAddPartsDialogOpen(false);
    if (onPartsUpdate) {
      onPartsUpdate();
    }
    toast.success('Parts added successfully');
  };
  const handleRemovePart = async (partId: string) => {
    try {
      const success = await deleteWorkOrderPart(partId);
      if (success) {
        if (onPartsUpdate) {
          onPartsUpdate();
        }
        toast.success('Part removed successfully');
      } else {
        toast.error('Failed to remove part');
      }
    } catch (error) {
      console.error('Error removing part:', error);
      toast.error('Failed to remove part');
    }
  };
  const handleEditPart = (part: any) => {
    // TODO: Implement edit functionality
    console.log('Edit part:', part);
    toast.info('Edit functionality coming soon');
  };
  const calculateJobLineTotal = () => {
    const laborTotal = localJobLine.totalAmount || 0;
    const partsTotal = (localJobLine.parts || []).reduce((total, part) => total + part.customerPrice * part.quantity, 0);
    return laborTotal + partsTotal;
  };
  const partsCount = localJobLine.parts?.length || 0;
  const partsTotal = (localJobLine.parts || []).reduce((total, part) => total + part.customerPrice * part.quantity, 0);
  return <>
      <Card className="border-slate-200">
        <CardContent className="p-4 bg-sky-300">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{localJobLine.name}</h3>
                  <Badge variant="secondary" className={jobLineStatusMap[localJobLine.status]?.classes || 'bg-gray-100 text-gray-800'}>
                    {jobLineStatusMap[localJobLine.status]?.label || localJobLine.status}
                  </Badge>
                  {partsCount > 0 && <Badge variant="outline" className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {partsCount} part{partsCount !== 1 ? 's' : ''}
                    </Badge>}
                </div>
                
                {localJobLine.description && <p className="text-gray-600 text-sm mb-3">{localJobLine.description}</p>}

                {/* Job Line Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Hours:</span>
                    <div className="text-gray-900">{localJobLine.estimatedHours || 0}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Rate:</span>
                    <div className="text-gray-900">${(localJobLine.laborRate || 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Labor:</span>
                    <div className="text-gray-900">${(localJobLine.totalAmount || 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Total:</span>
                    <div className="text-gray-900 font-semibold">${calculateJobLineTotal().toFixed(2)}</div>
                  </div>
                </div>

                {/* Category/Subcategory */}
                {(localJobLine.category || localJobLine.subcategory) && <div className="mt-2 text-sm">
                    <span className="font-medium text-gray-600">Category:</span>
                    <span className="ml-1 text-gray-900">
                      {[localJobLine.category, localJobLine.subcategory].filter(Boolean).join(' > ')}
                    </span>
                  </div>}
              </div>

              {/* Actions */}
              {isEditMode && <div className="flex items-center gap-2 ml-4">
                  <Button variant="outline" size="sm" onClick={() => setAddPartsDialogOpen(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Parts
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onUpdate?.(localJobLine)} className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete?.(localJobLine.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>}
            </div>

            {/* Parts Section */}
            {partsCount > 0 ? <div className="border-t pt-4 bg-teal-400">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-700">Parts & Materials</h4>
                  <div className="text-sm text-gray-600">
                    Total: ${partsTotal.toFixed(2)}
                  </div>
                </div>
                <JobLinePartsDisplay parts={localJobLine.parts || []} onRemovePart={handleRemovePart} onEditPart={handleEditPart} isEditMode={isEditMode} />
              </div> : <div className="border-t pt-4">
                <div className="text-center py-4 text-gray-500">
                  <Package className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No parts added yet</p>
                  {isEditMode && <Button variant="outline" size="sm" onClick={() => setAddPartsDialogOpen(true)} className="mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Parts
                    </Button>}
                </div>
              </div>}

            {/* Notes */}
            {localJobLine.notes && <div className="border-t pt-4">
                <h4 className="font-medium text-gray-700 mb-2">Notes</h4>
                <p className="text-gray-600 text-sm">{localJobLine.notes}</p>
              </div>}
          </div>
        </CardContent>
      </Card>

      {isEditMode && <AddPartsDialog workOrderId={localJobLine.workOrderId || ''} jobLineId={localJobLine.id} onPartsAdd={handlePartsAdded} open={addPartsDialogOpen} onOpenChange={setAddPartsDialogOpen} />}
    </>;
}