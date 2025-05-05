
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import HierarchicalServiceSelector from "./services/HierarchicalServiceSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface PartItem {
  id: string;
  partNumber: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PartsAndServicesTableProps {
  items: PartItem[];
  setItems: React.Dispatch<React.SetStateAction<PartItem[]>>;
}

export function PartsAndServicesTable({ items, setItems }: PartsAndServicesTableProps) {
  const [newItem, setNewItem] = useState<Omit<PartItem, "id" | "total">>({
    partNumber: "",
    name: "",
    quantity: 1,
    unitPrice: 0
  });

  const handleServiceSelected = (service: {
    mainCategory: string;
    subcategory: string;
    job: string;
    estimatedTime?: number;
  }) => {
    // Add the selected service as a line item
    const serviceItem: PartItem = {
      id: Math.random().toString(36).substr(2, 9),
      partNumber: "",
      name: `${service.job} (${service.mainCategory} - ${service.subcategory})`,
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    
    setItems(prev => [...prev, serviceItem]);
    toast.success(`Added service: ${service.job}`);
  };

  const addNewItem = () => {
    if (!newItem.name) {
      toast.error("Please enter an item name");
      return;
    }

    const item: PartItem = {
      id: Math.random().toString(36).substr(2, 9),
      ...newItem,
      total: newItem.quantity * newItem.unitPrice
    };

    setItems(prev => [...prev, item]);
    setNewItem({
      partNumber: "",
      name: "",
      quantity: 1,
      unitPrice: 0
    });
  };

  const updateItem = (id: string, field: keyof Omit<PartItem, "id" | "total">, value: any) => {
    setItems(prev => 
      prev.map(item => {
        if (item.id === id) {
          const updatedItem = { 
            ...item, 
            [field]: value,
            total: field === "quantity" || field === "unitPrice" 
              ? (field === "quantity" ? value : item.quantity) * (field === "unitPrice" ? value : item.unitPrice)
              : item.total
          };
          return updatedItem;
        }
        return item;
      })
    );
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + item.total, 0);
  };

  return (
    <Card>
      <CardHeader className="bg-slate-50">
        <CardTitle className="text-lg font-bold">Parts & Services</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <div className="mb-4">
            <HierarchicalServiceSelector onServiceSelected={handleServiceSelected} />
          </div>
          
          <div className="text-sm text-muted-foreground mb-2">Or add a custom part/service:</div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-24">
              <label className="text-xs font-medium">Part #</label>
              <Input
                placeholder="Part #"
                value={newItem.partNumber}
                onChange={(e) => setNewItem({ ...newItem, partNumber: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium">Description</label>
              <Input
                placeholder="Description"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="w-20">
              <label className="text-xs font-medium">Qty</label>
              <Input
                type="number"
                min="1"
                placeholder="Qty"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                className="mt-1"
              />
            </div>
            <div className="w-28">
              <label className="text-xs font-medium">Unit Price</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Price"
                value={newItem.unitPrice}
                onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
            <Button 
              type="button" 
              onClick={addNewItem}
              size="sm"
              className="bg-indigo-600"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-100 text-sm">
                <th className="py-2 px-3 text-left w-16">QTY</th>
                <th className="py-2 px-3 text-left w-32">PART NO.</th>
                <th className="py-2 px-3 text-left">DESCRIPTION</th>
                <th className="py-2 px-3 text-right w-24">UNIT PRICE</th>
                <th className="py-2 px-3 text-right w-24">TOTAL</th>
                <th className="py-2 px-3 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No parts or services added yet. Use the form above to add items.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                        className="w-full h-8 text-sm"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        value={item.partNumber}
                        onChange={(e) => updateItem(item.id, "partNumber", e.target.value)}
                        className="w-full h-8 text-sm"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(item.id, "name", e.target.value)}
                        className="w-full h-8 text-sm"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                        className="w-full h-8 text-sm text-right"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-medium">
                      ${item.total.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteItem(item.id)}
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="border-t">
                <td colSpan={3} className="py-2 px-3"></td>
                <td className="py-2 px-3 text-right font-medium">SUBTOTAL:</td>
                <td className="py-2 px-3 text-right font-medium">${calculateTotal().toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
