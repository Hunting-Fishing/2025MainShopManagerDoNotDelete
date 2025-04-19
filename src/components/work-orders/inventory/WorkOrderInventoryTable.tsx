
import { WorkOrderInventoryItem } from "@/types/workOrder";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface WorkOrderInventoryTableProps {
  workOrderId?: string;
  items?: WorkOrderInventoryItem[];
  onRemoveItem: (id: string) => void;
  onUpdateItem?: (id: string, updates: Partial<WorkOrderInventoryItem>) => void;
  onUpdateQuantity?: (id: string, quantity: number) => void;
}

export function WorkOrderInventoryTable({
  workOrderId,
  items: propItems,
  onRemoveItem,
  onUpdateItem,
  onUpdateQuantity
}: WorkOrderInventoryTableProps) {
  const [items, setItems] = useState<WorkOrderInventoryItem[]>([]);

  // If items are passed as props, use them
  useEffect(() => {
    if (propItems) {
      setItems(propItems);
    }
  }, [propItems]);

  // If workOrderId is provided, fetch items from supabase
  useEffect(() => {
    if (!workOrderId || propItems) return; // Skip if items are provided via props

    const fetchItems = async () => {
      const { data } = await supabase
        .from('work_order_inventory_items')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: true });

      if (data) {
        setItems(data as WorkOrderInventoryItem[]);
      }
    };

    fetchItems();

    // Subscribe to changes
    const channel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_order_inventory_items',
          filter: `work_order_id=eq.${workOrderId}`
        },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workOrderId, propItems]);

  // Handle quantity updates
  const handleQuantityUpdate = (itemId: string, newQuantity: number) => {
    if (onUpdateQuantity) {
      onUpdateQuantity(itemId, newQuantity);
    } else if (onUpdateItem) {
      onUpdateItem(itemId, { quantity: newQuantity });
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No items added to this work order yet
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-muted/50">
          <tr>
            <th className="px-4 py-2">Item</th>
            <th className="px-4 py-2">SKU</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2 text-right">Quantity</th>
            <th className="px-4 py-2 text-right">Unit Price</th>
            <th className="px-4 py-2 text-right">Total</th>
            <th className="px-4 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((item) => (
            <tr key={item.id} className="bg-card">
              <td className="px-4 py-2">
                <div>
                  <div className="font-medium">{item.name}</div>
                  {item.notes && (
                    <div className="text-xs text-muted-foreground">{item.notes}</div>
                  )}
                </div>
              </td>
              <td className="px-4 py-2">{item.sku}</td>
              <td className="px-4 py-2">
                <Badge variant="outline">{item.category}</Badge>
              </td>
              <td className="px-4 py-2 text-right">{item.quantity}</td>
              <td className="px-4 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
              <td className="px-4 py-2 text-right">
                {formatCurrency(item.quantity * item.unitPrice)}
              </td>
              <td className="px-4 py-2 text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-medium">
            <td colSpan={5} className="px-4 py-2 text-right">
              Total
            </td>
            <td className="px-4 py-2 text-right">
              {formatCurrency(
                items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
              )}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
