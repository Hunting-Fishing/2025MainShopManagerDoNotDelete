
import { useState, useEffect, useCallback } from 'react';
import { CarMake, CarModel, VinDecodeResult } from '@/types/vehicle';
import { decodeVin as decodeVinUtil } from '@/utils/vehicleUtils';
import { supabase } from '@/lib/supabase';

/**
 * Hook to provide vehicle data functionality including makes, models, years,
 * and VIN decoding capabilities
 */
export const useVehicleData = () => {
  const [makes, setMakes] = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Load years (from current year back to 1950)
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearsList = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);
    setYears(yearsList);
  }, []);

  // Function to fetch models for a selected make
  const fetchModels = useCallback(async (make: string) => {
    if (!make) return;
    
    setLoading(true);
    setError(null);
    setSelectedMake(make);
    setSelectedModel('');
    
    try {
      const { data, error } = await supabase
        .from('vehicle_models')
        .select('*')
        .eq('make_id', make)
        .order('model_display');
      
      if (error) {
        throw error;
      }
      
      // Map the data to match our CarModel type
      const formattedModels: CarModel[] = data.map((model: any) => ({
        model_name: model.model_display,
        model_make_id: model.make_id
      }));
      
      setModels(formattedModels);
      return Promise.resolve();
    } catch (err) {
      console.error("Error fetching vehicle models:", err);
      setError("Could not load vehicle models");
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to decode VIN and return vehicle information
  const decodeVin = useCallback(async (vin: string): Promise<VinDecodeResult | null> => {
    setLoading(true);
    try {
      const result = await decodeVinUtil(vin);
      
      // If we got a make, ensure it's mapped to an ID we have in our system
      if (result?.make) {
        const matchingMake = makes.find(m => 
          m.make_id.toLowerCase() === result.make.toLowerCase() || 
          m.make_display.toLowerCase() === result.make.toLowerCase()
        );
        
        if (matchingMake) {
          result.make = matchingMake.make_id;
        }
      }
      
      return result;
    } catch (error) {
      console.error("Error in decodeVin:", error);
      setError("Failed to decode VIN");
      return null;
    } finally {
      setLoading(false);
    }
  }, [makes]);

  return {
    makes,
    models,
    years,
    loading,
    error,
    selectedMake,
    selectedModel,
    selectedYear,
    setSelectedModel,
    setSelectedYear,
    fetchModels,
    decodeVin
  };
};
