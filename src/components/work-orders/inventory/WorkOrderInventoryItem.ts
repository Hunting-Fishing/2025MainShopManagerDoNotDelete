
// Type definition for work order inventory items
export interface WorkOrderInventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit_price: number;
  total: number;
}

// Extended type with additional properties for special order items
export interface ExtendedWorkOrderInventoryItem extends WorkOrderInventoryItem {
  itemStatus?: "special-order" | "ordered" | "in-stock";
  estimatedArrivalDate?: string;
  supplierName?: string;
  supplierOrderRef?: string;
  notes?: string;
}

// Export the type for use in other files
export default WorkOrderInventoryItem;
