
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Trash2, Save, X, Package } from 'lucide-react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { updateWorkOrderPart, deleteWorkOrderPart } from '@/services/workOrder';
import { toast } from 'sonner';

interface PartsTableProps {
  parts: WorkOrderPart[];
  jobLines: WorkOrderJobLine[];
  onPartsChange: () => Promise<void>;
  isEditMode?: boolean;
}

interface EditingPart {
  id: string;
  name: string;
  part_number: string;
  quantity: number;
  unit_price: number;
  status: string;
  job_line_id?: string;
}

export function PartsTable({ parts, jobLines, onPartsChange, isEditMode = false }: PartsTableProps) {
  const [editingPart, setEditingPart] = useState<EditingPart | null>(null);

  const handleEdit = (part: WorkOrderPart) => {
    setEditingPart({
      id: part.id,
      name: part.name,
      part_number: part.part_number,
      quantity: part.quantity,
      unit_price: part.unit_price,
      status: part.status || 'pending',
      job_line_id: part.job_line_id || undefined
    });
  };

  const handleSave = async () => {
    if (!editingPart) return;

    try {
      await updateWorkOrderPart(editingPart.id, {
        name: editingPart.name,
        part_number: editingPart.part_number,
        quantity: editingPart.quantity,
        unit_price: editingPart.unit_price,
        status: editingPart.status,
        job_line_id: editingPart.job_line_id === 'none' ? undefined : editingPart.job_line_id
      });
      
      setEditingPart(null);
      await onPartsChange();
      toast.success('Part updated successfully');
    } catch (error) {
      console.error('Error updating part:', error);
      toast.error('Failed to update part');
    }
  };

  const handleDelete = async (partId: string) => {
    if (!confirm('Are you sure you want to delete this part?')) return;

    try {
      await deleteWorkOrderPart(partId);
      await onPartsChange();
      toast.success('Part deleted successfully');
    } catch (error) {
      console.error('Error deleting part:', error);
      toast.error('Failed to delete part');
    }
  };

  const handleCancel = () => {
    setEditingPart(null);
  };

  const getJobLineName = (jobLineId?: string) => {
    if (!jobLineId) return 'Unassigned';
    const jobLine = jobLines.find(jl => jl.id === jobLineId);
    return jobLine ? jobLine.name : 'Unknown Job Line';
  };

  if (parts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No parts added yet</p>
        {isEditMode && <p className="text-sm">Click "Add Part" to get started</p>}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Part Name</TableHead>
            <TableHead>Part Number</TableHead>
            <TableHead>Job Line</TableHead>
            <TableHead>Qty</TableHead>
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
                {editingPart?.id === part.id ? (
                  <Input
                    value={editingPart.name}
                    onChange={(e) => setEditingPart({ ...editingPart, name: e.target.value })}
                    className="w-full"
                  />
                ) : (
                  <div>
                    <div className="font-medium">{part.name}</div>
                    {part.description && (
                      <div className="text-sm text-muted-foreground">{part.description}</div>
                    )}
                  </div>
                )}
              </TableCell>
              
              <TableCell>
                {editingPart?.id === part.id ? (
                  <Input
                    value={editingPart.part_number}
                    onChange={(e) => setEditingPart({ ...editingPart, part_number: e.target.value })}
                    className="w-full"
                  />
                ) : (
                  part.part_number
                )}
              </TableCell>
              
              <TableCell>
                {editingPart?.id === part.id ? (
                  <Select
                    value={editingPart.job_line_id || 'none'}
                    onValueChange={(value) => setEditingPart({ ...editingPart, job_line_id: value === 'none' ? undefined : value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {jobLines.map((jobLine) => (
                        <SelectItem key={jobLine.id} value={jobLine.id}>
                          {jobLine.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-sm">{getJobLineName(part.job_line_id)}</span>
                )}
              </TableCell>
              
              <TableCell>
                {editingPart?.id === part.id ? (
                  <Input
                    type="number"
                    value={editingPart.quantity}
                    onChange={(e) => setEditingPart({ ...editingPart, quantity: parseInt(e.target.value) || 0 })}
                    className="w-20"
                  />
                ) : (
                  part.quantity
                )}
              </TableCell>
              
              <TableCell>
                {editingPart?.id === part.id ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={editingPart.unit_price}
                    onChange={(e) => setEditingPart({ ...editingPart, unit_price: parseFloat(e.target.value) || 0 })}
                    className="w-24"
                  />
                ) : (
                  `$${part.unit_price.toFixed(2)}`
                )}
              </TableCell>
              
              <TableCell className="font-medium">
                ${(editingPart?.id === part.id 
                  ? editingPart.quantity * editingPart.unit_price 
                  : part.total_price
                ).toFixed(2)}
              </TableCell>
              
              <TableCell>
                {editingPart?.id === part.id ? (
                  <Select
                    value={editingPart.status}
                    onValueChange={(value) => setEditingPart({ ...editingPart, status: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="ordered">Ordered</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="installed">Installed</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant={part.status === 'installed' ? 'default' : 'secondary'}>
                    {part.status || 'pending'}
                  </Badge>
                )}
              </TableCell>
              
              {isEditMode && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    {editingPart?.id === part.id ? (
                      <>
                        <Button size="sm" onClick={handleSave} className="h-8 w-8 p-0">
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel} className="h-8 w-8 p-0">
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(part)} className="h-8 w-8 p-0">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDelete(part.id)} 
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
