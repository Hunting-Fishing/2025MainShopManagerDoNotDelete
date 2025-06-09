import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Plus } from 'lucide-react';
import { useInventoryItems } from '@/hooks/inventory/useInventoryItems';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';
import { InventoryItemExtended } from '@/types/inventory';

interface InventoryPartsTabProps {
  workOrderId: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
  existingParts: WorkOrderPart[];
}

export const InventoryPartsTab: React.FC<InventoryPartsTabProps> = ({
  workOrderId,
  onAddPart,
  existingParts
}) => {
  const { items, isLoading, fetchItems } = useInventoryItems();

  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    partName: '',
    partNumber: '',
    supplierName: '',
    supplierCost: 0,
    markupPercentage: 25,
    retailPrice: 0,
    customerPrice: 0,
    quantity: 1,
    partType: 'inventory',
    invoiceNumber: '',
    poLine: '',
    notes: '',
    inventoryItemId: ''
  });

  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItemExtended | null>(null);
  const [isCustomerPriceManual, setIsCustomerPriceManual] = useState(false);

  // Calculate retail price from supplier cost and markup
  useEffect(() => {
    if (formData.supplierCost > 0 && formData.markupPercentage >= 0) {
      const newRetailPrice = formData.supplierCost * (1 + formData.markupPercentage / 100);
      setFormData(prev => ({
        ...prev,
        retailPrice: parseFloat(newRetailPrice.toFixed(2))
      }));
    }
  }, [formData.supplierCost, formData.markupPercentage]);

  // Auto-update customer price to match retail price (unless manually adjusted)
  useEffect(() => {
    if (!isCustomerPriceManual && formData.retailPrice > 0) {
      setFormData(prev => ({
        ...prev,
        customerPrice: formData.retailPrice
      }));
    }
  }, [formData.retailPrice, isCustomerPriceManual]);

  const handleInventoryItemSelect = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      setSelectedInventoryItem(item);
      setFormData(prev => ({
        ...prev,
        partName: item.name,
        partNumber: item.sku,
        supplierName: item.supplier || '',
        supplierCost: item.cost || item.unit_price || 0,
        retailPrice: item.unit_price || 0,
        customerPrice: item.unit_price || 0,
        inventoryItemId: item.id
      }));
      setIsCustomerPriceManual(false);
    }
  };

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    if (field === 'customerPrice') {
      setIsCustomerPriceManual(true);
    }
    
    if (field === 'retailPrice') {
      // When retail price is manually changed, recalculate markup percentage
      const newRetailPrice = parseFloat(value) || 0;
      if (formData.supplierCost > 0 && newRetailPrice > 0) {
        const newMarkupPercentage = ((newRetailPrice - formData.supplierCost) / formData.supplierCost) * 100;
        setFormData(prev => ({
          ...prev,
          retailPrice: newRetailPrice,
          markupPercentage: parseFloat(newMarkupPercentage.toFixed(2))
        }));
      } else {
        setFormData(prev => ({ ...prev, [field]: newRetailPrice }));
      }
      return;
    }

    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetCustomerPriceToRetail = () => {
    setFormData(prev => ({
      ...prev,
      customerPrice: prev.retailPrice
    }));
    setIsCustomerPriceManual(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.partName && formData.quantity > 0) {
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
        partType: 'inventory',
        invoiceNumber: '',
        poLine: '',
        notes: '',
        inventoryItemId: ''
      });
      setSelectedInventoryItem(null);
      setIsCustomerPriceManual(false);
    }
  };

  const availableItems = items.filter(item => 
    !existingParts.some(part => part.inventoryItemId === item.id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Inventory Part
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Inventory Item Selection */}
          <div className="space-y-2">
            <Label htmlFor="inventoryItem">Select Inventory Item</Label>
            <Select
              value={selectedInventoryItem?.id || ''}
              onValueChange={handleInventoryItemSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading inventory..." : "Choose an inventory item"} />
              </SelectTrigger>
              <SelectContent>
                {availableItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground">
                        SKU: {item.sku} | Stock: {item.quantity} | ${item.unit_price?.toFixed(2)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Part Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="partName">Part Name</Label>
              <Input
                id="partName"
                value={formData.partName}
                onChange={(e) => handleInputChange('partName', e.target.value)}
                placeholder="Enter part name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="partNumber">Part Number</Label>
              <Input
                id="partNumber"
                value={formData.partNumber}
                onChange={(e) => handleInputChange('partNumber', e.target.value)}
                placeholder="Enter part number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplierName">Supplier</Label>
              <Input
                id="supplierName"
                value={formData.supplierName}
                onChange={(e) => handleInputChange('supplierName', e.target.value)}
                placeholder="Enter supplier name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                required
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplierCost">Supplier Cost</Label>
              <Input
                id="supplierCost"
                type="number"
                step="0.01"
                min="0"
                value={formData.supplierCost}
                onChange={(e) => handleInputChange('supplierCost', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
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
                onChange={(e) => handleInputChange('markupPercentage', parseFloat(e.target.value) || 0)}
                placeholder="25"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retailPrice">Retail/List Price</Label>
              <Input
                id="retailPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.retailPrice}
                onChange={(e) => handleInputChange('retailPrice', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="customerPrice">Customer Price</Label>
                {isCustomerPriceManual && formData.customerPrice !== formData.retailPrice && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetCustomerPriceToRetail}
                    className="h-auto p-1 text-xs"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset to Retail
                  </Button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="customerPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.customerPrice}
                  onChange={(e) => handleInputChange('customerPrice', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className={isCustomerPriceManual && formData.customerPrice !== formData.retailPrice ? 'border-amber-300 bg-amber-50' : ''}
                />
                {isCustomerPriceManual && formData.customerPrice !== formData.retailPrice && (
                  <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs bg-amber-100 text-amber-800">
                    Custom
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Additional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice #</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                placeholder="Enter invoice number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="poLine">PO Line</Label>
              <Input
                id="poLine"
                value={formData.poLine}
                onChange={(e) => handleInputChange('poLine', e.target.value)}
                placeholder="Enter PO line"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes"
            />
          </div>

          <Button type="submit" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Inventory Part
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
