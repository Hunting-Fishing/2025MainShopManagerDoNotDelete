
import { useState } from "react";
import { toast } from "sonner";
import { InventoryItemExtended } from "@/types/inventory";
import { supabase } from "@/integrations/supabase/client";

export function useManualReorder() {
  const [isReordering, setIsReordering] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItemExtended | null>(null);
  const [quantity, setQuantity] = useState(0);

  const selectItemForReorder = (item: InventoryItemExtended, defaultQuantity?: number) => {
    setSelectedItem(item);
    setQuantity(defaultQuantity || item.reorder_point || 10);
  };

  const clearSelection = () => {
    setSelectedItem(null);
    setQuantity(0);
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(Math.max(1, newQuantity));
  };

  const submitReorder = async () => {
    if (!selectedItem) return;
    
    setIsReordering(true);
    try {
      const { error } = await supabase.from('inventory_orders').insert({
        item_id: selectedItem.id,
        quantity_ordered: quantity,
        supplier: selectedItem.supplier,
        expected_arrival: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        status: 'ordered'
      });

      if (error) throw error;
      
      toast("Reorder submitted successfully", {
        description: `Ordered ${quantity} units of ${selectedItem.name}`
      });
      
      clearSelection();
    } catch (err) {
      console.error("Error submitting reorder:", err);
      toast("Failed to submit reorder", {
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsReordering(false);
    }
  };

  return {
    isReordering,
    selectedItem,
    quantity,
    selectItemForReorder,
    clearSelection,
    handleQuantityChange,
    submitReorder
  };
}
