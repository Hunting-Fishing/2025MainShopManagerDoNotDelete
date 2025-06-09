
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Package, DollarSign, Shield, Calendar, User } from 'lucide-react';
import { WorkOrderPartFormValues, PART_STATUSES, partStatusMap, PartCategoryOption, WarrantyTerm } from '@/types/workOrderPart';
import { getPartCategories, getWarrantyTerms } from '@/services/workOrder/workOrderPartsService';
import { RequiredIndicator } from '@/components/ui/required-indicator';

interface NonInventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
}

export function NonInventoryPartsTab({
  workOrderId,
  jobLineId,
  onAddPart
}: NonInventoryPartsTabProps) {
  const [partCategories, setPartCategories] = useState<PartCategoryOption[]>([]);
  const [warrantyTerms, setWarrantyTerms] = useState<WarrantyTerm[]>([]);
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    partName: '',
    partNumber: '',
    supplierName: '',
    supplierCost: 0,
    markupPercentage: 25,
    retailPrice: 0,
    customerPrice: 0,
    quantity: 1,
    partType: 'non-inventory',
    invoiceNumber: '',
    poLine: '',
    notes: '',
    // Enhanced fields
    category: '',
    isTaxable: true,
    coreChargeAmount: 0,
    coreChargeApplied: false,
    warrantyDuration: '',
    installDate: '',
    installedBy: '',
    status: 'ordered',
    isStockItem: false,
    notesInternal: ''
  });

  useEffect(() => {
    loadPartCategories();
    loadWarrantyTerms();
  }, []);

  const loadPartCategories = async () => {
    try {
      const categories = await getPartCategories();
      setPartCategories(categories);
    } catch (error) {
      console.error('Error loading part categories:', error);
    }
  };

  const loadWarrantyTerms = async () => {
    try {
      const terms = await getWarrantyTerms();
      setWarrantyTerms(terms);
    } catch (error) {
      console.error('Error loading warranty terms:', error);
    }
  };

  const calculatePrices = (cost: number, markup: number) => {
    const retailPrice = cost * (1 + markup / 100);
    return {
      retailPrice: Number(retailPrice.toFixed(2)),
      customerPrice: Number(retailPrice.toFixed(2))
    };
  };

  const handleFieldChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate prices when cost or markup changes
      if (field === 'supplierCost' || field === 'markupPercentage') {
        const cost = field === 'supplierCost' ? value : prev.supplierCost;
        const markup = field === 'markupPercentage' ? value : prev.markupPercentage;
        const prices = calculatePrices(cost, markup);
        updated.retailPrice = prices.retailPrice;
        updated.customerPrice = prices.customerPrice;
      }
      
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.partName.trim()) {
      return;
    }

    onAddPart(formData);
    
    // Reset form
    setFormData({
      partName: '',
      partNumber: '',
      supplierName: '',
      supplierCost: 0,
      markupPercentage: 25,
      retailPrice: 0,
      customerPrice: 0,
      quantity: 1,
      partType: 'non-inventory',
      invoiceNumber: '',
      poLine: '',
      notes: '',
      category: '',
      isTaxable: true,
      coreChargeAmount: 0,
      coreChargeApplied: false,
      warrantyDuration: '',
      installDate: '',
      installedBy: '',
      status: 'ordered',
      isStockItem: false,
      notesInternal: ''
    });
  };

  const totalPartCost = formData.customerPrice + (formData.coreChargeApplied ? formData.coreChargeAmount : 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Add Non-Inventory Part
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Part Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-700">Basic Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partName">
                  Part Name <RequiredIndicator />
                </Label>
                <Input
                  id="partName"
                  value={formData.partName}
                  onChange={(e) => handleFieldChange('partName', e.target.value)}
                  placeholder="Enter part name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="partNumber">Part Number</Label>
                <Input
                  id="partNumber"
                  value={formData.partNumber}
                  onChange={(e) => handleFieldChange('partNumber', e.target.value)}
                  placeholder="Enter part number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleFieldChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {partCategories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierName">Supplier</Label>
                <Input
                  id="supplierName"
                  value={formData.supplierName}
                  onChange={(e) => handleFieldChange('supplierName', e.target.value)}
                  placeholder="Enter supplier name"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Pricing Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pricing & Quantity
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleFieldChange('quantity', parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierCost">Supplier Cost</Label>
                <Input
                  id="supplierCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.supplierCost}
                  onChange={(e) => handleFieldChange('supplierCost', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="markupPercentage">Markup %</Label>
                <Input
                  id="markupPercentage"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.markupPercentage}
                  onChange={(e) => handleFieldChange('markupPercentage', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPrice">Customer Price</Label>
                <Input
                  id="customerPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.customerPrice}
                  onChange={(e) => handleFieldChange('customerPrice', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Tax and Core Charge */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isTaxable"
                  checked={formData.isTaxable}
                  onCheckedChange={(checked) => handleFieldChange('isTaxable', checked)}
                />
                <Label htmlFor="isTaxable">Taxable Item</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coreChargeAmount">Core Charge Amount</Label>
                <Input
                  id="coreChargeAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.coreChargeAmount}
                  onChange={(e) => handleFieldChange('coreChargeAmount', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="coreChargeApplied"
                  checked={formData.coreChargeApplied}
                  onCheckedChange={(checked) => handleFieldChange('coreChargeApplied', checked)}
                />
                <Label htmlFor="coreChargeApplied">Apply Core Charge</Label>
              </div>
            </div>

            {totalPartCost > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800">
                  Total Part Cost: ${(totalPartCost * formData.quantity).toFixed(2)}
                  {formData.coreChargeApplied && formData.coreChargeAmount > 0 && (
                    <span className="text-xs ml-2">(includes ${(formData.coreChargeAmount * formData.quantity).toFixed(2)} core charge)</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Status and Tracking */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-700">Status & Tracking</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleFieldChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PART_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          <Badge className={partStatusMap[status].classes}>
                            {partStatusMap[status].label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) => handleFieldChange('invoiceNumber', e.target.value)}
                  placeholder="Enter invoice number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="poLine">PO Line</Label>
                <Input
                  id="poLine"
                  value={formData.poLine}
                  onChange={(e) => handleFieldChange('poLine', e.target.value)}
                  placeholder="Enter PO line"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isStockItem"
                checked={formData.isStockItem}
                onCheckedChange={(checked) => handleFieldChange('isStockItem', checked)}
              />
              <Label htmlFor="isStockItem">Pull from shop stock</Label>
            </div>
          </div>

          <Separator />

          {/* Warranty and Installation */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Warranty & Installation
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="warrantyDuration">Warranty</Label>
                <Select 
                  value={formData.warrantyDuration} 
                  onValueChange={(value) => handleFieldChange('warrantyDuration', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warranty" />
                  </SelectTrigger>
                  <SelectContent>
                    {warrantyTerms.map((term) => (
                      <SelectItem key={term.id} value={term.duration}>
                        {term.duration}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="installDate">Install Date</Label>
                <Input
                  id="installDate"
                  type="date"
                  value={formData.installDate}
                  onChange={(e) => handleFieldChange('installDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="installedBy">Installed By</Label>
                <Input
                  id="installedBy"
                  value={formData.installedBy}
                  onChange={(e) => handleFieldChange('installedBy', e.target.value)}
                  placeholder="Enter technician name"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-700">Notes</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Customer Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  placeholder="Notes visible to customer"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notesInternal">Internal Notes</Label>
                <Textarea
                  id="notesInternal"
                  value={formData.notesInternal}
                  onChange={(e) => handleFieldChange('notesInternal', e.target.value)}
                  placeholder="Internal notes (not visible to customer)"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              disabled={!formData.partName.trim()}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Part
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
