
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';

interface ComprehensivePartEntryFormProps {
  onPartAdd: (partData: WorkOrderPartFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  workOrderId?: string;
  jobLineId?: string;
}

export function ComprehensivePartEntryForm({
  onPartAdd,
  onCancel,
  isLoading,
  workOrderId,
  jobLineId
}: ComprehensivePartEntryFormProps) {
  const [formData, setFormData] = useState<Partial<WorkOrderPartFormValues>>({
    part_number: '',
    name: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    status: 'pending',
    category: '',
    supplierName: '',
    supplierCost: 0,
    customerPrice: 0,
    retailPrice: 0,
    markupPercentage: 0,
    isTaxable: true,
    coreChargeAmount: 0,
    coreChargeApplied: false,
    warrantyDuration: '',
    invoiceNumber: '',
    poLine: '',
    isStockItem: false,
    notes: '',
    notesInternal: '',
    partType: 'standard',
    job_line_id: jobLineId || ''
  });

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculate customer price based on supplier cost and markup
    if (field === 'supplierCost' || field === 'markupPercentage') {
      const supplierCost = field === 'supplierCost' ? Number(value) : Number(formData.supplierCost || 0);
      const markupPercentage = field === 'markupPercentage' ? Number(value) : Number(formData.markupPercentage || 0);
      
      if (supplierCost > 0 && markupPercentage > 0) {
        const customerPrice = supplierCost * (1 + markupPercentage / 100);
        setFormData(prev => ({
          ...prev,
          [field]: value,
          customerPrice: customerPrice,
          unit_price: customerPrice
        }));
        return;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.part_number || !formData.name || !formData.quantity) {
      return;
    }

    const partData: WorkOrderPartFormValues = {
      part_number: formData.part_number || '',
      name: formData.name || '',
      description: formData.description || '',
      quantity: Number(formData.quantity) || 1,
      unit_price: Number(formData.customerPrice || formData.unit_price) || 0,
      status: formData.status || 'pending',
      category: formData.category || '',
      supplierName: formData.supplierName || '',
      supplierCost: Number(formData.supplierCost) || 0,
      customerPrice: Number(formData.customerPrice) || 0,
      retailPrice: Number(formData.retailPrice) || 0,
      markupPercentage: Number(formData.markupPercentage) || 0,
      isTaxable: formData.isTaxable ?? true,
      coreChargeAmount: Number(formData.coreChargeAmount) || 0,
      coreChargeApplied: formData.coreChargeApplied || false,
      warrantyDuration: formData.warrantyDuration || '',
      invoiceNumber: formData.invoiceNumber || '',
      poLine: formData.poLine || '',
      isStockItem: formData.isStockItem || false,
      notes: formData.notes || '',
      notesInternal: formData.notesInternal || '',
      partType: formData.partType || 'standard',
      job_line_id: formData.job_line_id || jobLineId || ''
    };

    await onPartAdd(partData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="supplier">Supplier</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="part_number">Part Number *</Label>
                  <Input
                    id="part_number"
                    value={formData.part_number || ''}
                    onChange={(e) => handleInputChange('part_number', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Part Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity || 1}
                    onChange={(e) => handleInputChange('quantity', Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category || ''}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status || 'pending'} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="ordered">Ordered</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="installed">Installed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplierCost">Supplier Cost</Label>
                  <Input
                    id="supplierCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.supplierCost || 0}
                    onChange={(e) => handleInputChange('supplierCost', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="markupPercentage">Markup %</Label>
                  <Input
                    id="markupPercentage"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.markupPercentage || 0}
                    onChange={(e) => handleInputChange('markupPercentage', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerPrice">Customer Price</Label>
                  <Input
                    id="customerPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.customerPrice || 0}
                    onChange={(e) => handleInputChange('customerPrice', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="retailPrice">Retail Price</Label>
                  <Input
                    id="retailPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.retailPrice || 0}
                    onChange={(e) => handleInputChange('retailPrice', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isTaxable"
                    checked={formData.isTaxable || false}
                    onCheckedChange={(checked) => handleInputChange('isTaxable', checked)}
                  />
                  <Label htmlFor="isTaxable">Taxable</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="coreChargeApplied"
                    checked={formData.coreChargeApplied || false}
                    onCheckedChange={(checked) => handleInputChange('coreChargeApplied', checked)}
                  />
                  <Label htmlFor="coreChargeApplied">Core Charge Applied</Label>
                </div>
              </div>

              {formData.coreChargeApplied && (
                <div>
                  <Label htmlFor="coreChargeAmount">Core Charge Amount</Label>
                  <Input
                    id="coreChargeAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.coreChargeAmount || 0}
                    onChange={(e) => handleInputChange('coreChargeAmount', Number(e.target.value))}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supplier" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="supplierName">Supplier Name</Label>
                <Input
                  id="supplierName"
                  value={formData.supplierName || ''}
                  onChange={(e) => handleInputChange('supplierName', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={formData.invoiceNumber || ''}
                    onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="poLine">PO Line</Label>
                  <Input
                    id="poLine"
                    value={formData.poLine || ''}
                    onChange={(e) => handleInputChange('poLine', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="warrantyDuration">Warranty Duration</Label>
                <Input
                  id="warrantyDuration"
                  value={formData.warrantyDuration || ''}
                  onChange={(e) => handleInputChange('warrantyDuration', e.target.value)}
                  placeholder="e.g., 12 months, 2 years"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isStockItem"
                  checked={formData.isStockItem || false}
                  onCheckedChange={(checked) => handleInputChange('isStockItem', checked)}
                />
                <Label htmlFor="isStockItem">Stock Item</Label>
              </div>

              <div>
                <Label htmlFor="partType">Part Type</Label>
                <Select value={formData.partType || 'standard'} onValueChange={(value) => handleInputChange('partType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="oem">OEM</SelectItem>
                    <SelectItem value="aftermarket">Aftermarket</SelectItem>
                    <SelectItem value="remanufactured">Remanufactured</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Customer Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="notesInternal">Internal Notes</Label>
                <Textarea
                  id="notesInternal"
                  value={formData.notesInternal || ''}
                  onChange={(e) => handleInputChange('notesInternal', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Part'}
        </Button>
      </div>
    </form>
  );
}
