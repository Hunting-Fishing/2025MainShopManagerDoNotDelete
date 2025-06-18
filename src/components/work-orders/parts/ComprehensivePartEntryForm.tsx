
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategorySelector } from './CategorySelector';
import { WorkOrderJobLine } from '@/types/jobLine';
import { PartFormData } from './AddPartDialog';

export interface ComprehensivePartEntryFormProps {
  workOrderId: string;
  jobLines?: WorkOrderJobLine[];
  onFormSubmit: (formData: PartFormData) => Promise<void>;
  submitButtonText: string;
  isSubmitting: boolean;
}

export function ComprehensivePartEntryForm({
  workOrderId,
  jobLines = [],
  onFormSubmit,
  submitButtonText,
  isSubmitting
}: ComprehensivePartEntryFormProps) {
  const [formData, setFormData] = useState<PartFormData>({
    name: '',
    part_number: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    status: 'pending',
    notes: '',
    job_line_id: '',
    category: '',
    customerPrice: 0,
    supplierCost: 0,
    retailPrice: 0,
    markupPercentage: 0,
    isTaxable: false,
    coreChargeAmount: 0,
    coreChargeApplied: false,
    warrantyDuration: '',
    warrantyExpiryDate: '',
    installDate: '',
    installedBy: '',
    invoiceNumber: '',
    poLine: '',
    isStockItem: false,
    supplierName: '',
    supplierOrderRef: '',
    notesInternal: '',
    inventoryItemId: '',
    partType: '',
    estimatedArrivalDate: '',
    itemStatus: 'pending'
  });

  const handleInputChange = (field: keyof PartFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onFormSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Part Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                placeholder="Enter part name"
              />
            </div>
            <div>
              <Label htmlFor="part_number">Part Number *</Label>
              <Input
                id="part_number"
                value={formData.part_number}
                onChange={(e) => handleInputChange('part_number', e.target.value)}
                required
                placeholder="Enter part number"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter part description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                required
              />
            </div>
            <div>
              <Label htmlFor="unit_price">Unit Price *</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_price}
                onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="installed">Installed</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Line Assignment */}
      {jobLines && jobLines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Job Line Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="job_line_id">Assign to Job Line</Label>
              <Select value={formData.job_line_id} onValueChange={(value) => handleInputChange('job_line_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job line (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Assignment</SelectItem>
                  {jobLines.map((jobLine) => (
                    <SelectItem key={jobLine.id} value={jobLine.id}>
                      {jobLine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Selection */}
      <CategorySelector
        value={formData.category}
        onValueChange={(value) => handleInputChange('category', value)}
      />

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : submitButtonText}
        </Button>
      </div>
    </form>
  );
}
