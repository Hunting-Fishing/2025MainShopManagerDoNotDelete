
// This is a partial fix for the specific error in InvoiceCreate.tsx
// We're creating an adapter function to handle the type conversion
import { InventoryItem } from "@/types/inventory";
import { InvoiceItem } from "@/types/invoice"; 

// Create an adapter function that converts InventoryItem to InvoiceItem
export const createInventoryItemAdapter = (callback: (item: InvoiceItem) => void) => {
  return (inventoryItem: InventoryItem) => {
    // Convert InventoryItem to InvoiceItem
    const invoiceItem: InvoiceItem = {
      id: inventoryItem.id,
      name: inventoryItem.name,
      sku: inventoryItem.sku,
      description: inventoryItem.description || "",
      price: inventoryItem.price,
      quantity: 1,
      total: inventoryItem.price,
      // Add any other required fields with defaults
    };
    
    callback(invoiceItem);
  };
};

// Export this adapter for use in InvoiceCreate.tsx
// The actual fix would involve using this adapter in the component where the error occurs
