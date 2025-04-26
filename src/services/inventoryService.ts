
// This file now re-exports from the modular inventory services
// This maintains backward compatibility while using the new refactored structure

export {
  getAllInventoryItems,
  getInventoryItemById, // Added this export to fix the error
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getAutoReorderSettings,
  enableAutoReorder,
  disableAutoReorder,
  getLowStockItems,
  getOutOfStockItems,
  getInventoryStatus,
  clearAllInventoryItems,
  reorderItem  // Added this to fix the LowStockAlerts error
} from './inventory/index';
