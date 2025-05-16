
// Re-export existing types but avoid duplicates
import { InventoryItem, InventoryItemExtended, AutoReorderSettings, ReorderSettings } from '../inventory';

// Create a namespace for the original types to avoid conflicts
export namespace OriginalInventory {
  // Using type imports within namespace
  export type InventoryItem = import('../inventory').InventoryItem;
  export type InventoryItemExtended = import('../inventory').InventoryItemExtended;
  export type AutoReorderSettings = import('../inventory').AutoReorderSettings;
  export type ReorderSettings = import('../inventory').ReorderSettings;
  export type LegacyInventoryTransaction = import('../inventory').InventoryTransaction;
  export type LegacyInventoryLocation = import('../inventory').InventoryLocation;
  export type InventoryCategory = import('../inventory').InventoryCategory;
  export type InventorySupplier = import('../inventory').InventorySupplier;
  export type InventoryAdjustment = import('../inventory').InventoryAdjustment;
  export type InventoryValuation = import('../inventory').InventoryValuation;
  export type InventoryItemStatus = import('../inventory').InventoryItemStatus;
}

// Export new specialized types
export * from './transactions';
export * from './vendors';
export * from './purchaseOrders';
export * from './locations';

// Re-export commonly used types that don't conflict using export type
export type { 
  InventoryItem, 
  InventoryItemExtended,
  AutoReorderSettings,
  ReorderSettings
} from '../inventory';
