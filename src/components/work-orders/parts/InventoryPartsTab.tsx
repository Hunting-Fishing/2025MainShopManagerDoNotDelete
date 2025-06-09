import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Package, RefreshCw, AlertCircle } from 'lucide-react';
import { useInventoryItems } from '@/hooks/inventory/useInventoryItems';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { toast } from 'sonner';

interface InventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
}

export function InventoryPartsTab({ workOrderId, jobLineId, onAddPart }: InventoryPartsTabProps) {
  const { items, isLoading, fetchItems } = useInventoryItems();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [customerPrices, setCustomerPrices] = useState<Record<string, number>>({});
  const [manuallyAdjusted, setManuallyAdjusted] = useState<Record<string, boolean>>({});
  const [invoiceNumbers, setInvoiceNumbers] = useState<Record<string, string>>({});
  const [poLines, setPoLines] = useState<Record<string, string>>({});

  // Initialize customer prices to retail when items load
  useEffect(() => {
    if (items.length > 0) {
      const initialPrices: Record<string, number> = {};
      items.forEach(item => {
        if (!customerPrices[item.id]) {
          initialPrices[item.id] = item.retail_price || 0;
        }
      });
      if (Object.keys(initialPrices).length > 0) {
        setCustomerPrices(prev => ({ ...prev, ...initialPrices }));
      }
    }
  }, [items, customerPrices]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(items.map(item => item.category).filter(Boolean)));

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setQuantities(prev => ({ ...prev, [itemId]: quantity }));
  };

  const handleCustomerPriceChange = (itemId: string, price: number) => {
    setCustomerPrices(prev => ({ ...prev, [itemId]: price }));
    setManuallyAdjusted(prev => ({ ...prev, [itemId]: true }));
  };

  const handleResetToRetail = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      setCustomerPrices(prev => ({ ...prev, [itemId]: item.retail_price || 0 }));
      setManuallyAdjusted(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleInvoiceNumberChange = (itemId: string, invoiceNumber: string) => {
    setInvoiceNumbers(prev => ({ ...prev, [itemId]: invoiceNumber }));
  };

  const handlePoLineChange = (itemId: string, poLine: string) => {
    setPoLines(prev => ({ ...prev, [itemId]: poLine }));
  };

  const handleAddPart = (item: any) => {
    const quantity = quantities[item.id] || 1;
    const customerPrice = customerPrices[item.id] || item.retail_price || 0;
    
    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    if (quantity > (item.current_stock || 0)) {
      toast.error(`Insufficient stock. Available: ${item.current_stock || 0}`);
      return;
    }

    const part: WorkOrderPartFormValues = {
      workOrderId,
      jobLineId,
      partName: item.name,
      partNumber: item.sku || '',
      quantity,
      supplierCost: item.cost || 0,
      customerPrice,
      description: item.description || '',
      invoiceNumber: invoiceNumbers[item.id] || '',
      poLine: poLines[item.id] || '',
      inventoryItemId: item.id
    };

    onAddPart(part);
    
    // Reset form for this item
    setQuantities(prev => ({ ...prev, [item.id]: 1 }));
    setCustomerPrices(prev => ({ ...prev, [item.id]: item.retail_price || 0 }));
    setManuallyAdjusted(prev => ({ ...prev, [item.id]: false }));
    setInvoiceNumbers(prev => ({ ...prev, [item.id]: '' }));
    setPoLines(prev => ({ ...prev, [item.id]: '' }));
    
    toast.success('Part added successfully');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading inventory items...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search inventory items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No inventory items found</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <Card key={item.id} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">SKU: {item.sku || 'N/A'}</p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.current_stock && item.current_stock > 0 ? 'default' : 'destructive'}>
                      Stock: {item.current_stock || 0}
                    </Badge>
                    <Badge variant="outline">
                      Cost: ${(item.cost || 0).toFixed(2)}
                    </Badge>
                    <Badge variant="outline">
                      Retail: ${(item.retail_price || 0).toFixed(2)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                    <Input
                      id={`quantity-${item.id}`}
                      type="number"
                      min="1"
                      max={item.current_stock || 0}
                      value={quantities[item.id] || 1}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Label htmlFor={`customer-price-${item.id}`}>Customer Price</Label>
                      {manuallyAdjusted[item.id] && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResetToRetail(item.id)}
                          className="h-6 px-2 text-xs"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Reset to Retail
                        </Button>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id={`customer-price-${item.id}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={customerPrices[item.id] || 0}
                        onChange={(e) => handleCustomerPriceChange(item.id, parseFloat(e.target.value) || 0)}
                        className={manuallyAdjusted[item.id] ? "border-yellow-400" : ""}
                      />
                      {manuallyAdjusted[item.id] && (
                        <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    {manuallyAdjusted[item.id] && (
                      <p className="text-xs text-yellow-600 mt-1">Manually adjusted from retail price</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`invoice-${item.id}`}>Invoice #</Label>
                    <Input
                      id={`invoice-${item.id}`}
                      value={invoiceNumbers[item.id] || ''}
                      onChange={(e) => handleInvoiceNumberChange(item.id, e.target.value)}
                      placeholder="Invoice number"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`po-line-${item.id}`}>PO Line</Label>
                    <Input
                      id={`po-line-${item.id}`}
                      value={poLines[item.id] || ''}
                      onChange={(e) => handlePoLineChange(item.id, e.target.value)}
                      placeholder="PO line"
                    />
                  </div>

                  <Button 
                    onClick={() => handleAddPart(item)}
                    disabled={!item.current_stock || item.current_stock <= 0}
                    className="w-full"
                  >
                    Add Part
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
