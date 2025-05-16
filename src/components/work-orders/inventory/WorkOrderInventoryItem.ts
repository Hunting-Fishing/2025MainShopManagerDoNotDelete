
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

// Export the type for use in other files
export default WorkOrderInventoryItem;
