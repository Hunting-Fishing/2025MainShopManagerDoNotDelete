
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

  // Load makes from database on mount
  useEffect(() => {
    const fetchMakes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Type assertion to handle the TypeScript error
        const { data, error } = await (supabase as any)
          .from('vehicle_makes')
          .select('id, make_id, make_display')
          .order('make_display');
        
        if (error) {
          throw error;
        }
        
        // Map the data to match our CarMake type
        const formattedMakes: CarMake[] = data.map((make: any) => ({
          make_id: make.make_id,
          make_display: make.make_display,
          make_is_common: '1', // All makes in our DB are considered common
          make_country: '' // We don't store country in our DB
        }));
        
        setMakes(formattedMakes);
        setLoading(false);
      } catch (err) {
        console.error("Error loading vehicle makes:", err);
        setError("Could not load vehicle makes");
        setLoading(false);
      }
    };
    
    fetchMakes();
  }, []);

  // Function to fetch models for a selected make
  const fetchModels = useCallback(async (make: string) => {
    if (!make) return;
    
    setLoading(true);
    setError(null);
    setSelectedMake(make);
    setSelectedModel('');
    
    try {
      // Type assertion to handle the TypeScript error
      const { data, error } = await (supabase as any)
        .from('vehicle_models')
        .select('id, model_id, model_display, make_id')
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
      setLoading(false);
      return Promise.resolve();
    } catch (err) {
      console.error("Error fetching vehicle models:", err);
      setError("Could not load vehicle models");
      setLoading(false);
      return Promise.reject(err);
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
      
      setLoading(false);
      return result;
    } catch (error) {
      console.error("Error in decodeVin:", error);
      setError("Failed to decode VIN");
      setLoading(false);
      return null;
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
