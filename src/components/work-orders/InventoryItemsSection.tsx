
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Package, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WorkOrderFormValues } from "@/hooks/useWorkOrderForm";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unitPrice: number;
  status: string;
}

// Mock data for inventory items - this would come from your inventory system
const inventoryItems = [
  {
    id: "INV-1001",
    name: "HVAC Filter - Premium",
    sku: "HVF-P-100",
    category: "HVAC",
    supplier: "TechSupplies Inc.",
    quantity: 45,
    unitPrice: 24.99,
    status: "In Stock",
  },
  {
    id: "INV-1002",
    name: "Copper Pipe - 3/4\" x 10'",
    sku: "CP-34-10",
    category: "Plumbing",
    supplier: "PlumbPro Distributors",
    quantity: 120,
    unitPrice: 18.75,
    status: "In Stock",
  },
  {
    id: "INV-1003",
    name: "Circuit Breaker - 30 Amp",
    sku: "CB-30A",
    category: "Electrical",
    supplier: "ElectroSupply Co.",
    quantity: 35,
    unitPrice: 42.50,
    status: "In Stock",
  },
  {
    id: "INV-1004",
    name: "Door Lock Set - Commercial Grade",
    sku: "DL-CG-100",
    category: "Security",
    supplier: "SecureTech Systems",
    quantity: 12,
    unitPrice: 89.99,
    status: "Low Stock",
  },
];

interface InventoryItemsSectionProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

export const InventoryItemsSection = ({ form }: InventoryItemsSectionProps) => {
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const selectedItems = form.watch("inventoryItems") || [];

  const handleAddItem = (item: InventoryItem) => {
    const currentItems = form.getValues("inventoryItems") || [];
    
    // Check if item already exists
    const existingItemIndex = currentItems.findIndex(i => i.id === item.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + 1
      };
      form.setValue("inventoryItems", updatedItems);
    } else {
      // Add new item
      form.setValue("inventoryItems", [
        ...currentItems,
        {
          id: item.id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          quantity: 1,
          unitPrice: item.unitPrice
        }
      ]);
    }
    
    setShowInventoryDialog(false);
  };

  const handleRemoveItem = (id: string) => {
    const currentItems = form.getValues("inventoryItems") || [];
    form.setValue("inventoryItems", currentItems.filter(item => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    const currentItems = form.getValues("inventoryItems") || [];
    const updatedItems = currentItems.map(item => 
      item.id === id ? { ...item, quantity } : item
    );
    
    form.setValue("inventoryItems", updatedItems);
  };

  return (
    <FormField
      name="inventoryItems"
      render={() => (
        <FormItem className="col-span-1 md:col-span-2">
          <FormLabel>Parts & Materials</FormLabel>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Add parts and materials from inventory that will be used for this work order
              </div>
              
              <Dialog open={showInventoryDialog} onOpenChange={setShowInventoryDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    Add Inventory Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Select Inventory Item</DialogTitle>
                    <DialogDescription>
                      Choose items from inventory to add to the work order.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[400px] overflow-y-auto mt-4">
                    <div className="space-y-3">
                      {inventoryItems.map((item) => (
                        <div 
                          key={item.id} 
                          className="flex justify-between items-center p-3 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer"
                          onClick={() => handleAddItem(item)}
                        >
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-slate-500">
                              {item.sku} - ${item.unitPrice.toFixed(2)} - {item.status}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {selectedItems.length > 0 ? (
              <div className="border rounded-md">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">SKU</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Total</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{item.sku}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          <div className="flex items-center justify-center">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <Input 
                              type="number" 
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 0)}
                              className="h-7 w-16 mx-1 text-center"
                              min={1}
                            />
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-right">${item.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-right">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-red-500"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 border border-dashed rounded-md text-center text-slate-500">
                No inventory items added yet. Use the button above to add items from inventory.
              </div>
            )}
          </div>
        </FormItem>
      )}
    />
  );
};
