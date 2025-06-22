
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useInventoryItems } from '@/hooks/inventory/useInventoryItems';
import { InventoryPageHeader } from './InventoryPageHeader';
import { InventoryStatsCards } from './InventoryStatsCards';
import { InventoryContent } from './InventoryContent';
import { updateInventoryItem } from '@/services/inventoryService';
import { InventoryItemExtended } from '@/types/inventory';

export function InventoryPageContainer() {
  const { items, isLoading, fetchItems } = useInventoryItems();

  const handleUpdateItem = async (id: string, updates: Partial<InventoryItemExtended>): Promise<InventoryItemExtended> => {
    try {
      const updatedItem = await updateInventoryItem(id, updates);
      await fetchItems(); // Refresh data after update
      return updatedItem;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <InventoryPageHeader />
        <div className="flex items-center justify-center py-12">
          <Card className="w-full max-w-md">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Loading Inventory</h3>
                  <p className="text-muted-foreground">Fetching real-time data...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <InventoryPageHeader />
      <InventoryStatsCards items={items} />
      <InventoryContent items={items} onUpdateItem={handleUpdateItem} />
    </div>
  );
}
