
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, RotateCcw } from 'lucide-react';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { useInventoryItems } from '@/hooks/inventory/useInventoryItems';

interface InventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
}

export function InventoryPartsTab({ workOrderId, jobLineId, onAddPart }: InventoryPartsTabProps) {
  const { inventoryItems, loading, error } = useInventoryItems();
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCustomerPriceManual, setIsCustomerPriceManual] = useState(false);
  
  const [formData, setFormData] = useState({
    quantity: 1,
    supplierCost: 0,
    markupPercentage: 30,
    retailPrice: 0,
    customerPrice: 0,
    invoiceNumber: '',
    poLine: '',
    notes: ''
  });

  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedItem = inventoryItems.find(item => item.id === selectedItemId);

  // Update pricing when item is selected
  useEffect(() => {
    if (selectedItem) {
      const supplierCost = selectedItem.cost || 0;
      const retailPrice = supplierCost * (1 + formData.markupPercentage / 100);
      
      setFormData(prev => ({
        ...prev,
        supplierCost,
        retailPrice
      }));
      setIsCustomerPriceManual(false);
    }
  }, [selectedItem, formData.markupPercentage]);

  // Calculate retail price from supplier cost and markup
  useEffect(() => {
    if (formData.supplierCost > 0 && formData.markupPercentage >= 0) {
      const newRetailPrice = formData.supplierCost * (1 + formData.markupPercentage / 100);
      setFormData(prev => ({
        ...prev,
        retailPrice: newRetailPrice
      }));
    }
  }, [formData.supplierCost, formData.markupPercentage]);

  // Update customer price to match retail price (unless manually adjusted)
  useEffect(() => {
    if (!isCustomerPriceManual && formData.retailPrice > 0) {
      setFormData(prev => ({
        ...prev,
        customerPrice: formData.retailPrice
      }));
    }
  }, [formData.retailPrice, isCustomerPriceManual]);

  const handleRetailPriceChange = (value: string) => {
    const retailPrice = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      retailPrice
    }));
    
    // Recalculate markup percentage if supplier cost exists
    if (formData.supplierCost > 0) {
      const newMarkupPercentage = ((retailPrice - formData.supplierCost) / formData.supplierCost) * 100;
      setFormData(prev => ({
        ...prev,
        markupPercentage: Math.max(0, newMarkupPercentage)
      }));
    }
  };

  const handleCustomerPriceChange = (value: string) => {
    const customerPrice = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      customerPrice
    }));
    setIsCustomerPriceManual(true);
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
    
    if (!selectedItem) {
      alert('Please select an inventory item');
      return;
    }

    const partData: WorkOrderPartFormValues = {
      partName: selectedItem.name,
      partNumber: selectedItem.sku,
      supplierName: selectedItem.supplier || '',
      supplierCost: formData.supplierCost,
      markupPercentage: formData.markupPercentage,
      retailPrice: formData.retailPrice,
      customerPrice: formData.customerPrice,
      quantity: formData.quantity,
      partType: 'inventory',
      inventoryItemId: selectedItem.id,
      invoiceNumber: formData.invoiceNumber,
      poLine: formData.poLine,
      notes: formData.notes
    };

    onAddPart(partData);
    
    // Reset form
    setSelectedItemId('');
    setSearchTerm('');
    setFormData({
      quantity: 1,
      supplierCost: 0,
      markupPercentage: 30,
      retailPrice: 0,
      customerPrice: 0,
      invoiceNumber: '',
      poLine: '',
      notes: ''
    });
    setIsCustomerPriceManual(false);
  };

  if (loading) {
    return <div className="p-4">Loading inventory items...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error loading inventory: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Inventory Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="search">Search Inventory</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or SKU..."
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="inventoryItem">Select Item</Label>
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose inventory item" />
              </SelectTrigger>
              <SelectContent>
                {filteredItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} ({item.sku}) - Qty: {item.quantity || 0}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedItem && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={selectedItem.quantity || 0}
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Available: {selectedItem.quantity || 0}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="markupPercentage">Markup %</Label>
                  <Input
                    id="markupPercentage"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.markupPercentage.toFixed(1)}
                    onChange={(e) => setFormData(prev => ({ ...prev, markupPercentage: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="supplierCost">Supplier Cost</Label>
                  <Input
                    id="supplierCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.supplierCost.toFixed(2)}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplierCost: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="retailPrice">Retail/List Price</Label>
                  <Input
                    id="retailPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.retailPrice.toFixed(2)}
                    onChange={(e) => handleRetailPriceChange(e.target.value)}
                  />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="customerPrice">Customer Price</Label>
                    {isCustomerPriceManual && formData.customerPrice !== formData.retailPrice && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={resetCustomerPriceToRetail}
                        className="h-6 px-2 text-xs"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reset
                      </Button>
                    )}
                  </div>
                  <Input
                    id="customerPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.customerPrice.toFixed(2)}
                    onChange={(e) => handleCustomerPriceChange(e.target.value)}
                    className={isCustomerPriceManual && formData.customerPrice !== formData.retailPrice ? 'border-amber-300 bg-amber-50' : ''}
                  />
                  {isCustomerPriceManual && formData.customerPrice !== formData.retailPrice && (
                    <p className="text-xs text-amber-600 mt-1">
                      Manually adjusted from retail
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice #</Label>
                  <Input
                    id="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    placeholder="Enter invoice number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="poLine">PO Line</Label>
                  <Input
                    id="poLine"
                    value={formData.poLine}
                    onChange={(e) => setFormData(prev => ({ ...prev, poLine: e.target.value }))}
                    placeholder="Enter PO line"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes"
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Part
                </Button>
              </div>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
