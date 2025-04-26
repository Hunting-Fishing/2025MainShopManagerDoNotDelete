
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Plus, Search, X } from "lucide-react";
import { WorkOrderInventoryItem } from "@/types/workOrder";
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from '@/lib/supabase';
import { InventoryItem } from '@/types/inventory';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WorkOrderPartsEstimatorProps {
  initialItems: WorkOrderInventoryItem[];
  onItemsChange: (items: WorkOrderInventoryItem[]) => void;
  readOnly?: boolean;
}

export function WorkOrderPartsEstimator({
  initialItems = [],
  onItemsChange,
  readOnly = false
}: WorkOrderPartsEstimatorProps) {
  const [items, setItems] = useState<WorkOrderInventoryItem[]>(initialItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const calculateItemTotal = (item: WorkOrderInventoryItem): number => {
    return item.totalPrice !== undefined ? item.totalPrice : (item.quantity * item.unitPrice);
  };

  const estimateTotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);

  const handleAddItem = async (inventoryItem: InventoryItem) => {
    const newItem: WorkOrderInventoryItem = {
      id: uuidv4(),
      name: inventoryItem.name,
      sku: inventoryItem.sku || '',
      category: inventoryItem.category || 'General',
      quantity: 1,
      unitPrice: inventoryItem.price,
      totalPrice: inventoryItem.price,
      itemStatus: 'in-stock',
      supplierName: inventoryItem.supplier || ''
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    onItemsChange(updatedItems);
    setIsAddDialogOpen(false);
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) quantity = 1;
    
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const newQuantity = quantity;
        const total = newQuantity * item.unitPrice;
        return { 
          ...item, 
          quantity: newQuantity,
          totalPrice: total
        };
      }
      return item;
    });
    
    setItems(updatedItems);
    onItemsChange(updatedItems);
  };

  const handleRemoveItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    onItemsChange(updatedItems);
  };

  const searchInventory = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching inventory:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Parts & Materials</h3>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> Add Part
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Part from Inventory</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={searchInventory} className="flex items-center gap-1">
                    <Search className="h-4 w-4" /> Search
                  </Button>
                </div>

                <ScrollArea className="h-[300px] border rounded-md">
                  {isSearching ? (
                    <div className="flex justify-center items-center h-full">
                      <p>Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchResults.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.sku}</TableCell>
                            <TableCell>${item.price.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                onClick={() => handleAddItem(item)}
                              >
                                Add
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center p-4">
                      {searchTerm ? "No results found" : "Search for parts"}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {items.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Unit Price</TableHead>
                {!readOnly && <TableHead>Quantity</TableHead>}
                <TableHead className="text-right">Total</TableHead>
                {!readOnly && <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                  {!readOnly && (
                    <TableCell>
                      <div className="flex items-center w-20">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-r-none"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                          className="h-8 text-center rounded-none w-10"
                          min={1}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-l-none"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="text-right">${calculateItemTotal(item).toFixed(2)}</TableCell>
                  {!readOnly && (
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              <TableRow>
                <TableCell 
                  colSpan={readOnly ? 3 : 4} 
                  className="text-right font-semibold"
                >
                  Total:
                </TableCell>
                <TableCell className="text-right font-bold">
                  ${estimateTotal.toFixed(2)}
                </TableCell>
                {!readOnly && <TableCell></TableCell>}
              </TableRow>
            </TableBody>
          </Table>
        </>
      ) : (
        <div className="border border-dashed rounded-md p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-medium mb-1">No Parts Added</h3>
          <p className="text-slate-500 mb-4">
            Add parts and materials to estimate costs for this work order.
          </p>
          {!readOnly && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add First Part
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
