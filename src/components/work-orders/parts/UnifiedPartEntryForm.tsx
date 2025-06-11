import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { WorkOrderPartFormValues, PART_CATEGORIES, PART_STATUSES, WARRANTY_DURATIONS } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
interface UnifiedPartEntryFormProps {
  onSubmit: (partData: WorkOrderPartFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: Partial<WorkOrderPartFormValues>;
}
export function UnifiedPartEntryForm({
  onSubmit,
  onCancel,
  isSubmitting,
  initialData
}: UnifiedPartEntryFormProps) {
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    partName: initialData?.partName || '',
    partNumber: initialData?.partNumber || '',
    supplierName: initialData?.supplierName || '',
    supplierCost: initialData?.supplierCost || 0,
    supplierSuggestedRetailPrice: initialData?.supplierSuggestedRetailPrice || 0,
    markupPercentage: initialData?.markupPercentage || 0,
    retailPrice: initialData?.retailPrice || 0,
    customerPrice: initialData?.customerPrice || 0,
    quantity: initialData?.quantity || 1,
    partType: initialData?.partType || 'non-inventory',
    category: initialData?.category || '',
    isTaxable: initialData?.isTaxable ?? true,
    coreChargeAmount: initialData?.coreChargeAmount || 0,
    coreChargeApplied: initialData?.coreChargeApplied || false,
    warrantyDuration: initialData?.warrantyDuration || '',
    installDate: initialData?.installDate || '',
    installedBy: initialData?.installedBy || '',
    status: initialData?.status || 'ordered',
    isStockItem: initialData?.isStockItem ?? true,
    invoiceNumber: initialData?.invoiceNumber || '',
    poLine: initialData?.poLine || '',
    notes: initialData?.notes || '',
    notesInternal: initialData?.notesInternal || '',
    binLocation: initialData?.binLocation || '',
    warehouseLocation: initialData?.warehouseLocation || '',
    shelfLocation: initialData?.shelfLocation || '',
    attachments: initialData?.attachments || []
  });
  const updateField = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };

      // Auto-calculate retail and customer prices when supplier cost or markup changes
      if (field === 'supplierCost' || field === 'markupPercentage') {
        const cost = field === 'supplierCost' ? value : updated.supplierCost;
        const markup = field === 'markupPercentage' ? value : updated.markupPercentage;
        if (cost && markup) {
          const retailPrice = cost * (1 + markup / 100);
          updated.retailPrice = Math.round(retailPrice * 100) / 100;
          updated.customerPrice = updated.retailPrice;
        }
      }
      return updated;
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partName.trim()) return;
    await onSubmit(formData);
  };
  return <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Part Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-sky-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="partName">Part Name *</Label>
                  <Input id="partName" value={formData.partName} onChange={e => updateField('partName', e.target.value)} placeholder="Enter part name" required />
                </div>
                <div>
                  <Label htmlFor="partNumber">Part Number</Label>
                  <Input id="partNumber" value={formData.partNumber} onChange={e => updateField('partNumber', e.target.value)} placeholder="Enter part number" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplierName">Supplier</Label>
                  <Input id="supplierName" value={formData.supplierName} onChange={e => updateField('supplierName', e.target.value)} placeholder="Enter supplier name" />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input id="quantity" type="number" min="1" value={formData.quantity} onChange={e => updateField('quantity', parseInt(e.target.value) || 1)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="partType">Part Type</Label>
                  <Select value={formData.partType} onValueChange={value => updateField('partType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inventory">Inventory</SelectItem>
                      <SelectItem value="non-inventory">Non-Inventory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={value => updateField('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PART_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
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
                  <Label htmlFor="supplierCost">Supplier Cost *</Label>
                  <Input id="supplierCost" type="number" step="0.01" min="0" value={formData.supplierCost} onChange={e => updateField('supplierCost', parseFloat(e.target.value) || 0)} required />
                </div>
                <div>
                  <Label htmlFor="markupPercentage">Markup % *</Label>
                  <Input id="markupPercentage" type="number" step="0.01" min="0" value={formData.markupPercentage} onChange={e => updateField('markupPercentage', parseFloat(e.target.value) || 0)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="retailPrice">Retail Price</Label>
                  <Input id="retailPrice" type="number" step="0.01" min="0" value={formData.retailPrice} onChange={e => updateField('retailPrice', parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <Label htmlFor="customerPrice">Customer Price *</Label>
                  <Input id="customerPrice" type="number" step="0.01" min="0" value={formData.customerPrice} onChange={e => updateField('customerPrice', parseFloat(e.target.value) || 0)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="coreChargeAmount">Core Charge</Label>
                  <Input id="coreChargeAmount" type="number" step="0.01" min="0" value={formData.coreChargeAmount} onChange={e => updateField('coreChargeAmount', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <Checkbox id="isTaxable" checked={formData.isTaxable} onCheckedChange={checked => updateField('isTaxable', checked)} />
                  <Label htmlFor="isTaxable">Taxable</Label>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={value => updateField('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PART_STATUSES.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="warrantyDuration">Warranty</Label>
                  <Select value={formData.warrantyDuration} onValueChange={value => updateField('warrantyDuration', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select warranty" />
                    </SelectTrigger>
                    <SelectContent>
                      {WARRANTY_DURATIONS.map(warranty => <SelectItem key={warranty} value={warranty}>{warranty}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input id="invoiceNumber" value={formData.invoiceNumber} onChange={e => updateField('invoiceNumber', e.target.value)} placeholder="Enter invoice number" />
                </div>
                <div>
                  <Label htmlFor="poLine">PO Line</Label>
                  <Input id="poLine" value={formData.poLine} onChange={e => updateField('poLine', e.target.value)} placeholder="Enter PO line" />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Customer Notes</Label>
                <Textarea id="notes" value={formData.notes} onChange={e => updateField('notes', e.target.value)} placeholder="Enter customer-visible notes" rows={3} />
              </div>

              <div>
                <Label htmlFor="notesInternal">Internal Notes</Label>
                <Textarea id="notesInternal" value={formData.notesInternal} onChange={e => updateField('notesInternal', e.target.value)} placeholder="Enter internal notes" rows={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storage Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="warehouseLocation">Warehouse</Label>
                  <Input id="warehouseLocation" value={formData.warehouseLocation} onChange={e => updateField('warehouseLocation', e.target.value)} placeholder="Enter warehouse" />
                </div>
                <div>
                  <Label htmlFor="shelfLocation">Shelf</Label>
                  <Input id="shelfLocation" value={formData.shelfLocation} onChange={e => updateField('shelfLocation', e.target.value)} placeholder="Enter shelf" />
                </div>
                <div>
                  <Label htmlFor="binLocation">Bin</Label>
                  <Input id="binLocation" value={formData.binLocation} onChange={e => updateField('binLocation', e.target.value)} placeholder="Enter bin" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !formData.partName.trim()}>
          {isSubmitting ? 'Adding...' : 'Add Part'}
        </Button>
      </div>
    </form>;
}