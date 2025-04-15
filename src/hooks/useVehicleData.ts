
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
  const [modelCache, setModelCache] = useState<Record<string, CarModel[]>>({});
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Load years (from current year back to 1950)
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearsList = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);
    setYears(yearsList);
  }, []);

  // Load makes on initial mount
  useEffect(() => {
    const loadMakes = async () => {
      // Skip if already initialized
      if (isInitialized && makes.length > 0) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('vehicle_makes')
          .select('*')
          .order('make_display');
          
        if (error) {
          throw error;
        }
        
        // Log the makes data for debugging
        console.log(`Loaded ${data?.length || 0} vehicle makes from database`);
        
        // If no data from DB, use hardcoded makes to ensure functionality
        if (!data || data.length === 0) {
          console.log("No makes found in database, using fallback data");
          const fallbackMakes: CarMake[] = [
            { make_id: 'ford', make_display: 'Ford' },
            { make_id: 'chevrolet', make_display: 'Chevrolet' },
            { make_id: 'toyota', make_display: 'Toyota' },
            { make_id: 'honda', make_display: 'Honda' },
            { make_id: 'nissan', make_display: 'Nissan' },
            { make_id: 'bmw', make_display: 'BMW' },
            { make_id: 'mercedes-benz', make_display: 'Mercedes-Benz' },
            { make_id: 'audi', make_display: 'Audi' },
            { make_id: 'subaru', make_display: 'Subaru' },
            { make_id: 'volkswagen', make_display: 'Volkswagen' }
          ];
          
          setMakes(fallbackMakes);
        } else {
          setMakes(data);
        }
        
        setIsInitialized(true);
      } catch (err) {
        console.error("Error loading vehicle makes:", err);
        setError("Failed to load vehicle makes");
        
        // Use fallback data in case of error
        const fallbackMakes: CarMake[] = [
          { make_id: 'ford', make_display: 'Ford' },
          { make_id: 'chevrolet', make_display: 'Chevrolet' },
          { make_id: 'toyota', make_display: 'Toyota' },
          { make_id: 'honda', make_display: 'Honda' },
          { make_id: 'nissan', make_display: 'Nissan' }
        ];
        
        setMakes(fallbackMakes);
        setIsInitialized(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadMakes();
  }, [isInitialized, makes.length]);

  // Function to fetch models for a selected make with improved error handling and case insensitivity
  const fetchModels = useCallback(async (make: string): Promise<CarModel[]> => {
    if (!make) {
      console.log("No make provided to fetchModels, returning empty array");
      return Promise.resolve([]);
    }
    
    const makeLower = make.toLowerCase();
    
    // Check if we have cached models for this make
    if (modelCache[makeLower]) {
      console.log(`Using cached models for make: ${make}`);
      return modelCache[makeLower];
    }
    
    setLoading(true);
    setError(null);
    setSelectedMake(make);
    setSelectedModel('');
    
    try {
      console.log("Fetching models from database for make:", make);
      
      // Try exact match first
      const { data, error } = await supabase
        .from('vehicle_models')
        .select('*')
        .eq('make_id', make)
        .order('model_display');
      
      if (error) {
        throw error;
      }
      
      // Map the data to match our CarModel type
      const formattedModels: CarModel[] = (data || []).map((model: any) => ({
        model_name: model.model_display || model.model_id,
        model_make_id: model.make_id
      }));
      
      console.log(`Fetched ${formattedModels.length} models for make: ${make}`);
      
      // If no models found with exact match, try case-insensitive match
      if (formattedModels.length === 0) {
        console.log("No models found with exact match, trying case-insensitive search");
        
        // Case insensitive search as fallback
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('vehicle_models')
          .select('*')
          .ilike('make_id', make)
          .order('model_display');
          
        if (!fallbackError && fallbackData?.length > 0) {
          console.log(`Found ${fallbackData.length} models using fallback search`);
          const fallbackModels = fallbackData.map((model: any) => ({
            model_name: model.model_display || model.model_id,
            model_make_id: model.make_id
          }));
          
          // Cache the results
          setModelCache(prev => ({
            ...prev,
            [makeLower]: fallbackModels
          }));
          
          setModels(fallbackModels);
          return fallbackModels;
        }
        
        // If still no models, create some fallback models based on make
        console.log("No models found in database, using fallback data for make:", make);
        let fallbackModels: CarModel[] = [];
        
        // Generic fallback models based on make
        if (make.toLowerCase().includes('ford')) {
          fallbackModels = [
            { model_name: 'F-150', model_make_id: make },
            { model_name: 'Explorer', model_make_id: make },
            { model_name: 'Escape', model_make_id: make },
            { model_name: 'Mustang', model_make_id: make }
          ];
        } else if (make.toLowerCase().includes('chev') || make.toLowerCase().includes('chevy')) {
          fallbackModels = [
            { model_name: 'Silverado', model_make_id: make },
            { model_name: 'Malibu', model_make_id: make },
            { model_name: 'Equinox', model_make_id: make },
            { model_name: 'Tahoe', model_make_id: make }
          ];
        } else if (make.toLowerCase().includes('toyota')) {
          fallbackModels = [
            { model_name: 'Camry', model_make_id: make },
            { model_name: 'Corolla', model_make_id: make },
            { model_name: 'RAV4', model_make_id: make },
            { model_name: 'Tacoma', model_make_id: make }
          ];
        } else {
          // Generic fallback models for any make
          fallbackModels = [
            { model_name: 'Sedan', model_make_id: make },
            { model_name: 'SUV', model_make_id: make },
            { model_name: 'Truck', model_make_id: make },
            { model_name: 'Coupe', model_make_id: make }
          ];
        }
        
        // Cache and return fallback models
        setModelCache(prev => ({
          ...prev,
          [makeLower]: fallbackModels
        }));
        
        setModels(fallbackModels);
        return fallbackModels;
      }
      
      // Cache the results
      setModelCache(prev => ({
        ...prev,
        [makeLower]: formattedModels
      }));
      
      setModels(formattedModels);
      return formattedModels;
    } catch (err) {
      console.error("Error fetching vehicle models:", err);
      setError("Could not load vehicle models");
      
      // Create fallback models in case of error
      const fallbackModels: CarModel[] = [
        { model_name: 'Sedan', model_make_id: make },
        { model_name: 'SUV', model_make_id: make },
        { model_name: 'Coupe', model_make_id: make },
        { model_name: 'Truck', model_make_id: make }
      ];
      
      // Cache the fallback models
      setModelCache(prev => ({
        ...prev,
        [makeLower]: fallbackModels
      }));
      
      setModels(fallbackModels);
      return fallbackModels;
    } finally {
      setLoading(false);
    }
  }, [makes, modelCache]);

  // Function to decode VIN and return vehicle information with improved make matching
  const decodeVin = useCallback(async (vin: string): Promise<VinDecodeResult | null> => {
    setLoading(true);
    try {
      const result = await decodeVinUtil(vin);
      
      // If we got a make, ensure it's mapped to an ID we have in our system
      if (result?.make) {
        const normalizedMake = result.make.toLowerCase();
        
        // First try exact match
        const matchingMake = makes.find(m => 
          m.make_id.toLowerCase() === normalizedMake || 
          m.make_display.toLowerCase() === normalizedMake
        );
        
        if (matchingMake) {
          console.log("Mapped make to:", matchingMake.make_id);
          result.make = matchingMake.make_id;
        } else {
          console.log("Could not find matching make ID for:", result.make);
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
    setSelectedMake,
    setSelectedModel,
    setSelectedYear,
    fetchModels,
    decodeVin
  };
};
