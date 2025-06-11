
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Plus, Clock, DollarSign } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { DroppableJobLinePartsSection } from '../parts/DroppableJobLinePartsSection';
import { AddPartsDialog } from '../parts/AddPartsDialog';
import { JobLineDialog } from './JobLineDialog';
import { EditPartDialog } from '../parts/EditPartDialog';

interface JobLineCardProps {
  jobLine: WorkOrderJobLine;
  isEditMode?: boolean;
  onUpdate?: (updatedJobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  onPartsChange?: (newParts: WorkOrderPart[]) => void;
}

export function JobLineCard({
  jobLine,
  isEditMode = false,
  onUpdate,
  onDelete,
  onPartsChange
}: JobLineCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddPartsDialog, setShowAddPartsDialog] = useState(false);
  const [editingPart, setEditingPart] = useState<WorkOrderPart | null>(null);

  const handleUpdate = (updatedJobLine: WorkOrderJobLine) => {
    onUpdate?.(updatedJobLine);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this job line?')) {
      onDelete?.(jobLine.id);
    }
  };

  const handleRemovePart = (partId: string) => {
    if (!onPartsChange) return;
    const updatedParts = (jobLine.parts || []).filter(part => part.id !== partId);
    onPartsChange(updatedParts);
  };

  const handleEditPart = (part: WorkOrderPart) => {
    setEditingPart(part);
  };

  const handlePartUpdated = () => {
    setEditingPart(null);
    // Refresh parts data would happen here in a real implementation
  };

  const handlePartsAdded = () => {
    setShowAddPartsDialog(false);
    // Refresh parts data would happen here in a real implementation
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <>
      <Card className="border border-slate-200 hover:border-slate-300 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900">{jobLine.name}</h3>
              {jobLine.description && (
                <p className="text-sm text-slate-600 mt-1">{jobLine.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2">
                {jobLine.category && (
                  <span className="text-xs text-slate-500">
                    {jobLine.category}
                    {jobLine.subcategory && ` • ${jobLine.subcategory}`}
                  </span>
                )}
                <Badge variant="secondary" className={getStatusColor(jobLine.status)}>
                  {jobLine.status.replace('-', ' ')}
                </Badge>
              </div>
            </div>
            
            {isEditMode && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditDialog(true)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Job Line Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Estimated Hours</p>
                <p className="text-sm font-medium">{jobLine.estimatedHours || 0}h</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Labor Rate</p>
                <p className="text-sm font-medium">{formatCurrency(jobLine.laborRate || 0)}/h</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Total Amount</p>
                <p className="text-sm font-medium">{formatCurrency(jobLine.totalAmount || 0)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <p className="text-xs text-slate-500">Parts Count</p>
                <p className="text-sm font-medium">{jobLine.parts?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Parts Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-slate-700">Parts & Materials</h4>
              {isEditMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddPartsDialog(true)}
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Parts
                </Button>
              )}
            </div>
            
            <DroppableJobLinePartsSection
              jobLineId={jobLine.id}
              parts={jobLine.parts || []}
              onRemovePart={isEditMode ? handleRemovePart : undefined}
              onEditPart={isEditMode ? handleEditPart : undefined}
              isEditMode={isEditMode}
            />
          </div>

          {jobLine.notes && (
            <div className="border-t pt-3">
              <p className="text-xs text-slate-500 mb-1">Notes</p>
              <p className="text-sm text-slate-700">{jobLine.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Job Line Dialog */}
      {showEditDialog && (
        <JobLineDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          jobLine={jobLine}
          onUpdate={handleUpdate}
        />
      )}

      {/* Add Parts Dialog */}
      {showAddPartsDialog && (
        <AddPartsDialog
          workOrderId={jobLine.workOrderId || ''}
          jobLineId={jobLine.id}
          open={showAddPartsDialog}
          onOpenChange={setShowAddPartsDialog}
          onPartsAdd={handlePartsAdded}
        />
      )}

      {/* Edit Part Dialog */}
      {editingPart && (
        <EditPartDialog
          open={true}
          onOpenChange={() => setEditingPart(null)}
          part={editingPart}
          onSave={handlePartUpdated}
        />
      )}
    </>
  );
}
