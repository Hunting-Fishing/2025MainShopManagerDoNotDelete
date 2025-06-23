
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit, Plus, Save, X } from 'lucide-react';
import { WorkOrderPart, WorkOrderPartFormValues, partStatusMap } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { createWorkOrderPart, updateWorkOrderPart, deleteWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from '@/hooks/use-toast';

interface ComprehensivePartsTableProps {
  workOrderId: string;
  parts: WorkOrderPart[];
  jobLines: WorkOrderJobLine[];
  onPartsChange: () => Promise<void>;
  isEditMode?: boolean;
}

const initialFormData: WorkOrderPartFormValues = {
  name: '',
  part_number: '',
  description: '',
  quantity: 1,
  unit_price: 0,
  status: 'pending',
  notes: ''
};

export function ComprehensivePartsTable({ 
  workOrderId, 
  parts, 
  jobLines,
  onPartsChange, 
  isEditMode = false 
}: ComprehensivePartsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<WorkOrderPartFormValues>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);

  const calculateTotalPrice = (quantity: number, unitPrice: number): number => {
    return quantity * unitPrice;
  };

  const handleEdit = (part: WorkOrderPart) => {
    setEditingId(part.id);
    setFormData({
      name: part.name,
      part_number: part.part_number,
      description: part.description || '',
      quantity: part.quantity,
      unit_price: part.unit_price,
      status: part.status || 'pending',
      notes: part.notes || '',
      job_line_id: part.job_line_id
    });
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData(initialFormData);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData(initialFormData);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      if (isAdding) {
        await createWorkOrderPart(formData, workOrderId);
        toast({
          title: "Success",
          description: "Part added successfully",
        });
      } else if (editingId) {
        await updateWorkOrderPart(editingId, formData);
        toast({
          title: "Success",
          description: "Part updated successfully",
        });
      }
      
      await onPartsChange();
      handleCancel();
    } catch (error) {
      console.error('Error saving part:', error);
      toast({
        title: "Error",
        description: "Failed to save part",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (partId: string) => {
    try {
      setIsLoading(true);
      await deleteWorkOrderPart(partId);
      toast({
        title: "Success",
        description: "Part deleted successfully",
      });
      await onPartsChange();
    } catch (error) {
      console.error('Error deleting part:', error);
      toast({
        title: "Error",
        description: "Failed to delete part",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getJobLineName = (jobLineId?: string) => {
    if (!jobLineId) return 'Unassigned';
    const jobLine = jobLines.find(jl => jl.id === jobLineId);
    return jobLine ? jobLine.name : 'Unknown Job Line';
  };

  const renderEditRow = (part?: WorkOrderPart) => {
    const currentTotalPrice = calculateTotalPrice(formData.quantity, formData.unit_price);
    
    return (
      <TableRow key={part?.id || 'new'}>
        <TableCell>
          <Input
            value={formData.part_number}
            onChange={(e) => handleInputChange('part_number', e.target.value)}
            placeholder="Part Number"
          />
        </TableCell>
        <TableCell>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Part Name"
          />
        </TableCell>
        <TableCell>
          <Input
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Description"
          />
        </TableCell>
        <TableCell>
          <Input
            type="number"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
            min="1"
          />
        </TableCell>
        <TableCell>
          <Input
            type="number"
            step="0.01"
            value={formData.unit_price}
            onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value) || 0)}
            min="0"
          />
        </TableCell>
        <TableCell>
          ${currentTotalPrice.toFixed(2)}
        </TableCell>
        <TableCell>
          <Select
            value={formData.status || 'pending'}
            onValueChange={(value) => handleInputChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(partStatusMap).map(([key, status]) => (
                <SelectItem key={key} value={key}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell>
          <Select
            value={formData.job_line_id || ''}
            onValueChange={(value) => handleInputChange('job_line_id', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select job line" />
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
        </TableCell>
        <TableCell>
          <Input
            value={formData.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Notes"
          />
        </TableCell>
        <TableCell>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={isLoading || !formData.name || !formData.part_number}
            >
              <Save className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-4">
      {isEditMode && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Parts & Materials</h3>
          <Button onClick={handleAdd} disabled={isAdding || editingId !== null}>
            <Plus className="h-4 w-4 mr-2" />
            Add Part
          </Button>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Part Number</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Job Line</TableHead>
              <TableHead>Notes</TableHead>
              {isEditMode && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {parts.map((part) => {
              if (editingId === part.id) {
                return renderEditRow(part);
              }

              return (
                <TableRow key={part.id}>
                  <TableCell className="font-mono text-sm">{part.part_number}</TableCell>
                  <TableCell className="font-medium">{part.name}</TableCell>
                  <TableCell>{part.description}</TableCell>
                  <TableCell>{part.quantity}</TableCell>
                  <TableCell>${part.unit_price.toFixed(2)}</TableCell>
                  <TableCell className="font-semibold">${part.total_price.toFixed(2)}</TableCell>
                  <TableCell>
                    {part.status && partStatusMap[part.status] ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${partStatusMap[part.status].classes}`}>
                        {partStatusMap[part.status].label}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {part.status || 'Unknown'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{getJobLineName(part.job_line_id)}</TableCell>
                  <TableCell>{part.notes}</TableCell>
                  {isEditMode && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEdit(part)}
                          disabled={editingId !== null || isAdding}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDelete(part.id)}
                          disabled={editingId !== null || isAdding || isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            
            {isAdding && renderEditRow()}
            
            {parts.length === 0 && !isAdding && (
              <TableRow>
                <TableCell colSpan={isEditMode ? 10 : 9} className="text-center py-8 text-muted-foreground">
                  No parts added yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {parts.length > 0 && (
        <div className="flex justify-end">
          <div className="text-lg font-semibold">
            Total Parts Value: ${parts.reduce((sum, part) => sum + part.total_price, 0).toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}
