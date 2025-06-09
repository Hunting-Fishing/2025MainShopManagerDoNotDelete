
import React, { useState } from 'react';
import { Search, Package, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { InventoryItemExtended } from '@/types/inventory';
import { useInventoryItems } from '@/hooks/inventory/useInventoryItems';

interface InventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
}

export function InventoryPartsTab({ workOrderId, jobLineId, onAddPart }: InventoryPartsTabProps) {
  const { items, isLoading } = useInventoryItems();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<{[key: string]: {
    item: InventoryItemExtended;
    quantity: number;
    supplierCost: number;
    markupPercentage: number;
    retailPrice: number;
    customerPrice: number;
    invoiceNumber: string;
    poLine: string;
    notes: string;
    isCustomerPriceEdited: boolean;
  }}>({});

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectItem = (item: InventoryItemExtended) => {
    const retailPrice = item.unit_price || item.price || 0;
    setSelectedItems(prev => ({
      ...prev,
      [item.id]: {
        item,
        quantity: 1,
        supplierCost: retailPrice * 0.7, // Default supplier cost at 70% of retail
        markupPercentage: 43, // Default 43% markup
        retailPrice: retailPrice,
        customerPrice: retailPrice, // Default customer price to retail price
        invoiceNumber: '',
        poLine: '',
        notes: '',
        isCustomerPriceEdited: false
      }
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(prev => {
      const newItems = { ...prev };
      delete newItems[itemId];
      return newItems;
    });
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity <= 0) return;
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        quantity
      }
    }));
  };

  const handleSupplierCostChange = (itemId: string, supplierCost: number) => {
    setSelectedItems(prev => {
      const item = prev[itemId];
      if (!item) return prev;
      
      // Recalculate retail price based on markup
      const newRetailPrice = supplierCost * (1 + item.markupPercentage / 100);
      
      return {
        ...prev,
        [itemId]: {
          ...item,
          supplierCost,
          retailPrice: newRetailPrice,
          // Only update customer price if it hasn't been manually edited
          customerPrice: item.isCustomerPriceEdited ? item.customerPrice : newRetailPrice
        }
      };
    });
  };

  const handleAddSelectedParts = () => {
    const partsToAdd: WorkOrderPartFormValues[] = Object.values(selectedItems).map(({ item, quantity, supplierCost, markupPercentage, retailPrice, customerPrice, invoiceNumber, poLine, notes }) => ({
      partName: item.name,
      partNumber: item.sku,
      supplierName: item.supplier || '',
      supplierCost,
      markupPercentage,
      retailPrice,
      customerPrice,
      quantity,
      partType: 'inventory' as const,
      inventoryItemId: item.id,
      invoiceNumber,
      poLine,
      notes
    }));

    partsToAdd.forEach(part => onAddPart(part));
    setSelectedItems({});
  };

  const handleMarkupChange = (itemId: string, markupPercentage: number) => {
    setSelectedItems(prev => {
      const item = prev[itemId];
      if (!item) return prev;
      
      // Recalculate retail price based on new markup
      const newRetailPrice = item.supplierCost * (1 + markupPercentage / 100);
      
      return {
        ...prev,
        [itemId]: {
          ...item,
          markupPercentage,
          retailPrice: newRetailPrice,
          // Only update customer price if it hasn't been manually edited
          customerPrice: item.isCustomerPriceEdited ? item.customerPrice : newRetailPrice
        }
      };
    });
  };

  const handleCustomerPriceChange = (itemId: string, customerPrice: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        customerPrice,
        isCustomerPriceEdited: true
      }
    }));
  };

  const handleResetCustomerPrice = (itemId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        customerPrice: prev[itemId].retailPrice,
        isCustomerPriceEdited: false
      }
    }));
  };

  const handleFieldChange = (itemId: string, field: string, value: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading inventory items...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search inventory items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Available Items */}
      <div className="grid gap-2 max-h-64 overflow-y-auto">
        {filteredItems.map((item) => (
          <Card 
            key={item.id} 
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
              selectedItems[item.id] ? 'bg-blue-50 border-blue-200' : ''
            }`}
            onClick={() => !selectedItems[item.id] && handleSelectItem(item)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{item.name}</span>
                    <Badge variant="outline" className="text-xs">{item.sku}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Stock: {item.quantity || 0} • Price: ${(item.unit_price || item.price || 0).toFixed(2)}
                  </div>
                  {item.category && (
                    <Badge variant="secondary" className="text-xs mt-1">{item.category}</Badge>
                  )}
                </div>
                {selectedItems[item.id] ? (
                  <Badge className="bg-blue-600">Selected</Badge>
                ) : (
                  <Button size="sm" variant="outline">
                    <Plus className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Items Configuration */}
      {Object.keys(selectedItems).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configure Selected Parts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(selectedItems).map(([itemId, config]) => (
              <div key={itemId} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{config.item.name}</span>
                    <Badge variant="outline" className="ml-2">{config.item.sku}</Badge>
                    <div className="text-sm text-muted-foreground">
                      Available: {config.item.quantity || 0} units
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleRemoveItem(itemId)}
                  >
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <Label htmlFor={`quantity-${itemId}`}>Quantity</Label>
                    <Input
                      id={`quantity-${itemId}`}
                      type="number"
                      min="1"
                      max={config.item.quantity || 999}
                      value={config.quantity}
                      onChange={(e) => handleQuantityChange(itemId, parseInt(e.target.value) || 1)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`supplier-cost-${itemId}`}>Supplier Cost</Label>
                    <Input
                      id={`supplier-cost-${itemId}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={config.supplierCost}
                      onChange={(e) => handleSupplierCostChange(itemId, parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`markup-${itemId}`}>Markup %</Label>
                    <Input
                      id={`markup-${itemId}`}
                      type="number"
                      step="0.1"
                      min="0"
                      value={config.markupPercentage}
                      onChange={(e) => handleMarkupChange(itemId, parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`retail-price-${itemId}`}>Retail Price</Label>
                    <Input
                      id={`retail-price-${itemId}`}
                      type="number"
                      step="0.01"
                      value={config.retailPrice.toFixed(2)}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`customer-price-${itemId}`}>Customer Price</Label>
                      {config.isCustomerPriceEdited && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleResetCustomerPrice(itemId)}
                          className="h-6 px-2 text-xs"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Reset
                        </Button>
                      )}
                    </div>
                    <Input
                      id={`customer-price-${itemId}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={config.customerPrice}
                      onChange={(e) => handleCustomerPriceChange(itemId, parseFloat(e.target.value) || 0)}
                      className={config.isCustomerPriceEdited ? 'border-blue-300 bg-blue-50' : ''}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`invoice-${itemId}`}>Invoice #</Label>
                    <Input
                      id={`invoice-${itemId}`}
                      value={config.invoiceNumber}
                      onChange={(e) => handleFieldChange(itemId, 'invoiceNumber', e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`po-line-${itemId}`}>PO Line</Label>
                    <Input
                      id={`po-line-${itemId}`}
                      value={config.poLine}
                      onChange={(e) => handleFieldChange(itemId, 'poLine', e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`notes-${itemId}`}>Notes</Label>
                  <Input
                    id={`notes-${itemId}`}
                    value={config.notes}
                    onChange={(e) => handleFieldChange(itemId, 'notes', e.target.value)}
                    placeholder="Optional notes..."
                  />
                </div>

                <div className="text-sm text-muted-foreground">
                  Total: {config.quantity} × ${config.customerPrice.toFixed(2)} = ${(config.quantity * config.customerPrice).toFixed(2)}
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleAddSelectedParts} className="bg-green-600 hover:bg-green-700">
                Add {Object.keys(selectedItems).length} Part{Object.keys(selectedItems).length !== 1 ? 's' : ''}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
