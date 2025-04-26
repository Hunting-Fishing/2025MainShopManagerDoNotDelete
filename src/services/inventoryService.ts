
// This file now re-exports from the modular inventory services
// This maintains backward compatibility while using the new refactored structure

export {
  getAllInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getAutoReorderSettings,
  enableAutoReorder,
  disableAutoReorder,
  getLowStockItems,
  getOutOfStockItems,
  getInventoryStatus,
  clearAllInventoryItems
} from './inventory/index';

