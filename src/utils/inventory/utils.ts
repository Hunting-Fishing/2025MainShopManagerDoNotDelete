
import { 
  InventoryItem, 
  InventoryItemExtended, 
  InventoryCategory,
  InventorySupplier,
  InventoryLocation,
  InventoryStatus
} from "@/types/inventory";

// Format currency for display
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Determine stock status based on quantity and reorder point
export const getStockStatus = (
  quantity: number | undefined,
  reorderPoint: number | undefined
): 'in-stock' | 'low-stock' | 'out-of-stock' => {
  if (quantity === undefined) return 'out-of-stock';
  if (quantity <= 0) return 'out-of-stock';
  if (reorderPoint !== undefined && quantity <= reorderPoint) return 'low-stock';
  return 'in-stock';
};

// Get color class based on stock status
export const getStockStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'in-stock':
    case 'in stock':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'low-stock':
    case 'low stock':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'out-of-stock':
    case 'out of stock':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

// Map database inventory items to frontend format
export const mapDbItemToExtended = (dbItem: any): InventoryItemExtended => {
  return {
    id: dbItem.id,
    name: dbItem.name,
    sku: dbItem.sku,
    category: dbItem.category || '',
    description: dbItem.description || '',
    quantity: dbItem.quantity || 0,
    reorder_point: dbItem.reorder_point || 0,
    unit_price: dbItem.unit_price || 0,
    price: dbItem.unit_price || 0, // Adding price field to match InventoryItemExtended
    supplier: dbItem.supplier || '',
    location: dbItem.location || '',
    status: dbItem.status || 'In Stock',
    created_at: dbItem.created_at,
    updated_at: dbItem.updated_at,
  };
};

// Sort inventory items by the specified field
export const sortInventoryItems = (
  items: InventoryItemExtended[],
  sortField: string,
  sortDirection: 'asc' | 'desc'
): InventoryItemExtended[] => {
  return [...items].sort((a, b) => {
    let valueA = a[sortField as keyof InventoryItemExtended];
    let valueB = b[sortField as keyof InventoryItemExtended];
    
    // Handle string comparison
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
      return sortDirection === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    
    // Handle number comparison
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return sortDirection === 'asc'
        ? valueA - valueB
        : valueB - valueA;
    }
    
    // Default comparison if types don't match
    return 0;
  });
};

// Calculate total inventory value
export const calculateTotalInventoryValue = (items: InventoryItemExtended[]): number => {
  return items.reduce((total, item) => {
    const itemValue = (item.quantity || 0) * (item.unit_price || 0);
    return total + itemValue;
  }, 0);
};

// Extract unique categories from inventory items
export const extractCategories = (items: InventoryItemExtended[]): InventoryCategory[] => {
  const categories = new Map<string, number>();
  
  items.forEach(item => {
    if (item.category) {
      const category = item.category;
      categories.set(category, (categories.get(category) || 0) + 1);
    }
  });
  
  return Array.from(categories).map(([name, count]) => ({
    id: name,
    name,
    count
  }));
};

// Extract unique suppliers from inventory items
export const extractSuppliers = (items: InventoryItemExtended[]): InventorySupplier[] => {
  const suppliers = new Map<string, number>();
  
  items.forEach(item => {
    if (item.supplier) {
      const supplier = item.supplier;
      suppliers.set(supplier, (suppliers.get(supplier) || 0) + 1);
    }
  });
  
  return Array.from(suppliers).map(([name, count]) => ({
    id: name,
    name,
    count
  }));
};

// Extract unique locations from inventory items
export const extractLocations = (items: InventoryItemExtended[]): InventoryLocation[] => {
  const locations = new Map<string, number>();
  
  items.forEach(item => {
    if (item.location) {
      const location = item.location;
      locations.set(location, (locations.get(location) || 0) + 1);
    }
  });
  
  return Array.from(locations).map(([name, count]) => ({
    id: name,
    name,
    count: count,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
};

// Extract unique statuses from inventory items
export const extractStatuses = (items: InventoryItemExtended[]): InventoryStatus[] => {
  const statuses = new Map<string, number>();
  
  items.forEach(item => {
    if (item.status) {
      const status = item.status;
      statuses.set(status, (statuses.get(status) || 0) + 1);
    }
  });
  
  return Array.from(statuses).map(([value, count]) => ({
    value,
    label: value,
    count
  }));
};
