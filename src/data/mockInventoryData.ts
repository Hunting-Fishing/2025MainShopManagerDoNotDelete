
// This file is being maintained for backward compatibility
// but all actual data is now being retrieved from the Supabase database

// Re-export types from the types file
export { type InventoryItemExtended } from "@/types/inventory";

// Empty data array for fallback
export const inventoryItems: any[] = [];

// Export the same empty data with a different name for backward compatibility
export const mockInventoryItems = inventoryItems;
