
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useInventoryCrud } from "@/hooks/inventory/useInventoryCrud";
import { InventoryItemExtended } from "@/types/inventory";

export interface PartsAndServicesTableProps {
  items: any[];
  setItems: React.Dispatch<React.SetStateAction<any[]>>;
}

export function PartsAndServicesTable({ items, setItems }: PartsAndServicesTableProps) {
  const [showInventorySelector, setShowInventorySelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [inventoryItems, setInventoryItems] = useState<InventoryItemExtended[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItemExtended[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { loadInventoryItems } = useInventoryCrud();
  
  // Load inventory items
  useEffect(() => {
    const fetchInventory = async () => {
      setIsLoading(true);
      try {
        const items = await loadInventoryItems();
        setInventoryItems(items);
        setFilteredItems(items);
      } catch (error) {
        console.error("Failed to load inventory items:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (showInventorySelector) {
      fetchInventory();
    }
  }, [showInventorySelector, loadInventoryItems]);
  
  // Filter inventory items based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredItems(inventoryItems);
    } else {
      const lowercaseSearch = searchTerm.toLowerCase();
      const filtered = inventoryItems.filter(item => 
        item.name.toLowerCase().includes(lowercaseSearch) || 
        item.sku.toLowerCase().includes(lowercaseSearch) ||
        item.category.toLowerCase().includes(lowercaseSearch)
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, inventoryItems]);
  
  const handleAddPart = (item: InventoryItemExtended) => {
    // Add inventory item to work order parts list
    setItems([...items, {
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: 1,
      unitPrice: item.unitPrice,
      sku: item.sku
    }]);
  };
  
  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };
  
  return (
    <Card>
      <CardHeader className="bg-slate-50">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Parts</span>
          <Button 
            onClick={() => setShowInventorySelector(!showInventorySelector)} 
            variant="outline" 
            size="sm"
            className="text-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Part
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Fixed height inventory selector container to prevent layout shifts */}
        <div className="min-h-[320px] relative">
          {showInventorySelector && (
            <div className="p-4 border-b">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    type="text"
                    placeholder="Search inventory parts..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {isLoading ? (
                <div className="text-center py-4">
                  <p className="text-slate-500">Loading inventory parts...</p>
                </div>
              ) : filteredItems.length > 0 ? (
                <div className="max-h-64 overflow-y-auto border rounded-md">
                  <table className="w-full">
                    <thead className="bg-slate-50 sticky top-0 z-10">
                      <tr>
                        <th className="text-left p-2 text-xs font-medium text-slate-500">Part Name</th>
                        <th className="text-left p-2 text-xs font-medium text-slate-500">SKU</th>
                        <th className="text-left p-2 text-xs font-medium text-slate-500">Price</th>
                        <th className="text-left p-2 text-xs font-medium text-slate-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => (
                        <tr key={item.id} className="border-t hover:bg-slate-50">
                          <td className="p-2">{item.name}</td>
                          <td className="p-2">{item.sku}</td>
                          <td className="p-2">${item.unitPrice?.toFixed(2)}</td>
                          <td className="p-2">
                            <Button 
                              onClick={() => handleAddPart(item)} 
                              variant="ghost" 
                              size="sm"
                              className="h-8 px-2 py-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 border rounded-md">
                  <p className="text-slate-500">No parts match your search criteria</p>
                </div>
              )}
              
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowInventorySelector(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          )}

          {/* Selected parts list with consistent height */}
          <div className={`${!showInventorySelector && items.length === 0 ? 'min-h-[150px] flex items-center justify-center' : ''}`}>
            {items.length > 0 ? (
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left p-3 text-xs font-medium text-slate-500">Part</th>
                    <th className="text-left p-3 text-xs font-medium text-slate-500">SKU</th>
                    <th className="text-left p-3 text-xs font-medium text-slate-500">Price</th>
                    <th className="text-left p-3 text-xs font-medium text-slate-500">Qty</th>
                    <th className="text-left p-3 text-xs font-medium text-slate-500">Total</th>
                    <th className="text-left p-3 text-xs font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3">{item.name}</td>
                      <td className="p-3">{item.sku}</td>
                      <td className="p-3">${parseFloat(item.unitPrice).toFixed(2)}</td>
                      <td className="p-3">{item.quantity}</td>
                      <td className="p-3">${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}</td>
                      <td className="p-3">
                        <Button 
                          onClick={() => handleRemoveItem(index)} 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              !showInventorySelector && (
                <div className="p-6 text-center text-slate-500">
                  No parts added yet. Click "Add Part" to begin.
                </div>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
