
import { supabase } from '@/lib/supabase';
import { InventoryItemExtended } from '@/types/inventory';
import { formatInventoryItem } from './utils';

export type FilterOptions = {
  category?: string;
  supplier?: string;
  location?: string;
  status?: string;
  search?: string;
  minQuantity?: number;
  maxQuantity?: number;
  lowStock?: boolean;
  orderBy?: string;
  direction?: 'asc' | 'desc';
};

export const filterInventoryItems = async (options: FilterOptions = {}): Promise<InventoryItemExtended[]> => {
  let query = supabase.from('inventory_items').select('*');

  // Apply filters
  if (options.category) {
    query = query.eq('category', options.category);
  }
  
  if (options.supplier) {
    query = query.eq('supplier', options.supplier);
  }
  
  if (options.location) {
    query = query.eq('location', options.location);
  }
  
  if (options.status) {
    query = query.eq('status', options.status);
  }
  
  if (options.search) {
    query = query.or(`name.ilike.%${options.search}%,sku.ilike.%${options.search}%,description.ilike.%${options.search}%`);
  }
  
  if (options.minQuantity !== undefined) {
    query = query.gte('quantity', options.minQuantity);
  }
  
  if (options.maxQuantity !== undefined) {
    query = query.lte('quantity', options.maxQuantity);
  }
  
  if (options.lowStock) {
    query = query.lte('quantity', supabase.rpc('get_reorder_point'));
  }
  
  // Apply sorting
  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.direction === 'asc' });
  } else {
    query = query.order('name', { ascending: true });
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error filtering inventory items:', error);
    throw error;
  }
  
  return data.map(formatInventoryItem);
};

export const getInventoryCategories = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('category')
    .not('category', 'is', null);
    
  if (error) {
    console.error('Error fetching inventory categories:', error);
    throw error;
  }
  
  // Extract unique categories
  const categories = [...new Set(data.map(item => item.category).filter(Boolean))];
  
  return categories;
};

export const getInventorySuppliers = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('supplier')
    .not('supplier', 'is', null);
    
  if (error) {
    console.error('Error fetching inventory suppliers:', error);
    throw error;
  }
  
  // Extract unique suppliers
  const suppliers = [...new Set(data.map(item => item.supplier).filter(Boolean))];
  
  return suppliers;
};

export const getInventoryLocations = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('location')
    .not('location', 'is', null);
    
  if (error) {
    console.error('Error fetching inventory locations:', error);
    throw error;
  }
  
  // Extract unique locations
  const locations = [...new Set(data.map(item => item.location).filter(Boolean))];
  
  return locations;
};

export const getInventoryStatuses = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('status')
    .not('status', 'is', null);
    
  if (error) {
    console.error('Error fetching inventory statuses:', error);
    throw error;
  }
  
  // Extract unique statuses
  const statuses = [...new Set(data.map(item => item.status).filter(Boolean))];
  
  return statuses;
};
