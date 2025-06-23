
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, Package } from 'lucide-react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { AddPartDialog } from './AddPartDialog';
import { EditPartDialog } from './EditPartDialog';
import { ViewPartDetailsDialog } from './ViewPartDetailsDialog';
import { partStatusMap } from '@/types/workOrderPart';
import { PartsFormValidator } from '@/utils/partsErrorHandler';
import { deleteWorkOrderPart } from '@/services/workOrder/workOrderPartsService';

interface ComprehensivePartsTableProps {
  workOrderId: string;
  parts: WorkOrderPart[];
  jobLines: WorkOrderJobLine[];
  onPartsChange: () => Promise<void>;
  isEditMode?: boolean;
}

export function ComprehensivePartsTable({
  workOrderId,
  parts,
  jobLines,
  onPartsChange,
  isEditMode = false
}: ComprehensivePartsTableProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedPart, setSelectedPart] = useState<WorkOrderPart | null>(null);

  const handleEdit = (part: WorkOrderPart) => {
    setSelectedPart(part);
    setShowEditDialog(true);
  };

  const handleView = (part: WorkOrderPart) => {
    setSelectedPart(part);
    setShowViewDialog(true);
  };

  const handleDelete = async (partId: string) => {
    try {
      await deleteWorkOrderPart(partId);
      PartsFormValidator.showSuccessToast('Part deleted successfully');
      await onPartsChange();
    } catch (error) {
      const errorMessage = PartsFormValidator.handleApiError(error);
      PartsFormValidator.showErrorToast(errorMessage);
    }
  };

  const handlePartAdded = async () => {
    setShowAddDialog(false);
    await onPartsChange();
  };

  const handlePartUpdated = async () => {
    setShowEditDialog(false);
    setSelectedPart(null);
    await onPartsChange();
  };

  const getJobLineName = (jobLineId?: string) => {
    if (!jobLineId) return 'Unassigned';
    const jobLine = jobLines.find(jl => jl.id === jobLineId);
    return jobLine?.name || 'Unknown Job Line';
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = partStatusMap[status] || { label: status, classes: 'bg-gray-100 text-gray-800' };
    return (
      <Badge className={`${statusInfo.classes} text-xs`}>
        {statusInfo.label}
      </Badge>
    );
  };

  if (parts.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500 mb-4">No parts added yet</p>
        {isEditMode && (
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Part
          </Button>
        )}
        
        <AddPartDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          workOrderId={workOrderId}
          jobLines={jobLines}
          onPartAdded={handlePartAdded}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isEditMode && (
        <div className="flex justify-end">
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Part
          </Button>
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Part Details</TableHead>
              <TableHead>Job Line</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              {isEditMode && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {parts.map((part) => (
              <TableRow key={part.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{part.name}</div>
                    <div className="text-sm text-gray-500">{part.part_number}</div>
                    {part.description && (
                      <div className="text-sm text-gray-400 mt-1">{part.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{getJobLineName(part.job_line_id)}</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{part.quantity}</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">${(part.unit_price || 0).toFixed(2)}</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">${part.total_price.toFixed(2)}</span>
                </TableCell>
                <TableCell>
                  {getStatusBadge(part.status || 'pending')}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {part.part_type || 'Standard'}
                  </Badge>
                </TableCell>
                {isEditMode && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(part)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(part)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(part.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AddPartDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        workOrderId={workOrderId}
        jobLines={jobLines}
        onPartAdded={handlePartAdded}
      />

      <EditPartDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        part={selectedPart}
        onPartUpdated={handlePartUpdated}
      />

      <ViewPartDetailsDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        part={selectedPart}
      />
    </div>
  );
}
