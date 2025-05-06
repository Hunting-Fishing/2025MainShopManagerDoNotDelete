
// Re-export existing types but avoid duplicates
import { InventoryItem, InventoryItemExtended, AutoReorderSettings, ReorderSettings } from '../inventory';

// Create a namespace for the original types to avoid conflicts
export namespace OriginalInventory {
  export type { 
    InventoryItem,
    InventoryItemExtended, 
    AutoReorderSettings,
    ReorderSettings,
    InventoryTransaction as LegacyInventoryTransaction,
    InventoryLocation as LegacyInventoryLocation,
    InventoryCategory,
    InventorySupplier,
    InventoryAdjustment,
    InventoryValuation,
    InventoryItemStatus,
  } from '../inventory';
}

// Export new specialized types
export * from './transactions';
export * from './vendors';
export * from './purchaseOrders';
export * from './locations';

// Re-export commonly used types that don't conflict
export { 
  InventoryItem, 
  InventoryItemExtended,
  AutoReorderSettings,
  ReorderSettings
} from '../inventory';
