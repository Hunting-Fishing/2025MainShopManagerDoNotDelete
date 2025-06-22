
import React, { useState, useEffect } from "react";
import { InventoryPageHeader } from "@/components/inventory/InventoryPageHeader";
import { InventoryStats } from "@/components/inventory/InventoryStats";
import { InventoryContent } from "@/components/inventory/InventoryContent";
import { InventoryLoadingState } from "@/components/inventory/InventoryLoadingState";
import { InventoryErrorState } from "@/components/inventory/InventoryErrorState";
import { useInventoryItems } from "@/hooks/inventory/useInventoryItems";
import { updateInventoryItem, getInventoryStatistics } from "@/services/inventoryService";
import { InventoryItemExtended } from "@/types/inventory";

export default function Inventory() {
  const { items, isLoading, fetchItems } = useInventoryItems();
  const [error, setError] = useState<string | null>(null);
  const [inventoryStats, setInventoryStats] = useState({
    totalItems: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalValue: 0
  });

  useEffect(() => {
    const calculateStats = async () => {
      try {
        const stats = await getInventoryStatistics();
        setInventoryStats(stats);
      } catch (error) {
        console.error('Error calculating inventory stats:', error);
        setError('Failed to load inventory statistics');
      }
    };

    calculateStats();
  }, [items]);

  const handleUpdateItem = async (
    id: string, 
    updates: Partial<InventoryItemExtended>
  ): Promise<InventoryItemExtended> => {
    try {
      const updatedItem = await updateInventoryItem(id, updates);
      await fetchItems(); // Refresh the list
      return updatedItem;
    } catch (error) {
      console.error("Failed to update inventory item:", error);
      throw error;
    }
  };

  if (isLoading) {
    return <InventoryLoadingState />;
  }

  if (error) {
    return <InventoryErrorState error={error} />;
  }

  return (
    <div className="container mx-auto space-y-6">
      <InventoryPageHeader />
      
      <InventoryStats
        totalItems={inventoryStats.totalItems}
        lowStockCount={inventoryStats.lowStockCount}
        outOfStockCount={inventoryStats.outOfStockCount}
        totalValue={inventoryStats.totalValue}
      />

      <InventoryContent 
        items={items}
        onUpdateItem={handleUpdateItem}
      />
    </div>
  );
}
