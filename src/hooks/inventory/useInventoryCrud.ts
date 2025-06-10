
import { useState } from 'react';
import { InventoryItemExtended } from '@/types/inventory';
import { supabase } from '@/lib/supabase';

export function useInventoryCrud() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [items, setItems] = useState<InventoryItemExtended[]>([]);

  const fetchItems = async (): Promise<InventoryItemExtended[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*');
        
      if (error) throw error;
      
      // Map database fields to InventoryItemExtended, ensuring price field exists
      const formattedItems: InventoryItemExtended[] = (data || []).map(item => ({
        ...item,
        price: item.unit_price, // Map unit_price to price for UI compatibility
        category: item.category || '',
        supplier: item.supplier || '',
        status: item.status || 'active'
      }));
      
      setItems(formattedItems);
      return formattedItems;
    } catch (error: any) {
      setError(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (item: Omit<InventoryItemExtended, 'id'>): Promise<InventoryItemExtended> => {
    setIsLoading(true);
    try {
      // Prepare item for database insert, ensuring required fields
      const dbItem = {
        name: item.name || '',
        sku: item.sku || '',
        category: item.category || '',
        supplier: item.supplier || '',
        unit_price: item.unit_price || item.price || 0,
        quantity: item.quantity || 0,
        reorder_point: item.reorder_point || 0,
        status: item.status || 'active',
        description: item.description,
        location: item.location,
        
        // Extended fields
        partNumber: item.partNumber,
        barcode: item.barcode,
        subcategory: item.subcategory,
        manufacturer: item.manufacturer,
        vehicleCompatibility: item.vehicleCompatibility,
        onHold: item.onHold,
        onOrder: item.onOrder,
        cost: item.cost,
        marginMarkup: item.marginMarkup,
        warrantyPeriod: item.warrantyPeriod,
        dateBought: item.dateBought,
        dateLast: item.dateLast,
        notes: item.notes,
        
        // New measurement fields
        unitOfMeasurement: item.unitOfMeasurement,
        measurementType: item.measurementType,
        minQuantity: item.minQuantity,
        maxQuantity: item.maxQuantity,
        optimalQuantity: item.optimalQuantity,
        
        // New tax fields
        pstRate: item.pstRate,
        gstRate: item.gstRate,
        hstRate: item.hstRate,
        pstApplicable: item.pstApplicable,
        gstApplicable: item.gstApplicable,
        hstApplicable: item.hstApplicable,
        
        // New fee fields
        coreCharge: item.coreCharge,
        coreChargeApplicable: item.coreChargeApplicable,
        hazardousFee: item.hazardousFee,
        hazardousFeeApplicable: item.hazardousFeeApplicable,
        shippingFee: item.shippingFee,
        otherFees: item.otherFees,
        feeDescription: item.feeDescription,
        
        // Additional product details
        weight: item.weight,
        weightUnit: item.weightUnit,
        dimensions: item.dimensions,
        serialNumberRequired: item.serialNumberRequired,
        lotNumberRequired: item.lotNumberRequired,
        expirationDate: item.expirationDate,
        batchNumber: item.batchNumber,
        countryOfOrigin: item.countryOfOrigin,
        hsCode: item.hsCode,
        
        // Pricing and cost details
        lastCost: item.lastCost,
        averageCost: item.averageCost,
        listPrice: item.listPrice,
        msrp: item.msrp,
        discountPercent: item.discountPercent,
        
        // Additional inventory management
        binLocation: item.binLocation,
        shelfLife: item.shelfLife,
        shelfLifeUnit: item.shelfLifeUnit,
        temperatureRequirement: item.temperatureRequirement,
        handlingInstructions: item.handlingInstructions
      };
      
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([dbItem])
        .select()
        .single();
        
      if (error) throw error;
      
      // Map response back to InventoryItemExtended
      const newItem: InventoryItemExtended = {
        ...data,
        price: data.unit_price // Ensure price field exists
      };
      
      setItems(prevItems => [...prevItems, newItem]);
      return newItem;
    } catch (error: any) {
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (id: string, updates: Partial<InventoryItemExtended>): Promise<InventoryItemExtended> => {
    setIsLoading(true);
    try {
      // Prepare updates for database
      const dbUpdates: any = { ...updates };
      if (dbUpdates.price !== undefined) {
        dbUpdates.unit_price = dbUpdates.price;
        delete dbUpdates.price; // Remove price since it's not a database field
      }
      
      const { data, error } = await supabase
        .from('inventory_items')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Map response back to InventoryItemExtended
      const updatedItem: InventoryItemExtended = {
        ...data,
        price: data.unit_price // Ensure price field exists
      };
      
      setItems(prevItems => 
        prevItems.map(item => item.id === id ? updatedItem : item)
      );
      return updatedItem;
    } catch (error: any) {
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (id: string, newQuantity: number): Promise<InventoryItemExtended> => {
    return updateItem(id, { quantity: newQuantity });
  };

  const removeItem = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      return true;
    } catch (error: any) {
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    items, 
    isLoading, 
    error, 
    fetchItems, 
    addItem, 
    updateItem, 
    updateQuantity, 
    removeItem 
  };
}
