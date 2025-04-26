
import { InventoryItemExtended, AutoReorderSettings } from "@/types/inventory";
import { WorkOrderInventoryItem } from "@/types/workOrder";

// Create a new inventory item
export async function createInventoryItem(item: Omit<InventoryItemExtended, "id">): Promise<InventoryItemExtended> {
  // This would be an API call in a real application
  // For now, we'll simulate a successful response
  return {
    id: `inv-${Date.now()}`,
    ...item
  };
}

// Update an existing inventory item
export async function updateInventoryItem(id: string, item: Partial<InventoryItemExtended>): Promise<InventoryItemExtended> {
  // This would be an API call in a real application
  // For now, we'll simulate a successful response
  return {
    id,
    ...item
  } as InventoryItemExtended;
}

// Enable auto-reorder for an inventory item
export async function enableAutoReorder(itemId: string, settings: AutoReorderSettings): Promise<boolean> {
  // This would be an API call in a real application
  // For now, we'll simulate a successful response
  console.log(`Auto-reorder enabled for item ${itemId}`, settings);
  return true;
}

// Disable auto-reorder for an inventory item
export async function disableAutoReorder(itemId: string): Promise<boolean> {
  // This would be an API call in a real application
  // For now, we'll simulate a successful response
  console.log(`Auto-reorder disabled for item ${itemId}`);
  return true;
}

// Update inventory quantity for work order
export async function updateWorkOrderInventoryItems(workOrderId: string, items: { inventoryId: string; quantity: number }[]): Promise<void> {
  // This would be an API call in a real application
  // For now, we'll log the update and simulate success
  console.log(`Updating inventory for work order ${workOrderId}:`, items);
  // No return value needed as this is a void function
}

// Reorder an inventory item
export async function reorderItem(itemId: string, quantity: number): Promise<boolean> {
  // This would be an API call in a real application
  console.log(`Reordering ${quantity} units of item ${itemId}`);
  return true;
}

// Get all inventory items
export async function getInventoryItems(): Promise<InventoryItemExtended[]> {
  // This would be an API call in a real application
  // For now, we'll return mock data
  return [
    {
      id: 'inv-1',
      name: 'Oil Filter',
      sku: 'OIL-F-103',
      category: 'Filters',
      supplier: 'AutoParts Inc',
      quantity: 15,
      min_stock_level: 10,
      reorderPoint: 10,
      unit_price: 8.99,
      unitPrice: 8.99,
      location: 'Shelf A3',
      status: 'In Stock',
      description: 'Standard oil filter for most vehicles',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'inv-2',
      name: 'Brake Pad Set',
      sku: 'BRK-P-254',
      category: 'Brakes',
      supplier: 'BrakeMasters',
      quantity: 5,
      min_stock_level: 8,
      reorderPoint: 8,
      unit_price: 45.99,
      unitPrice: 45.99,
      location: 'Shelf B2',
      status: 'Low Stock',
      description: 'Front brake pad set for sedans',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
}

// Clear all inventory items (for demo/reset purposes)
export async function clearAllInventoryItems(): Promise<boolean> {
  // This would be an API call in a real application
  console.log('Clearing all inventory items');
  return true;
}
