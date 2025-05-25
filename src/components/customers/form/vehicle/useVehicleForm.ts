
import { useState, useEffect, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CarMake, CarModel, VinDecodeResult } from '@/types/vehicle';
import { supabase } from '@/lib/supabase';
import { useVinDecoder } from './hooks/useVinDecoder';

interface UseVehicleFormProps {
  form: UseFormReturn<any>;
  index: number;
}

export const useVehicleForm = ({ form, index }: UseVehicleFormProps) => {
  const [makes, setMakes] = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [decodedVehicleInfo, setDecodedVehicleInfo] = useState<VinDecodeResult | null>(null);
  
  // Use the VIN decoder hook
  const vinDecoder = useVinDecoder();

  // Load makes on mount
  useEffect(() => {
    console.log('Loading vehicle makes...');
    loadMakes();
  }, []);

  const loadMakes = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicle_makes')
        .select('*')
        .order('make_display');
      
      if (error) {
        console.error('Error loading makes:', error);
        return;
      }
      
      console.log('Loaded makes from database:', data);
      setMakes(data || []);
    } catch (err) {
      console.error('Error in loadMakes:', err);
    }
  };

  const fetchModels = useCallback(async (makeId: string) => {
    if (!makeId) {
      console.log('No make ID provided, clearing models');
      setModels([]);
      return;
    }
    
    console.log('Fetching models for make:', makeId);
    
    try {
      const { data, error } = await supabase
        .from('vehicle_models')
        .select('*')
        .eq('make_id', makeId)
        .order('model_display');
      
      if (error) {
        console.error('Error fetching models:', error);
        return;
      }
      
      console.log('Fetched models:', data);
      const formattedModels: CarModel[] = (data || []).map((model: any) => ({
        model_name: model.model_display,
        model_make_id: model.make_id
      }));
      
      setModels(formattedModels);
    } catch (err) {
      console.error('Error in fetchModels:', err);
    }
  }, []);

  const findMatchingMake = useCallback((decodedMake: string): CarMake | null => {
    if (!decodedMake || makes.length === 0) return null;
    
    console.log('Finding matching make for decoded make:', decodedMake);
    console.log('Available makes:', makes);
    
    const decodedMakeLower = decodedMake.toLowerCase().trim();
    
    // Try exact match on make_id first
    let match = makes.find(make => 
      make.make_id.toLowerCase() === decodedMakeLower
    );
    
    if (match) {
      console.log('Found exact make_id match:', match);
      return match;
    }
    
    // Try exact match on make_display
    match = makes.find(make => 
      make.make_display.toLowerCase() === decodedMakeLower
    );
    
    if (match) {
      console.log('Found exact make_display match:', match);
      return match;
    }
    
    // Try partial match on make_display
    match = makes.find(make => 
      make.make_display.toLowerCase().includes(decodedMakeLower) ||
      decodedMakeLower.includes(make.make_display.toLowerCase())
    );
    
    if (match) {
      console.log('Found partial make_display match:', match);
      return match;
    }
    
    // Try partial match on make_id
    match = makes.find(make => 
      make.make_id.toLowerCase().includes(decodedMakeLower) ||
      decodedMakeLower.includes(make.make_id.toLowerCase())
    );
    
    if (match) {
      console.log('Found partial make_id match:', match);
      return match;
    }
    
    console.log('No matching make found for:', decodedMake);
    return null;
  }, [makes]);

  const handleVinDecode = useCallback(async (vin: string) => {
    console.log('Starting VIN decode process for:', vin);
    
    const onSuccess = (result: VinDecodeResult) => {
      console.log('VIN decode successful, result:', result);
      setDecodedVehicleInfo(result);
      
      // Update form with decoded info
      if (result.year) {
        console.log('Setting year:', result.year);
        form.setValue(`vehicles.${index}.year`, result.year.toString());
      }
      
      // Handle make matching and form updates
      if (result.make) {
        const matchingMake = findMatchingMake(result.make);
        if (matchingMake) {
          console.log('Setting make to:', matchingMake.make_id);
          form.setValue(`vehicles.${index}.make`, matchingMake.make_id);
          
          // Fetch models for this make
          fetchModels(matchingMake.make_id).then(() => {
            // Set model if available
            if (result.model) {
              console.log('Setting model to:', result.model);
              form.setValue(`vehicles.${index}.model`, result.model);
            }
          });
        } else {
          console.log('No matching make found, setting raw make value:', result.make);
          form.setValue(`vehicles.${index}.make`, result.make);
        }
      }
    };

    const onError = (error: string) => {
      console.error('VIN decode failed:', error);
      setDecodedVehicleInfo(null);
    };

    await vinDecoder.decode(vin, onSuccess, onError);
  }, [form, index, findMatchingMake, fetchModels, vinDecoder]);

  const onVinRetry = useCallback(() => {
    const currentVin = form.getValues(`vehicles.${index}.vin`);
    if (currentVin && vinDecoder.canRetry) {
      const onSuccess = (result: VinDecodeResult) => {
        console.log('VIN retry successful:', result);
        setDecodedVehicleInfo(result);
      };
      
      const onError = (error: string) => {
        console.error('VIN retry failed:', error);
      };
      
      vinDecoder.retry(currentVin, onSuccess, onError);
    }
  }, [form, index, vinDecoder]);

  return {
    makes,
    models,
    vinProcessing: vinDecoder.isProcessing,
    vinError: vinDecoder.error,
    canRetry: vinDecoder.canRetry,
    decodedVehicleInfo,
    fetchModels,
    handleVinDecode,
    onVinRetry
  };
};
