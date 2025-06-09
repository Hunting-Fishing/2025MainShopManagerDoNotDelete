
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Save } from 'lucide-react';
import { WorkOrderPartFormValues, PART_CATEGORIES, PART_STATUSES, WARRANTY_DURATIONS } from '@/types/workOrderPart';
import { saveWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from 'sonner';

interface NonInventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
  onPartSaved: () => void;
}

export function NonInventoryPartsTab({
  workOrderId,
  jobLineId,
  onAddPart,
  onPartSaved
}: NonInventoryPartsTabProps) {
  const [formData, setFormData] = useState<Partial<WorkOrderPartFormValues>>({
    partName: '',
    partNumber: '',
    supplierName: '',
    supplierCost: 0,
    supplierSuggestedRetailPrice: 0,
    markupPercentage: 100,
    retailPrice: 0,
    customerPrice: 0,
    quantity: 1,
    partType: 'non-inventory',
    category: '',
    isTaxable: true,
    coreChargeAmount: 0,
    coreChargeApplied: false,
    warrantyDuration: '',
    installDate: '',
    installedBy: '',
    status: 'ordered',
    isStockItem: false,
    invoiceNumber: '',
    poLine: '',
    notes: '',
    notesInternal: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate retail price when supplier cost or markup changes
      if (field === 'supplierCost' || field === 'markupPercentage') {
        const supplierCost = field === 'supplierCost' ? value : (updated.supplierCost || 0);
        const markup = field === 'markupPercentage' ? value : (updated.markupPercentage || 0);
        updated.retailPrice = supplierCost * (1 + markup / 100);
        updated.customerPrice = updated.retailPrice; // Default customer price to retail price
      }
      
      return updated;
    });
  };

  const handleSubmit = async (saveDirectly: boolean = false) => {
    if (!formData.partName || !formData.supplierCost) {
      toast.error('Part name and supplier cost are required');
      return;
    }

    const partData: WorkOrderPartFormValues = {
      partName: formData.partName!,
      partNumber: formData.partNumber || '',
      supplierName: formData.supplierName || '',
      supplierCost: formData.supplierCost!,
      supplierSuggestedRetailPrice: formData.supplierSuggestedRetailPrice || 0,
      markupPercentage: formData.markupPercentage || 100,
      retailPrice: formData.retailPrice || 0,
      customerPrice: formData.customerPrice || 0,
      quantity: formData.quantity || 1,
      partType: 'non-inventory',
      category: formData.category || '',
      isTaxable: formData.isTaxable ?? true,
      coreChargeAmount: formData.coreChargeAmount || 0,
      coreChargeApplied: formData.coreChargeApplied || false,
      warrantyDuration: formData.warrantyDuration || '',
      installDate: formData.installDate || '',
      installedBy: formData.installedBy || '',
      status: formData.status || 'ordered',
      isStockItem: false,
      invoiceNumber: formData.invoiceNumber || '',
      poLine: formData.poLine || '',
      notes: formData.notes || '',
      notesInternal: formData.notesInternal || ''
    };

    if (saveDirectly) {
      setIsSubmitting(true);
      try {
        await saveWorkOrderPart(workOrderId, jobLineId, partData);
        toast.success('Part saved successfully');
        onPartSaved();
        // Reset form
        setFormData({
          partName: '',
          partNumber: '',
          supplierName: '',
          supplierCost: 0,
          supplierSuggestedRetailPrice: 0,
          markupPercentage: 100,
          retailPrice: 0,
          customerPrice: 0,
          quantity: 1,
          partType: 'non-inventory',
          category: '',
          isTaxable: true,
          coreChargeAmount: 0,
          coreChargeApplied: false,
          warrantyDuration: '',
          installDate: '',
          installedBy: '',
          status: 'ordered',
          isStockItem: false,
          invoiceNumber: '',
          poLine: '',
          notes: '',
          notesInternal: ''
        });
      } catch (error) {
        console.error('Error saving part:', error);
        toast.error('Failed to save part');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      onAddPart(partData);
      toast.success('Part added to list');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Non-Inventory Part Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Information */}
          <div className="space-y-2">
            <Label htmlFor="partName">Part Name *</Label>
            <Input
              id="partName"
              placeholder="Enter part name"
              value={formData.partName || ''}
              onChange={(e) => handleInputChange('partName', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="partNumber">Part Number</Label>
            <Input
              id="partNumber"
              placeholder="Enter part number"
              value={formData.partNumber || ''}
              onChange={(e) => handleInputChange('partNumber', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplierName">Supplier Name</Label>
            <Input
              id="supplierName"
              placeholder="Enter supplier name"
              value={formData.supplierName || ''}
              onChange={(e) => handleInputChange('supplierName', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category || ''} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {PART_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pricing Information */}
          <div className="space-y-2">
            <Label htmlFor="supplierCost">Supplier Cost *</Label>
            <Input
              id="supplierCost"
              type="number"
              step="0.01"
              placeholder="0"
              value={formData.supplierCost || ''}
              onChange={(e) => handleInputChange('supplierCost', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplierSuggestedRetailPrice">Supplier Suggested Retail Price</Label>
            <Input
              id="supplierSuggestedRetailPrice"
              type="number"
              step="0.01"
              placeholder="0"
              value={formData.supplierSuggestedRetailPrice || ''}
              onChange={(e) => handleInputChange('supplierSuggestedRetailPrice', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="markupPercentage">Markup %</Label>
            <Input
              id="markupPercentage"
              type="number"
              step="0.01"
              placeholder="0"
              value={formData.markupPercentage || ''}
              onChange={(e) => handleInputChange('markupPercentage', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="retailPrice">Retail Price</Label>
            <Input
              id="retailPrice"
              type="number"
              step="0.01"
              placeholder="0"
              value={formData.retailPrice || ''}
              onChange={(e) => handleInputChange('retailPrice', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPrice">Customer Price</Label>
            <Input
              id="customerPrice"
              type="number"
              step="0.01"
              placeholder="0"
              value={formData.customerPrice || ''}
              onChange={(e) => handleInputChange('customerPrice', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="1"
              value={formData.quantity || ''}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status || ''} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {PART_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="warrantyDuration">Warranty Duration</Label>
            <Select value={formData.warrantyDuration || ''} onValueChange={(value) => handleInputChange('warrantyDuration', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select warranty" />
              </SelectTrigger>
              <SelectContent>
                {WARRANTY_DURATIONS.map((duration) => (
                  <SelectItem key={duration} value={duration}>
                    {duration}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Installation Information */}
          <div className="space-y-2">
            <Label htmlFor="installDate">Install Date</Label>
            <Input
              id="installDate"
              type="date"
              value={formData.installDate || ''}
              onChange={(e) => handleInputChange('installDate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="installedBy">Installed By (Technician)</Label>
            <Input
              id="installedBy"
              placeholder="Enter technician name"
              value={formData.installedBy || ''}
              onChange={(e) => handleInputChange('installedBy', e.target.value)}
            />
          </div>

          {/* Reference Information */}
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              placeholder="Enter invoice number"
              value={formData.invoiceNumber || ''}
              onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="poLine">PO Line</Label>
            <Input
              id="poLine"
              placeholder="Enter PO line"
              value={formData.poLine || ''}
              onChange={(e) => handleInputChange('poLine', e.target.value)}
            />
          </div>

          {/* Core Charge Information */}
          <div className="space-y-2">
            <Label htmlFor="coreChargeAmount">Core Charge Amount</Label>
            <Input
              id="coreChargeAmount"
              type="number"
              step="0.01"
              placeholder="0"
              value={formData.coreChargeAmount || ''}
              onChange={(e) => handleInputChange('coreChargeAmount', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isTaxable"
              checked={formData.isTaxable ?? true}
              onCheckedChange={(checked) => handleInputChange('isTaxable', checked)}
            />
            <Label htmlFor="isTaxable">Taxable?</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="coreChargeApplied"
              checked={formData.coreChargeApplied || false}
              onCheckedChange={(checked) => handleInputChange('coreChargeApplied', checked)}
            />
            <Label htmlFor="coreChargeApplied">Core Charge Applied</Label>
          </div>
        </div>

        {/* Notes Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Enter any notes about this part"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notesInternal">Internal Notes</Label>
            <Textarea
              id="notesInternal"
              placeholder="Enter internal notes (not visible to customer)"
              value={formData.notesInternal || ''}
              onChange={(e) => handleInputChange('notesInternal', e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => handleSubmit(false)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Another Part
          </Button>
          <Button
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Part to Work Order'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
