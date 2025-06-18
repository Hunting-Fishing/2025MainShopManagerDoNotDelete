
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { CategorySelector } from './CategorySelector';
import { SupplierSelector } from './SupplierSelector';
import { WorkOrderPartFormValues, WORK_ORDER_PART_STATUSES } from '@/types/workOrderPart';
import { toast } from '@/hooks/use-toast';

interface ComprehensivePartEntryFormProps {
  onPartAdd: (part: WorkOrderPartFormValues) => void;
  onCancel?: () => void;
  initialData?: Partial<WorkOrderPartFormValues>;
}

export function ComprehensivePartEntryForm({ 
  onPartAdd, 
  onCancel, 
  initialData 
}: ComprehensivePartEntryFormProps) {
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    part_number: initialData?.part_number || '',
    name: initialData?.name || '',
    quantity: initialData?.quantity || 1,
    unit_price: initialData?.unit_price || 0,
    status: initialData?.status || 'pending',
    notes: initialData?.notes || '',
    category: initialData?.category || '',
    supplierName: initialData?.supplierName || '',
    supplierCost: initialData?.supplierCost || 0,
    customerPrice: initialData?.customerPrice || 0,
    retailPrice: initialData?.retailPrice || 0,
    markupPercentage: initialData?.markupPercentage || 0,
    isTaxable: initialData?.isTaxable || false,
    coreChargeAmount: initialData?.coreChargeAmount || 0,
    coreChargeApplied: initialData?.coreChargeApplied || false,
    warrantyDuration: initialData?.warrantyDuration || '',
    isStockItem: initialData?.isStockItem || false,
    notesInternal: initialData?.notesInternal || '',
    partType: initialData?.partType || ''
  });

  // Auto-calculate customer price when supplier cost or markup changes
  useEffect(() => {
    if (formData.supplierCost > 0 && formData.markupPercentage > 0) {
      const calculatedPrice = formData.supplierCost * (1 + formData.markupPercentage / 100);
      setFormData(prev => ({
        ...prev,
        customerPrice: calculatedPrice,
        retailPrice: calculatedPrice,
        unit_price: calculatedPrice
      }));
    }
  }, [formData.supplierCost, formData.markupPercentage]);

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.part_number || !formData.name || formData.unit_price <= 0 || formData.quantity <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields with valid values",
        variant: "destructive",
      });
      return;
    }

    try {
      // Calculate total price
      const totalPrice = formData.unit_price * formData.quantity;

      // Map camelCase form values to snake_case database fields
      const partData = {
        part_number: formData.part_number,
        name: formData.name,
        quantity: formData.quantity,
        unit_price: formData.unit_price,
        total_price: totalPrice,
        status: formData.status,
        notes: formData.notes,
        category: formData.category,
        supplier_name: formData.supplierName,
        supplier_cost: formData.supplierCost,
        customer_price: formData.customerPrice,
        retail_price: formData.retailPrice,
        markup_percentage: formData.markupPercentage,
        is_taxable: formData.isTaxable,
        core_charge_amount: formData.coreChargeAmount,
        core_charge_applied: formData.coreChargeApplied,
        warranty_duration: formData.warrantyDuration,
        is_stock_item: formData.isStockItem,
        notes_internal: formData.notesInternal,
        part_type: formData.partType
      };

      onPartAdd(partData as WorkOrderPartFormValues);
      
      toast({
        title: "Success",
        description: "Part added successfully",
      });

      // Reset form
      setFormData({
        part_number: '',
        name: '',
        quantity: 1,
        unit_price: 0,
        status: 'pending',
        notes: '',
        category: '',
        supplierName: '',
        supplierCost: 0,
        customerPrice: 0,
        retailPrice: 0,
        markupPercentage: 0,
        isTaxable: false,
        coreChargeAmount: 0,
        coreChargeApplied: false,
        warrantyDuration: '',
        isStockItem: false,
        notesInternal: '',
        partType: ''
      });

    } catch (error) {
      console.error('Error adding part:', error);
      toast({
        title: "Error",
        description: "Failed to add part",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Add Part to Work Order</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="part_number">Part Number *</Label>
                  <Input
                    id="part_number"
                    value={formData.part_number}
                    onChange={(e) => handleInputChange('part_number', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Part Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
              </div>

              <CategorySelector
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              />

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {WORK_ORDER_PART_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              <SupplierSelector
                value={formData.supplierName}
                onValueChange={(value) => handleInputChange('supplierName', value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier_cost">Supplier Cost</Label>
                  <Input
                    id="supplier_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.supplierCost}
                    onChange={(e) => handleInputChange('supplierCost', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="markup_percentage">Markup %</Label>
                  <Input
                    id="markup_percentage"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.markupPercentage}
                    onChange={(e) => handleInputChange('markupPercentage', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_price">Customer Price</Label>
                  <Input
                    id="customer_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.customerPrice}
                    onChange={(e) => handleInputChange('customerPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="retail_price">Retail Price</Label>
                  <Input
                    id="retail_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.retailPrice}
                    onChange={(e) => handleInputChange('retailPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="core_charge_amount">Core Charge Amount</Label>
                  <Input
                    id="core_charge_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.coreChargeAmount}
                    onChange={(e) => handleInputChange('coreChargeAmount', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="core_charge_applied"
                    checked={formData.coreChargeApplied}
                    onCheckedChange={(checked) => handleInputChange('coreChargeApplied', checked)}
                  />
                  <Label htmlFor="core_charge_applied">Core Charge Applied</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div>
                <Label htmlFor="warranty_duration">Warranty Duration</Label>
                <Input
                  id="warranty_duration"
                  value={formData.warrantyDuration}
                  onChange={(e) => handleInputChange('warrantyDuration', e.target.value)}
                  placeholder="e.g., 12 months, 2 years"
                />
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
                <Label htmlFor="notes_internal">Internal Notes</Label>
                <Textarea
                  id="notes_internal"
                  value={formData.notesInternal}
                  onChange={(e) => handleInputChange('notesInternal', e.target.value)}
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_taxable"
                  checked={formData.isTaxable}
                  onCheckedChange={(checked) => handleInputChange('isTaxable', checked)}
                />
                <Label htmlFor="is_taxable">Taxable Item</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_stock_item"
                  checked={formData.isStockItem}
                  onCheckedChange={(checked) => handleInputChange('isStockItem', checked)}
                />
                <Label htmlFor="is_stock_item">Stock Item</Label>
              </div>

              <div>
                <Label htmlFor="part_type">Part Type</Label>
                <Select value={formData.partType} onValueChange={(value) => handleInputChange('partType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select part type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oem">OEM</SelectItem>
                    <SelectItem value="aftermarket">Aftermarket</SelectItem>
                    <SelectItem value="rebuilt">Rebuilt</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="remanufactured">Remanufactured</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Total: ${(formData.unit_price * formData.quantity).toFixed(2)}
                  {formData.coreChargeApplied && formData.coreChargeAmount > 0 && (
                    <span> (+ ${formData.coreChargeAmount.toFixed(2)} core charge)</span>
                  )}
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit">Add Part</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
