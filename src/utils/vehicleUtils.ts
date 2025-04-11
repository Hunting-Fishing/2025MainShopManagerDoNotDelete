
import { supabase } from '@/lib/supabase';
import { VinDecodeResult, Vehicle } from '@/types/vehicle';

/**
 * Decode a VIN and return vehicle information from a VIN decoding service
 */
export async function decodeVin(vin: string): Promise<VinDecodeResult | null> {
  try {
    // For development purposes, we'll use mock data
    // In production, this would call a real VIN decoding API
    
    // Simulate API call with a timeout
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data
    return {
      year: 2019,
      make: "Toyota",
      model: "Camry",
      transmission: "Automatic",
      drive_type: "FWD",
      fuel_type: "Gasoline",
      body_style: "sedan",
      engine: "2.5L I4",
      country: "Japan"
    };
  } catch (error) {
    console.error("Error decoding VIN:", error);
    return null;
  }
}

/**
 * Get all vehicles for a specific customer
 */
export async function getCustomerVehicles(customerId: string): Promise<Vehicle[]> {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('customer_id', customerId);
      
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching customer vehicles:", error);
    return [];
  }
}
