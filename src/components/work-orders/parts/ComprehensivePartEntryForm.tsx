
import React, { useState } from 'react';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategorySelector } from './CategorySelector';
import { SupplierSelector } from './SupplierSelector';
import { StatusSelector } from '../shared/StatusSelector';
import { Loader2 } from 'lucide-react';

interface ComprehensivePartEntryFormProps {
  onPartAdd: (part: WorkOrderPartFormValues) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  workOrderId?: string;
  jobLineId?: string;
}

export function ComprehensivePartEntryForm({ 
  onPartAdd, 
  onCancel, 
  isLoading = false,
  workOrderId,
  jobLineId 
}: ComprehensivePartEntryFormProps) {
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    name: '',
    part_number: '',
    unit_price: 0,
    quantity: 1,
    status: 'pending',
    notes: '',
    // Use the correct database column names
    supplierName: '',
    supplierCost: 0,
    customerPrice: 0,
    retailPrice: 0,
    category: '',
    partType: '',
    markupPercentage: 0,
    isTaxable: true,
    coreChargeAmount: 0,
    coreChargeApplied: false,
    warrantyDuration: '',
    invoiceNumber: '',
    poLine: '',
    isStockItem: false,
    notesInternal: '',
    inventoryItemId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting part data:', formData);
    
    // Calculate customer price if not set
    const finalCustomerPrice = formData.customerPrice || formData.unit_price;
    
    const partData: WorkOrderPartFormValues = {
      ...formData,
      customerPrice: finalCustomerPrice,
      // Ensure we have the minimum required fields
      name: formData.name || 'Unnamed Part',
      part_number: formData.part_number || 'N/A',
      unit_price: formData.unit_price || 0,
      quantity: formData.quantity || 1,
      status: formData.status || 'pending'
    };

    onPartAdd(partData);
  };

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate customer price based on supplier cost and markup
      if (field === 'supplierCost' || field === 'markupPercentage') {
        const cost = field === 'supplierCost' ? value : prev.supplierCost || 0;
        const markup = field === 'markupPercentage' ? value : prev.markupPercentage || 0;
        if (cost > 0 && markup > 0) {
          updated.customerPrice = cost * (1 + markup / 100);
        }
      }
      
      return updated;
    });
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Part Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Part Number *</label>
              <Input
                value={formData.part_number}
                onChange={(e) => handleInputChange('part_number', e.target.value)}
                placeholder="Enter part number"
                required
                className="bg-white border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Part Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter part name"
                required
                className="bg-white border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Quantity *</label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                min="1"
                required
                className="bg-white border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Unit Price *</label>
              <Input
                type="number"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
                className="bg-white border-slate-300"
              />
            </div>
          </CardContent>
        </Card>

        {/* Category and Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category & Status</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CategorySelector
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
            />
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">Status</label>
              <StatusSelector
                currentStatus={formData.status || 'pending'}
                type="part"
                onStatusChange={(status) => handleInputChange('status', status)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Supplier Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Supplier Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SupplierSelector
              value={formData.supplierName}
              onValueChange={(value) => handleInputChange('supplierName', value)}
            />
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Supplier Cost</label>
              <Input
                type="number"
                step="0.01"
                value={formData.supplierCost || ''}
                onChange={(e) => handleInputChange('supplierCost', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="bg-white border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Markup %</label>
              <Input
                type="number"
                step="0.1"
                value={formData.markupPercentage || ''}
                onChange={(e) => handleInputChange('markupPercentage', parseFloat(e.target.value) || 0)}
                placeholder="0.0"
                className="bg-white border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Customer Price</label>
              <Input
                type="number"
                step="0.01"
                value={formData.customerPrice || ''}
                onChange={(e) => handleInputChange('customerPrice', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="bg-white border-slate-300"
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Notes</label>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Enter any notes about this part..."
                className="bg-white border-slate-300"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Warranty Duration</label>
                <Input
                  value={formData.warrantyDuration || ''}
                  onChange={(e) => handleInputChange('warrantyDuration', e.target.value)}
                  placeholder="e.g., 12 months, 2 years"
                  className="bg-white border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Core Charge</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.coreChargeAmount || ''}
                  onChange={(e) => handleInputChange('coreChargeAmount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="bg-white border-slate-300"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
              className="px-6"
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isLoading || !formData.name || !formData.part_number}
            className="px-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Adding Part...
              </>
            ) : (
              'Add Part'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
