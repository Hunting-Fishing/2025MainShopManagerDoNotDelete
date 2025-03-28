
import React from "react";
import { Plus, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  description: string;
}

interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

interface InvoiceItemsManagerProps {
  items: InvoiceItem[];
  inventoryItems: InventoryItem[];
  showInventoryDialog: boolean;
  setShowInventoryDialog: (show: boolean) => void;
  onAddInventoryItem: (item: InventoryItem) => void;
  onAddLaborItem: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItemQuantity: (id: string, quantity: number) => void;
  onUpdateItemDescription: (id: string, description: string) => void;
  onUpdateItemPrice: (id: string, price: number) => void;
}

export function InvoiceItemsManager({
  items,
  inventoryItems,
  showInventoryDialog,
  setShowInventoryDialog,
  onAddInventoryItem,
  onAddLaborItem,
  onRemoveItem,
  onUpdateItemQuantity,
  onUpdateItemDescription,
  onUpdateItemPrice,
}: InvoiceItemsManagerProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Invoice Items</h2>
        <div className="flex gap-2">
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
                  Choose items from inventory to add to the invoice.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[400px] overflow-y-auto">
                <div className="space-y-4 mt-2">
                  {inventoryItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex justify-between items-center p-3 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer"
                      onClick={() => onAddInventoryItem(item)}
                    >
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-slate-500">{item.sku} - ${item.price.toFixed(2)}</div>
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
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={onAddLaborItem}
          >
            <Plus className="h-4 w-4" />
            Add Labor
          </Button>
        </div>
      </div>
      
      {/* Items list */}
      {items.length > 0 ? (
        <div className="mt-4 border rounded-md">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Item</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Qty</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Total</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    <Input 
                      value={item.description} 
                      onChange={(e) => onUpdateItemDescription(item.id, e.target.value)}
                      className="h-8 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <div className="flex items-center justify-center">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => onUpdateItemQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <Input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => onUpdateItemQuantity(item.id, parseInt(e.target.value) || 0)}
                        className="h-7 w-16 mx-1 text-center"
                        min={1}
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => onUpdateItemQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex items-center justify-end">
                      <span className="mr-1">$</span>
                      <Input 
                        type="number" 
                        value={item.price}
                        onChange={(e) => onUpdateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                        className="h-7 w-24 text-right"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-right">
                    ${item.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-red-500"
                      onClick={() => onRemoveItem(item.id)}
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
          No items added yet. Use the buttons above to add items from inventory or add labor.
        </div>
      )}
    </>
  );
}
