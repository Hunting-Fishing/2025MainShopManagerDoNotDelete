
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

  // Load years (from current year back to 1950)
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearsList = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);
    setYears(yearsList);
  }, []);

  // Load makes on initial mount
  useEffect(() => {
    const loadMakes = async () => {
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
        setMakes(data || []);
      } catch (err) {
        console.error("Error loading vehicle makes:", err);
        setError("Failed to load vehicle makes");
      } finally {
        setLoading(false);
      }
    };
    
    loadMakes();
  }, []);

  // Function to fetch models for a selected make with improved error handling and case insensitivity
  const fetchModels = useCallback(async (make: string): Promise<CarModel[]> => {
    if (!make) {
      console.log("No make provided to fetchModels, returning empty array");
      return Promise.resolve([]);
    }
    
    // Check if we have cached models for this make
    if (modelCache[make.toLowerCase()]) {
      console.log(`Using cached models for make: ${make}`);
      return modelCache[make.toLowerCase()];
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
            [make.toLowerCase()]: fallbackModels
          }));
          
          setModels(fallbackModels);
          return fallbackModels;
        }
        
        // If still no models, try finding a corresponding make
        const makeRecord = makes.find(m => 
          m.make_id.toLowerCase() === make.toLowerCase() || 
          m.make_display.toLowerCase() === make.toLowerCase()
        );
        
        if (makeRecord) {
          console.log(`Trying with make_id from matching record: ${makeRecord.make_id}`);
          const { data: makeDisplayData, error: makeDisplayError } = await supabase
            .from('vehicle_models')
            .select('*')
            .eq('make_id', makeRecord.make_id)
            .order('model_display');
            
          if (!makeDisplayError && makeDisplayData?.length > 0) {
            console.log(`Found ${makeDisplayData.length} models using make display match`);
            const displayModels = makeDisplayData.map((model: any) => ({
              model_name: model.model_display || model.model_id,
              model_make_id: model.make_id
            }));
            
            // Cache the results
            setModelCache(prev => ({
              ...prev,
              [make.toLowerCase()]: displayModels,
              [makeRecord.make_id.toLowerCase()]: displayModels
            }));
            
            setModels(displayModels);
            return displayModels;
          }
        }
      }
      
      // Cache the results
      setModelCache(prev => ({
        ...prev,
        [make.toLowerCase()]: formattedModels
      }));
      
      setModels(formattedModels);
      return formattedModels;
    } catch (err) {
      console.error("Error fetching vehicle models:", err);
      setError("Could not load vehicle models");
      return [];
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
