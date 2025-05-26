
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
  const [makesLoading, setMakesLoading] = useState(true);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [decodedVehicleInfo, setDecodedVehicleInfo] = useState<VinDecodeResult | null>(null);

  const {
    decode: decodeVin,
    isDecoding: vinProcessing,
    error: vinError,
    canRetry,
    hasAttempted,
    retry: onVinRetry
  } = useVinDecoder();

  // Fetch makes from database
  const fetchMakes = useCallback(async () => {
    try {
      setMakesLoading(true);
      const { data, error } = await supabase
        .from('vehicle_makes')
        .select('*')
        .order('make_display', { ascending: true });

      if (error) {
        console.error('Error fetching makes:', error);
        setMakes([]);
      } else {
        console.log('Fetched makes from database:', data);
        setMakes(data || []);
      }
    } catch (error) {
      console.error('Error in fetchMakes:', error);
      setMakes([]);
    } finally {
      setMakesLoading(false);
    }
  }, []);

  // Fetch models for a specific make
  const fetchModels = useCallback(async (makeId: string) => {
    if (!makeId) {
      console.log('No make ID provided, clearing models');
      setModels([]);
      return;
    }

    try {
      setModelsLoading(true);
      const { data, error } = await supabase
        .from('vehicle_models')
        .select('*')
        .eq('model_make_id', makeId)
        .order('model_name', { ascending: true });

      if (error) {
        console.error('Error fetching models:', error);
        setModels([]);
      } else {
        console.log('Fetched models for make:', makeId, data);
        setModels(data || []);
      }
    } catch (error) {
      console.error('Error in fetchModels:', error);
      setModels([]);
    } finally {
      setModelsLoading(false);
    }
  }, []);

  // Handle VIN decoding
  const handleVinDecode = useCallback(async (vin: string) => {
    if (!vin || vin.length !== 17) return;

    try {
      console.log('Starting VIN decode for:', vin);
      const result = await decodeVin(vin);
      
      if (result) {
        console.log('VIN decode successful, result:', result);
        setDecodedVehicleInfo(result);
        
        // Set the year if available
        if (result.year) {
          console.log('Setting year:', result.year);
          form.setValue(`vehicles.${index}.year`, result.year.toString());
        }

        // Handle make field - improved logic for empty database
        if (result.make) {
          const decodedMake = result.make;
          console.log('Processing decoded make:', decodedMake);
          
          // Wait for makes to be loaded if they're still loading
          if (makesLoading) {
            console.log('Makes still loading, waiting...');
            // Store the decoded make temporarily
            form.setValue(`vehicles.${index}.decoded_make`, decodedMake);
            return;
          }

          if (makes.length === 0) {
            console.log('No makes database available, using raw make value:', decodedMake);
            // Database is empty, use the raw decoded value
            form.setValue(`vehicles.${index}.make`, decodedMake);
            form.setValue(`vehicles.${index}.decoded_make`, decodedMake);
          } else {
            console.log('Searching for make in database:', decodedMake);
            // Try to find matching make in database
            const matchingMake = makes.find(make => 
              make.make_display?.toLowerCase() === decodedMake.toLowerCase() ||
              make.make_id?.toLowerCase() === decodedMake.toLowerCase()
            );

            if (matchingMake) {
              console.log('Found matching make in database:', matchingMake);
              form.setValue(`vehicles.${index}.make`, matchingMake.make_id);
              form.setValue(`vehicles.${index}.decoded_make`, ''); // Clear temporary field
              // Fetch models for this make
              fetchModels(matchingMake.make_id);
            } else {
              console.log('No matching make found in database, preserving decoded value');
              // No match found, preserve the decoded information for manual entry
              form.setValue(`vehicles.${index}.make`, '');
              form.setValue(`vehicles.${index}.decoded_make`, decodedMake);
            }
          }
        }

        // Set model if available and not "Unknown"
        if (result.model && result.model !== 'Unknown') {
          console.log('Setting model:', result.model);
          form.setValue(`vehicles.${index}.model`, result.model);
        }

        console.log('Form updated with VIN decoded data');
      }
    } catch (error) {
      console.error('Error in handleVinDecode:', error);
    }
  }, [decodeVin, form, index, makes, makesLoading, fetchModels]);

  // Handle the case where makes finish loading after VIN decode
  useEffect(() => {
    // Get the current form values
    const currentValues = form.getValues();
    const vehicleData = currentValues.vehicles?.[index];
    const decodedMakeValue = vehicleData?.decoded_make;
    
    if (decodedMakeValue && makes.length > 0 && !makesLoading) {
      console.log('Makes loaded after VIN decode, trying to match:', decodedMakeValue);
      
      const matchingMake = makes.find(make => 
        make.make_display?.toLowerCase() === decodedMakeValue.toLowerCase() ||
        make.make_id?.toLowerCase() === decodedMakeValue.toLowerCase()
      );

      if (matchingMake) {
        console.log('Found matching make after load:', matchingMake);
        form.setValue(`vehicles.${index}.make`, matchingMake.make_id);
        form.setValue(`vehicles.${index}.decoded_make`, ''); // Clear the temporary field
        fetchModels(matchingMake.make_id);
      }
    }
  }, [makes, makesLoading, form, index, fetchModels]);

  // Load makes on component mount
  useEffect(() => {
    fetchMakes();
  }, [fetchMakes]);

  return {
    makes,
    models,
    makesLoading,
    modelsLoading,
    vinProcessing,
    vinError,
    canRetry,
    hasAttempted,
    decodedVehicleInfo,
    fetchModels,
    handleVinDecode,
    onVinRetry
  };
};
