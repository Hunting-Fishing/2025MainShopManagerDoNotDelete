import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Plus, Save, X } from 'lucide-react';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/workOrderJobLine';
import { toast } from 'sonner';
import { 
  createWorkOrderPart, 
  updateWorkOrderPart, 
  deleteWorkOrderPart 
} from '@/services/workOrder/workOrderPartsService';

interface EditPartState {
  id: string;
  isEditing: boolean;
}

const getEmptyFormData = (): WorkOrderPartFormValues => ({
  name: '',
  part_number: '',
  description: '',
  quantity: 1,
  unit_price: 0,
  total_price: 0,
  notes: '',
  job_line_id: ''
});

export interface ComprehensivePartsTableProps {
  workOrderId: string;
  parts: WorkOrderPart[];
  jobLines: WorkOrderJobLine[];
  onPartsChange: () => Promise<void>;
  isEditMode: boolean;
}

export const ComprehensivePartsTable: React.FC<ComprehensivePartsTableProps> = ({
  workOrderId,
  parts,
  jobLines,
  onPartsChange,
  isEditMode
}) => {
  const [editingPart, setEditingPart] = useState<WorkOrderPart | null>(null);
  const [newPart, setNewPart] = useState<WorkOrderPartFormValues>(getEmptyFormData());
  const [editStates, setEditStates] = useState<EditPartState[]>([]);

  useEffect(() => {
    // Initialize edit states for existing parts
    const initialEditStates = parts.map(part => ({
      id: part.id,
      isEditing: false,
    }));
    setEditStates(initialEditStates);
  }, [parts]);

  const handleEdit = (part: WorkOrderPart) => {
    setEditingPart(part);
    setNewPart({
      name: part.name,
      part_number: part.part_number,
      description: part.description || '',
      quantity: part.quantity,
      unit_price: part.unit_price,
      total_price: part.total_price,
      notes: part.notes || '',
      job_line_id: part.job_line_id || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingPart(null);
    setNewPart(getEmptyFormData());
  };

  const handleDelete = async (partId: string) => {
    try {
      await deleteWorkOrderPart(partId);
      toast.success('Part deleted successfully');
      await onPartsChange();
    } catch (error) {
      console.error('Error deleting part:', error);
      toast.error('Failed to delete part');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPart(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setNewPart(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (formData: WorkOrderPartFormValues) => {
    try {
      if (editingPart?.id) {
        // Update existing part
        await updateWorkOrderPart(editingPart.id, formData);
        toast.success('Part updated successfully');
      } else {
        // Create new part - use createWorkOrderPart instead of addWorkOrderPart
        await createWorkOrderPart(formData, workOrderId);
        toast.success('Part added successfully');
      }
      
      setEditingPart(null);
      setNewPart(getEmptyFormData());
      await onPartsChange();
    } catch (error) {
      console.error('Error saving part:', error);
      toast.error('Failed to save part');
    }
  };

  const isJobLineUsed = (jobLineId: string): boolean => {
    return parts.some(part => part.job_line_id === jobLineId);
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Part Number</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Total Price</TableHead>
            <TableHead>Job Line</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parts.map((part) => (
            <TableRow key={part.id}>
              <TableCell>{part.name}</TableCell>
              <TableCell>{part.part_number}</TableCell>
              <TableCell>{part.description}</TableCell>
              <TableCell>{part.quantity}</TableCell>
              <TableCell>{part.unit_price}</TableCell>
              <TableCell>{part.total_price}</TableCell>
              <TableCell>
                {jobLines.find(jobLine => jobLine.id === part.job_line_id)?.name || 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                {isEditMode && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(part)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(part.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {isEditMode && (
        <div className="mt-4 p-4 border rounded-md">
          <h3 className="text-lg font-semibold mb-4">
            {editingPart ? 'Edit Part' : 'Add New Part'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <Input
                type="text"
                name="name"
                value={newPart.name}
                onChange={handleInputChange}
                placeholder="Part Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Part Number</label>
              <Input
                type="text"
                name="part_number"
                value={newPart.part_number}
                onChange={handleInputChange}
                placeholder="Part Number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <Input
                type="number"
                name="quantity"
                value={newPart.quantity}
                onChange={handleInputChange}
                placeholder="Quantity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Unit Price</label>
              <Input
                type="number"
                name="unit_price"
                value={newPart.unit_price}
                onChange={handleInputChange}
                placeholder="Unit Price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Total Price</label>
              <Input
                type="number"
                name="total_price"
                value={newPart.total_price}
                onChange={handleInputChange}
                placeholder="Total Price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Job Line</label>
              <Select onValueChange={(value) => handleSelectChange(value, "job_line_id")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Job Line" />
                </SelectTrigger>
                <SelectContent>
                  {jobLines.map((jobLine) => (
                    <SelectItem key={jobLine.id} value={jobLine.id} disabled={isJobLineUsed(jobLine.id)}>
                      {jobLine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <Input
              name="description"
              value={newPart.description}
              onChange={handleInputChange}
              placeholder="Description"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <Input
              name="notes"
              value={newPart.notes}
              onChange={handleInputChange}
              placeholder="Notes"
            />
          </div>

          <div className="mt-6 flex justify-end">
            {editingPart && (
              <Button
                variant="ghost"
                className="mr-2"
                onClick={handleCancelEdit}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
            <Button onClick={() => handleSave(newPart)}>
              <Save className="h-4 w-4 mr-2" />
              {editingPart ? 'Update Part' : 'Add Part'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
