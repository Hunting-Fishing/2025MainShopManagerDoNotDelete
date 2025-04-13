
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
        const { data, error } = await supabase
          .from('vehicle_makes')
          .select('*')
          .order('make_display');
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          // Map the data to match our CarMake type
          const formattedMakes: CarMake[] = data.map((make: any) => ({
            make_id: make.make_id,
            make_display: make.make_display,
            make_is_common: '1', // All makes in our DB are considered common
            make_country: make.country || '' // Use country if available
          }));
          
          setMakes(formattedMakes);
        } else {
          // Fallback to hardcoded common makes if no data
          setMakes([
            { make_id: 'honda', make_display: 'Honda', make_is_common: '1', make_country: 'Japan' },
            { make_id: 'toyota', make_display: 'Toyota', make_is_common: '1', make_country: 'Japan' },
            { make_id: 'ford', make_display: 'Ford', make_is_common: '1', make_country: 'USA' },
            { make_id: 'chevrolet', make_display: 'Chevrolet', make_is_common: '1', make_country: 'USA' },
            { make_id: 'bmw', make_display: 'BMW', make_is_common: '1', make_country: 'Germany' },
            { make_id: 'audi', make_display: 'Audi', make_is_common: '1', make_country: 'Germany' },
            { make_id: 'mercedes', make_display: 'Mercedes-Benz', make_is_common: '1', make_country: 'Germany' },
            { make_id: 'tesla', make_display: 'Tesla', make_is_common: '1', make_country: 'USA' },
          ]);
        }
      } catch (err) {
        console.error("Error loading vehicle makes:", err);
        setError("Could not load vehicle makes");
      } finally {
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
    
    try {
      const { data, error } = await supabase
        .from('vehicle_models')
        .select('*')
        .eq('make_id', make)
        .order('model_display');
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Map the data to match our CarModel type
        const formattedModels: CarModel[] = data.map((model: any) => ({
          model_name: model.model_display,
          model_make_id: model.make_id
        }));
        
        setModels(formattedModels);
      } else {
        // Fallback for common models based on make
        const fallbackModels: Record<string, string[]> = {
          'honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey'],
          'toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma'],
          'ford': ['F-150', 'Escape', 'Explorer', 'Mustang', 'Edge'],
          'chevrolet': ['Silverado', 'Malibu', 'Equinox', 'Tahoe', 'Camaro'],
          'bmw': ['3 Series', '5 Series', 'X3', 'X5', '7 Series'],
          'audi': ['A4', 'A6', 'Q5', 'Q7', 'e-tron'],
          'mercedes': ['C-Class', 'E-Class', 'GLE', 'S-Class', 'GLC'],
          'tesla': ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck'],
        };
        
        const makeId = make.toLowerCase();
        const fallbackList = fallbackModels[makeId] || [];
        
        const formattedModels: CarModel[] = fallbackList.map(model => ({
          model_name: model,
          model_make_id: makeId
        }));
        
        setModels(formattedModels);
      }
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
    fetchModels,
    decodeVin
  };
};
