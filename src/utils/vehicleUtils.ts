
import { VinDecodeResult } from '@/types/vehicle';
import { decodeVin as apiDecodeVin } from '@/services/vinDecoderService';
import { supabase } from '@/lib/supabase';

/**
 * Main VIN decoding function that uses real API services
 * No mock data fallbacks
 */
export const decodeVin = async (vin: string): Promise<VinDecodeResult | null> => {
  if (!vin || vin.length !== 17) {
    throw new Error('Invalid VIN format. VIN must be 17 characters long.');
  }

  try {
    return await apiDecodeVin(vin);
  } catch (error) {
    console.error('VIN decoding failed:', error);
    throw error;
  }
};

/**
 * Get vehicle by ID from database
 */
export const getVehicleById = async (vehicleId: string) => {
  try {
    const { data, error } = await supabase
      .from('customer_vehicles')
      .select('*')
      .eq('id', vehicleId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    throw error;
  }
};

/**
 * Validate VIN format
 */
export const isValidVin = (vin: string): boolean => {
  if (!vin) return false;
  
  // Basic VIN validation
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
  return vinRegex.test(vin);
};

/**
 * Format VIN for display
 */
export const formatVin = (vin: string): string => {
  if (!vin) return '';
  return vin.toUpperCase();
};
