
import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useWorkOrderInventoryManager } from "@/hooks/inventory/useWorkOrderInventoryManager";
import { AddInventoryItemDialog } from "../inventory/AddInventoryItemDialog";
import { Package } from "lucide-react";
import { WorkOrderInventoryTable } from "../inventory/WorkOrderInventoryTable";
import { WorkOrderInventoryItem } from "@/types/workOrder";

interface InventorySectionProps {
  workOrderId: string;
}

export function InventorySection({ workOrderId }: InventorySectionProps) {
  const {
    loading,
    items,
    addInventoryItem,
    removeInventoryItem,
    updateInventoryItem,
    fetchInventoryItems
  } = useWorkOrderInventoryManager(workOrderId);
  
  const [inventoryItems, setInventoryItems] = useState<WorkOrderInventoryItem[]>([]);

  useEffect(() => {
    const loadItems = async () => {
      const fetchedItems = await fetchInventoryItems();
      setInventoryItems(fetchedItems || []);
    };
    
    loadItems();
  }, [workOrderId, fetchInventoryItems]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Parts & Inventory</CardTitle>
        </div>
        <AddInventoryItemDialog onAddItem={addInventoryItem} />
      </CardHeader>
      <CardContent>
        <WorkOrderInventoryTable
          workOrderId={workOrderId}
          items={inventoryItems}
          onRemoveItem={removeInventoryItem}
          onUpdateItem={updateInventoryItem}
          onUpdateQuantity={(id, quantity) => updateInventoryItem(id, { quantity })}
        />
      </CardContent>
    </Card>
  );
}
