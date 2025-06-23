import React, { useState } from 'react';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Package, Plus, Edit, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AddPartDialog } from './AddPartDialog';
import { EditPartDialog } from './EditPartDialog';
import { deleteWorkOrderPart, updateWorkOrderPart } from '@/services/workOrder';
import { toast } from 'sonner';

interface ComprehensivePartsTableProps {
  workOrderId: string;
  parts: WorkOrderPart[];
  jobLines: WorkOrderJobLine[];
  onPartsChange: () => Promise<void>;
  isEditMode: boolean;
}

export function ComprehensivePartsTable({
  workOrderId,
  parts,
  jobLines,
  onPartsChange,
  isEditMode
}: ComprehensivePartsTableProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPart, setEditingPart] = useState<WorkOrderPart | null>(null);

  const handlePartAdded = async () => {
    console.log('Part added, refreshing data...');
    await onPartsChange();
    setShowAddDialog(false);
  };

  const handlePartUpdated = async () => {
    console.log('Part updated, refreshing data...');
    await onPartsChange();
    setEditingPart(null);
  };

  const handleDeletePart = async (partId: string) => {
    try {
      await deleteWorkOrderPart(partId);
      toast.success('Part deleted successfully');
      await onPartsChange();
    } catch (error) {
      console.error('Error deleting part:', error);
      toast.error('Failed to delete part');
    }
  };

  const handleEditPart = (part: WorkOrderPart) => {
    setEditingPart(part);
  };

  const handleQuickUpdate = async (partId: string, field: string, value: any) => {
    try {
      const updateData: Partial<WorkOrderPartFormValues> = {};
      
      if (field === 'quantity') {
        updateData.quantity = parseInt(value) || 0;
      } else if (field === 'unit_price') {
        updateData.unit_price = parseFloat(value) || 0;
      } else if (field === 'status') {
        updateData.status = value;
      } else if (field === 'job_line_id') {
        updateData.job_line_id = value || undefined;
      }

      await updateWorkOrderPart(partId, updateData);
      toast.success('Part updated successfully');
      await onPartsChange();
    } catch (error) {
      console.error('Error updating part:', error);
      toast.error('Failed to update part');
    }
  };

  // Helper function to format the status
  const formatStatus = (status: string | undefined) => {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Helper function to find job line name
  const getJobLineName = (jobLineId: string | undefined) => {
    return jobLines.find(jl => jl.id === jobLineId)?.name || 'Unassigned';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          <h3 className="text-lg font-medium">Parts Management</h3>
          <Badge variant="outline">{parts.length} parts</Badge>
        </div>
        {isEditMode && (
          <Button
            onClick={() => setShowAddDialog(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Part
          </Button>
        )}
      </div>

      {/* Parts Table */}
      {parts.length === 0 ? (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No parts added yet</p>
            <p>Add parts to track inventory and costs for this work order</p>
          </div>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part Details</TableHead>
                <TableHead>Job Line</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                {isEditMode && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {parts.map((part) => (
                <TableRow key={part.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{part.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Part #: {part.part_number}
                      </div>
                      {part.description && (
                        <div className="text-sm text-muted-foreground">
                          {part.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {isEditMode ? (
                      <Select
                        value={part.job_line_id || ''}
                        onValueChange={(value) => handleQuickUpdate(part.id, 'job_line_id', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Unassigned</SelectItem>
                          {jobLines.map((jobLine) => (
                            <SelectItem key={jobLine.id} value={jobLine.id}>
                              {jobLine.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span>
                        {jobLines.find(jl => jl.id === part.job_line_id)?.name || 'Unassigned'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditMode ? (
                      <Input
                        type="number"
                        min="0"
                        value={part.quantity}
                        onChange={(e) => handleQuickUpdate(part.id, 'quantity', e.target.value)}
                        className="w-20"
                      />
                    ) : (
                      part.quantity
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditMode ? (
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={part.unit_price}
                        onChange={(e) => handleQuickUpdate(part.id, 'unit_price', e.target.value)}
                        className="w-24"
                      />
                    ) : (
                      `$${(part.unit_price || 0).toFixed(2)}`
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      ${part.total_price.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {isEditMode ? (
                      <Select
                        value={part.status || 'pending'}
                        onValueChange={(value) => handleQuickUpdate(part.id, 'status', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="ordered">Ordered</SelectItem>
                          <SelectItem value="received">Received</SelectItem>
                          <SelectItem value="installed">Installed</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline">{part.status}</Badge>
                    )}
                  </TableCell>
                  {isEditMode && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPart(part)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePart(part.id)}
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
        </Card>
      )}

      {/* Add Part Dialog */}
      <AddPartDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        workOrderId={workOrderId}
        jobLines={jobLines}
        onPartAdded={handlePartAdded}
      />

      {/* Edit Part Dialog */}
      <EditPartDialog
        open={!!editingPart}
        onOpenChange={(open) => !open && setEditingPart(null)}
        part={editingPart!}
        jobLines={jobLines}
        onSave={handlePartUpdated}
      />
    </div>
  );
}
