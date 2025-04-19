
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Package, Plus, Search, Trash2, Calculator } from "lucide-react";
import { useInventoryManager } from "@/hooks/inventory/useInventoryManager";
import { InventoryItemExtended } from "@/types/inventory";
import { WorkOrderInventoryItem } from "@/types/workOrder";
import { getAllInventoryItems } from "@/services/inventory";
import { toast } from "@/hooks/use-toast";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Combobox } from '../fields/Combobox';

interface WorkOrderPartsEstimatorProps {
  initialItems?: WorkOrderInventoryItem[];
  onItemsChange: (items: WorkOrderInventoryItem[]) => void;
  readOnly?: boolean;
}

export function WorkOrderPartsEstimator({ 
  initialItems = [], 
  onItemsChange,
  readOnly = false
}: WorkOrderPartsEstimatorProps) {
  const [items, setItems] = useState<WorkOrderInventoryItem[]>(initialItems);
  const [inventoryItems, setInventoryItems] = useState<InventoryItemExtended[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<InventoryItemExtended[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItemExtended | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  const { checkItemAvailability } = useInventoryManager();

  // Fetch all inventory items on component mount
  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const data = await getAllInventoryItems();
        setInventoryItems(data);
        setFilteredItems(data);
      } catch (error) {
        console.error("Error fetching inventory items:", error);
        toast({
          title: "Error",
          description: "Failed to load inventory items",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // Filter items based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(inventoryItems);
      return;
    }
    
    const lowercasedSearch = searchTerm.toLowerCase();
    const filtered = inventoryItems.filter(item => 
      item.name.toLowerCase().includes(lowercasedSearch) || 
      item.sku.toLowerCase().includes(lowercasedSearch) ||
      item.category.toLowerCase().includes(lowercasedSearch)
    );
    
    setFilteredItems(filtered);
  }, [searchTerm, inventoryItems]);

  // Add item to estimate
  const handleAddItem = async () => {
    if (!selectedItem) return;
    
    // Check if we already have this item in the list
    const existingItemIndex = items.findIndex(item => item.id === selectedItem.id);
    
    // Check availability in inventory
    const availability = await checkItemAvailability(selectedItem.id, quantity);
    
    if (!availability.available) {
      toast({
        title: "Inventory Warning",
        description: availability.message,
        variant: "warning"
      });
    }
    
    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].totalPrice = 
        updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unitPrice;
      
      setItems(updatedItems);
      onItemsChange(updatedItems);
    } else {
      // Add new item
      const newItem: WorkOrderInventoryItem = {
        id: selectedItem.id,
        name: selectedItem.name,
        sku: selectedItem.sku,
        category: selectedItem.category,
        quantity: quantity,
        unitPrice: selectedItem.unitPrice,
        itemStatus: availability.available ? 'in-stock' : 'ordered',
        totalPrice: selectedItem.unitPrice * quantity
      };
      
      const newItems = [...items, newItem];
      setItems(newItems);
      onItemsChange(newItems);
    }
    
    // Reset selection
    setSelectedItem(null);
    setQuantity(1);
    
    toast({
      title: "Item Added",
      description: `${selectedItem.name} added to estimate`,
    });
  };
  
  // Remove item from estimate
  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    onItemsChange(updatedItems);
  };
  
  // Update item quantity
  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedItems = [...items];
    updatedItems[index].quantity = newQuantity;
    updatedItems[index].totalPrice = updatedItems[index].unitPrice * newQuantity;
    
    setItems(updatedItems);
    onItemsChange(updatedItems);
  };
  
  // Calculate total estimate
  const estimateTotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  
  const handleItemSelect = (itemId: string) => {
    const item = inventoryItems.find(i => i.id === itemId);
    if (item) {
      setSelectedItem(item);
    }
  };

  return (
    <Card>
      <CardHeader className="bg-slate-50 pb-3 border-b">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Package className="h-5 w-5" />
          Parts Estimation
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        {!readOnly && (
          <div className="mb-6 p-4 bg-slate-50 rounded-md">
            <h3 className="font-medium mb-3">Add Parts to Estimate</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <Label htmlFor="part-selection" className="mb-1 block">Select Part</Label>
                <Combobox
                  items={filteredItems.map(item => ({
                    label: `${item.name} (${item.sku})`,
                    value: item.id
                  }))}
                  placeholder="Search parts..."
                  onItemSelected={handleItemSelect}
                  isDisabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="quantity" className="mb-1 block">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleAddItem} 
                  disabled={!selectedItem || loading}
                  className="w-full"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add to Estimate
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {items.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead className="text-right">Total</TableHead>
                {!readOnly && <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    {readOnly ? (
                      item.quantity
                    ) : (
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                        className="w-16 h-8"
                      />
                    )}
                  </TableCell>
                  <TableCell className="text-right">${(item.totalPrice || 0).toFixed(2)}</TableCell>
                  {!readOnly && (
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            <Package className="mx-auto h-12 w-12 text-slate-300 mb-2" />
            <p>No parts added to this estimate yet.</p>
            {!readOnly && <p className="text-sm">Search for parts above to add them to your estimate.</p>}
          </div>
        )}
      </CardContent>
      
      {items.length > 0 && (
        <CardFooter className="flex justify-between pt-2 border-t bg-slate-50">
          <div className="flex items-center">
            <Calculator className="h-5 w-5 text-slate-500 mr-2" />
            <span className="font-medium text-slate-600">Total Estimate:</span>
          </div>
          <span className="text-lg font-bold">${estimateTotal.toFixed(2)}</span>
        </CardFooter>
      )}
    </Card>
  );
}
