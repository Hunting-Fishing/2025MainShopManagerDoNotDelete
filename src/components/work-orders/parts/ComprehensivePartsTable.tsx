
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { WorkOrderPart, WorkOrderPartFormValues, WORK_ORDER_PART_STATUSES, PART_TYPES } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { createWorkOrderPart, updateWorkOrderPart, deleteWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface ComprehensivePartsTableProps {
  workOrderId: string;
  parts: WorkOrderPart[];
  jobLines: WorkOrderJobLine[];
  onPartsChange: () => Promise<void>;
  isEditMode?: boolean;
}

const initialFormState: WorkOrderPartFormValues = {
  name: '',
  part_number: '',
  description: '',
  quantity: 1,
  unit_price: 0,
  status: 'pending',
  notes: '',
  part_type: 'inventory',
  category: '',
  customerPrice: 0,
  supplierCost: 0,
  retailPrice: 0,
  isStockItem: false,
  isTaxable: true,
  coreChargeAmount: 0,
  coreChargeApplied: false,
  supplierName: '',
  warrantyDuration: ''
};

export function ComprehensivePartsTable({
  workOrderId,
  parts,
  jobLines,
  onPartsChange,
  isEditMode = false
}: ComprehensivePartsTableProps) {
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const [formData, setFormData] = useState<WorkOrderPartFormValues>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate total price whenever quantity or unit_price changes
  const calculateTotalPrice = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const handleFormChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Update customerPrice when unit_price changes for consistency
      if (field === 'unit_price') {
        updated.customerPrice = value;
      }
      
      return updated;
    });
  };

  const handleAddPart = async () => {
    if (!formData.name || !formData.part_number || !formData.part_type) {
      toast.error('Please fill in all required fields (Name, Part Number, and Part Type)');
      return;
    }

    setIsLoading(true);
    try {
      await createWorkOrderPart(formData, workOrderId);
      toast.success('Part added successfully');
      setFormData(initialFormState);
      setIsAddingPart(false);
      await onPartsChange();
    } catch (error) {
      console.error('Error adding part:', error);
      toast.error('Failed to add part');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPart = (part: WorkOrderPart) => {
    setEditingPartId(part.id);
    setFormData({
      name: part.name,
      part_number: part.part_number,
      description: part.description || '',
      quantity: part.quantity,
      unit_price: part.unit_price,
      status: part.status || 'pending',
      notes: part.notes || '',
      job_line_id: part.job_line_id,
      part_type: part.partType || 'inventory',
      category: part.category || '',
      customerPrice: part.customerPrice || part.unit_price,
      supplierCost: part.supplierCost || 0,
      retailPrice: part.retailPrice || 0,
      isStockItem: part.isStockItem || false,
      isTaxable: part.isTaxable !== undefined ? part.isTaxable : true,
      coreChargeAmount: part.coreChargeAmount || 0,
      coreChargeApplied: part.coreChargeApplied || false,
      supplierName: part.supplierName || '',
      warrantyDuration: part.warrantyDuration || ''
    });
  };

  const handleUpdatePart = async () => {
    if (!editingPartId || !formData.name || !formData.part_number) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await updateWorkOrderPart(editingPartId, formData);
      toast.success('Part updated successfully');
      setEditingPartId(null);
      setFormData(initialFormState);
      await onPartsChange();
    } catch (error) {
      console.error('Error updating part:', error);
      toast.error('Failed to update part');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePart = async (partId: string) => {
    if (!confirm('Are you sure you want to delete this part?')) return;

    setIsLoading(true);
    try {
      await deleteWorkOrderPart(partId);
      toast.success('Part deleted successfully');
      await onPartsChange();
    } catch (error) {
      console.error('Error deleting part:', error);
      toast.error('Failed to delete part');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setIsAddingPart(false);
    setEditingPartId(null);
  };

  const renderPartForm = () => (
    <div className="grid gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Part Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            placeholder="Enter part name"
          />
        </div>
        
        <div>
          <Label htmlFor="part_number">Part Number *</Label>
          <Input
            id="part_number"
            value={formData.part_number}
            onChange={(e) => handleFormChange('part_number', e.target.value)}
            placeholder="Enter part number"
          />
        </div>

        <div>
          <Label htmlFor="part_type">Part Type *</Label>
          <Select value={formData.part_type} onValueChange={(value) => handleFormChange('part_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select part type" />
            </SelectTrigger>
            <SelectContent>
              {PART_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === 'inventory' ? 'Inventory Item' : 'Non-Inventory Item'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => handleFormChange('quantity', parseInt(e.target.value) || 1)}
          />
        </div>

        <div>
          <Label htmlFor="unit_price">Unit Price</Label>
          <Input
            id="unit_price"
            type="number"
            min="0"
            step="0.01"
            value={formData.unit_price}
            onChange={(e) => handleFormChange('unit_price', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div>
          <Label>Total Price</Label>
          <Input
            value={`$${calculateTotalPrice(formData.quantity, formData.unit_price).toFixed(2)}`}
            disabled
            className="bg-gray-100"
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleFormChange('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {WORK_ORDER_PART_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="job_line_id">Job Line</Label>
          <Select value={formData.job_line_id || ''} onValueChange={(value) => handleFormChange('job_line_id', value || undefined)}>
            <SelectTrigger>
              <SelectValue placeholder="Select job line (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No Job Line</SelectItem>
              {jobLines.map((jobLine) => (
                <SelectItem key={jobLine.id} value={jobLine.id}>
                  {jobLine.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category || ''}
            onChange={(e) => handleFormChange('category', e.target.value)}
            placeholder="Enter category"
          />
        </div>

        <div>
          <Label htmlFor="supplierName">Supplier</Label>
          <Input
            id="supplierName"
            value={formData.supplierName || ''}
            onChange={(e) => handleFormChange('supplierName', e.target.value)}
            placeholder="Enter supplier name"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isStockItem"
            checked={formData.isStockItem || false}
            onCheckedChange={(checked) => handleFormChange('isStockItem', checked)}
          />
          <Label htmlFor="isStockItem">Stock Item</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isTaxable"
            checked={formData.isTaxable !== undefined ? formData.isTaxable : true}
            onCheckedChange={(checked) => handleFormChange('isTaxable', checked)}
          />
          <Label htmlFor="isTaxable">Taxable</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => handleFormChange('description', e.target.value)}
          placeholder="Enter part description"
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => handleFormChange('notes', e.target.value)}
          placeholder="Enter notes"
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={editingPartId ? handleUpdatePart : handleAddPart}
          disabled={isLoading}
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : editingPartId ? 'Update Part' : 'Add Part'}
        </Button>
        <Button variant="outline" onClick={resetForm} disabled={isLoading}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {isEditMode && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Parts & Materials</h3>
          {!isAddingPart && !editingPartId && (
            <Button onClick={() => setIsAddingPart(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Part
            </Button>
          )}
        </div>
      )}

      {(isAddingPart || editingPartId) && renderPartForm()}

      {parts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No parts added yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">Part Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Part Number</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Quantity</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Unit Price</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Total</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Job Line</th>
                {isEditMode && <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {parts.map((part) => (
                <tr key={part.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{part.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{part.part_number}</td>
                  <td className="border border-gray-300 px-4 py-2">{part.quantity}</td>
                  <td className="border border-gray-300 px-4 py-2">${part.unit_price.toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2">${part.total_price.toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      part.status === 'installed' ? 'bg-green-100 text-green-800' :
                      part.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      part.status === 'ordered' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {part.status || 'pending'}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {part.job_line_id ? 
                      jobLines.find(jl => jl.id === part.job_line_id)?.name || 'Unknown Job Line' : 
                      'No Job Line'
                    }
                  </td>
                  {isEditMode && (
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPart(part)}
                          disabled={isLoading || editingPartId === part.id}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeletePart(part.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {parts.length > 0 && (
        <div className="text-right">
          <strong>
            Total Parts Value: ${parts.reduce((sum, part) => sum + part.total_price, 0).toFixed(2)}
          </strong>
        </div>
      )}
    </div>
  );
}
