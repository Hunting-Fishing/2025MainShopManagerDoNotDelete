
import { InventoryItemExtended } from '@/types/inventory';

// Utility function to format inventory data
export const formatInventoryData = (data: any): InventoryItemExtended => {
  return {
    id: data.id || '',
    name: data.name || '',
    sku: data.sku || '',
    quantity: Number(data.quantity) || 0,
    unit_price: parseFloat(data.unit_price) || 0,
    category: data.category || '',
    supplier: data.supplier || '',
    location: data.location || '',
    status: data.status || 'In Stock',
    description: data.description || '',
    reorder_point: Number(data.reorder_point) || 0,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
    shop_id: data.shop_id || undefined,
    
    // Additional fields
    partNumber: data.partNumber || '',
    barcode: data.barcode || '',
    manufacturer: data.manufacturer || '',
    cost: parseFloat(data.cost) || 0,
    marginMarkup: parseFloat(data.marginMarkup) || 0,
    retailPrice: parseFloat(data.retailPrice) || 0,
    wholesalePrice: parseFloat(data.wholesalePrice) || 0,
    onHold: Number(data.onHold) || 0,
    onOrder: Number(data.onOrder) || 0,
    minimumOrder: Number(data.minimumOrder) || 1,
    maximumOrder: Number(data.maximumOrder) || 100,
    subcategory: data.subcategory || '',
    itemCondition: data.itemCondition || 'New',
  };
};

// Validates required fields for inventory items
export const validateInventoryItem = (item: Partial<InventoryItemExtended>): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  if (!item.name || item.name.trim() === '') 
    errors.name = 'Name is required';
  
  if (!item.sku || item.sku.trim() === '') 
    errors.sku = 'SKU is required';
  
  if (item.reorder_point === undefined || isNaN(Number(item.reorder_point))) 
    errors.reorder_point = 'Valid reorder point is required';
    
  if (item.unit_price === undefined || isNaN(Number(item.unit_price))) 
    errors.unit_price = 'Valid unit price is required';
    
  // Additional field validations
  if (item.coreCharge !== undefined && isNaN(Number(item.coreCharge))) 
    errors.coreCharge = 'Core charge must be a valid number';
    
  if (item.environmentalFee !== undefined && isNaN(Number(item.environmentalFee))) 
    errors.environmentalFee = 'Environmental fee must be a valid number';
    
  if (item.freightFee !== undefined && isNaN(Number(item.freightFee))) 
    errors.freightFee = 'Freight fee must be a valid number';
    
  if (item.otherFee !== undefined && isNaN(Number(item.otherFee))) 
    errors.otherFee = 'Other fee must be a valid number';
    
  if (item.otherFee && (!item.otherFeeDescription || item.otherFeeDescription.trim() === ''))
    errors.otherFeeDescription = 'Description is required when other fee is specified';

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// More utility functions...
