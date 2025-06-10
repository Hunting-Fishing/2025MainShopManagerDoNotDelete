
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Save, Search } from 'lucide-react';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { saveWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InventoryItem {
  id: string;
  name: string;
  part_number?: string;
  category?: string;
  cost_price?: number;
  retail_price?: number;
  quantity?: number;
  location?: string;
}

interface InventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
  onPartSaved: () => void;
}

export function InventoryPartsTab({
  workOrderId,
  jobLineId,
  onAddPart,
  onPartSaved
}: InventoryPartsTabProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customerPrice, setCustomerPrice] = useState(0);

  useEffect(() => {
    loadInventoryItems();
  }, []);

  const loadInventoryItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('parts_inventory')
        .select('*')
        .order('name');

      if (error) throw error;

      setInventoryItems(data || []);
    } catch (error) {
      console.error('Error loading inventory items:', error);
      toast.error('Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.part_number && item.part_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setCustomerPrice(item.retail_price || item.cost_price || 0);
    setQuantity(1);
  };

  const handleAddToList = () => {
    if (!selectedItem) {
      toast.error('Please select an inventory item');
      return;
    }

    const partData: WorkOrderPartFormValues = {
      partName: selectedItem.name,
      partNumber: selectedItem.part_number || '',
      supplierName: '',
      supplierCost: selectedItem.cost_price || 0,
      supplierSuggestedRetailPrice: selectedItem.retail_price || 0,
      markupPercentage: 0,
      retailPrice: selectedItem.retail_price || 0,
      customerPrice: customerPrice,
      quantity: quantity,
      partType: 'inventory',
      inventoryItemId: selectedItem.id,
      category: selectedItem.category || '',
      isTaxable: true,
      coreChargeAmount: 0,
      coreChargeApplied: false,
      status: 'received',
      isStockItem: true,
      notes: '',
      attachments: []
    };

    onAddPart(partData);
    setSelectedItem(null);
    setQuantity(1);
    setCustomerPrice(0);
    toast.success('Part added to list');
  };

  const handleSaveDirectly = async () => {
    if (!selectedItem) {
      toast.error('Please select an inventory item');
      return;
    }

    setIsSubmitting(true);
    try {
      const partData: WorkOrderPartFormValues = {
        partName: selectedItem.name,
        partNumber: selectedItem.part_number || '',
        supplierName: '',
        supplierCost: selectedItem.cost_price || 0,
        supplierSuggestedRetailPrice: selectedItem.retail_price || 0,
        markupPercentage: 0,
        retailPrice: selectedItem.retail_price || 0,
        customerPrice: customerPrice,
        quantity: quantity,
        partType: 'inventory',
        inventoryItemId: selectedItem.id,
        category: selectedItem.category || '',
        isTaxable: true,
        coreChargeAmount: 0,
        coreChargeApplied: false,
        status: 'received',
        isStockItem: true,
        notes: '',
        attachments: []
      };

      console.log('Saving inventory part:', partData);
      await saveWorkOrderPart(workOrderId, jobLineId, partData);
      
      setSelectedItem(null);
      setQuantity(1);
      setCustomerPrice(0);
      toast.success('Part saved successfully');
      onPartSaved();
    } catch (error) {
      console.error('Error saving part:', error);
      toast.error('Failed to save part: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search by part name or number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Available Parts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading inventory...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              {searchTerm ? 'No parts found matching your search' : 'No inventory items available'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Part Number</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Retail</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow
                    key={item.id}
                    className={selectedItem?.id === item.id ? 'bg-muted' : ''}
                  >
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.part_number || '-'}</TableCell>
                    <TableCell>{item.category || '-'}</TableCell>
                    <TableCell>${(item.cost_price || 0).toFixed(2)}</TableCell>
                    <TableCell>${(item.retail_price || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={item.quantity && item.quantity > 0 ? 'default' : 'destructive'}>
                        {item.quantity || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={selectedItem?.id === item.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSelectItem(item)}
                      >
                        {selectedItem?.id === item.id ? 'Selected' : 'Select'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Selected Item Details */}
      {selectedItem && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Part: {selectedItem.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPrice">Customer Price</Label>
                <Input
                  id="customerPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={customerPrice}
                  onChange={(e) => setCustomerPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Price:</span>
                <span className="text-lg font-bold">${(quantity * customerPrice).toFixed(2)}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {quantity} × ${customerPrice.toFixed(2)}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={handleAddToList}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add to List
              </Button>
              <Button
                onClick={handleSaveDirectly}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Saving...' : 'Save Part'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
