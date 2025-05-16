
import { 
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  updateInventoryQuantity,
  deleteInventoryItem
} from './inventory/crudService';

import { 
  filterInventoryItems,
  getInventoryCategories,
  getInventorySuppliers,
  getInventoryLocations,
  getInventoryStatuses
} from './inventory/filterService';

import {
  recordInventoryTransaction,
  getItemTransactions
} from './inventory/transactionService';

import {
  getInventoryStatus,
  formatInventoryItem,
  formatInventoryForApi,
  mapApiToInventoryItem
} from './inventory/utils';

// Create a clearAllInventoryItems function
const clearAllInventoryItems = async (): Promise<boolean> => {
  try {
    // This is a dangerous operation and should be protected
    // Ideally with admin permissions and confirmation
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .not('id', 'is', null);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error clearing all inventory items:', error);
    return false;
  }
};

// Aliases for backward compatibility
const getAllInventoryItems = getInventoryItems;

// Export everything
export {
  // CRUD operations
  getInventoryItems,
  getAllInventoryItems, // Alias
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  updateInventoryQuantity,
  deleteInventoryItem,
  clearAllInventoryItems,
  
  // Filter operations
  filterInventoryItems,
  getInventoryCategories,
  getInventorySuppliers,
  getInventoryLocations, 
  getInventoryStatuses,
  
  // Transaction operations
  recordInventoryTransaction,
  getItemTransactions,
  
  // Utils
  getInventoryStatus,
  formatInventoryItem,
  formatInventoryForApi,
  mapApiToInventoryItem
};
