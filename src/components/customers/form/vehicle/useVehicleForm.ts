
import { useState, useEffect } from 'react';
import { VinDecodeResult } from '@/types/vehicle';
import { useVinDecoder } from './hooks/useVinDecoder';
import { UseFormReturn } from 'react-hook-form';
import { fetchMakes, fetchModels as fetchVehicleModels } from '@/services/vehicleDataService';

interface UseVehicleFormProps {
  form: UseFormReturn<any>;
  index: number;
}

export const useVehicleForm = ({ form, index }: UseVehicleFormProps) => {
  const [makes, setMakes] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [decodedVehicleInfo, setDecodedVehicleInfo] = useState<VinDecodeResult | null>(null);
  const [isLoadingMakes, setIsLoadingMakes] = useState(false);
  const [makesError, setMakesError] = useState<string | null>(null);
  
  const { 
    decode, 
    isDecoding: vinProcessing, 
    error: vinError,
    canRetry,
    hasAttempted,
    retry: onVinRetry 
  } = useVinDecoder();

  useEffect(() => {
    const loadMakes = async () => {
      setIsLoadingMakes(true);
      setMakesError(null);
      try {
        console.log('Loading vehicle makes...');
        const makesData = await fetchMakes();
        console.log('Vehicle makes loaded:', makesData);
        setMakes(makesData);
      } catch (error) {
        console.error('Error loading makes:', error);
        setMakesError(error instanceof Error ? error.message : 'Failed to load makes');
        setMakes([]);
      } finally {
        setIsLoadingMakes(false);
      }
    };

    loadMakes();
  }, []);

  const fetchModels = async (makeId: string) => {
    console.log('Fetching models for make:', makeId);
    try {
      const modelsData = await fetchVehicleModels(makeId);
      setModels(modelsData);
    } catch (error) {
      console.error('Error loading models:', error);
      setModels([]);
    }
  };

  const handleVinDecode = async (vin: string) => {
    console.log('Starting VIN decode process for:', vin);
    
    try {
      const result = await decode(vin);
      
      if (result) {
        console.log('VIN decode successful, result:', result);
        setDecodedVehicleInfo(result);
        
        // Set all available fields from VIN decode result
        if (result.year) {
          console.log('Setting year:', result.year);
          form.setValue(`vehicles.${index}.year`, String(result.year));
        }
        
        if (result.make) {
          console.log('Setting decoded make:', result.make);
          
          // Normalize the make name for matching
          const normalizedMake = result.make.toLowerCase().replace(/[^a-z0-9]/g, '-');
          
          // Try to match with existing makes first
          const matchedMake = makes.find(make => 
            make.make_display.toLowerCase() === result.make?.toLowerCase() ||
            make.make_id === normalizedMake ||
            make.make_id.includes(normalizedMake) ||
            normalizedMake.includes(make.make_id)
          );
          
          if (matchedMake) {
            console.log('Found matching make in database:', matchedMake);
            form.setValue(`vehicles.${index}.make`, matchedMake.make_id);
            fetchModels(matchedMake.make_id);
          } else {
            console.log('No matching make found, using VIN decoded value:', result.make);
            // Store the decoded make as raw value for display
            form.setValue(`vehicles.${index}.make`, result.make);
            // Store decoded make separately for display purposes
            form.setValue(`vehicles.${index}.decoded_make`, result.make);
          }
        }
        
        if (result.model && result.model !== 'Unknown') {
          console.log('Setting model:', result.model);
          form.setValue(`vehicles.${index}.model`, result.model);
          // Store decoded model separately for display purposes
          form.setValue(`vehicles.${index}.decoded_model`, result.model);
        }

        // Set additional vehicle details
        if (result.transmission) {
          console.log('Setting transmission:', result.transmission);
          form.setValue(`vehicles.${index}.transmission`, result.transmission);
        }
        
        if (result.fuel_type) {
          console.log('Setting fuel_type:', result.fuel_type);
          form.setValue(`vehicles.${index}.fuel_type`, result.fuel_type);
        }
        
        if (result.drive_type) {
          console.log('Setting drive_type:', result.drive_type);
          form.setValue(`vehicles.${index}.drive_type`, result.drive_type);
        }
        
        if (result.engine) {
          console.log('Setting engine:', result.engine);
          form.setValue(`vehicles.${index}.engine`, result.engine);
        }
        
        if (result.body_style) {
          console.log('Setting body_style:', result.body_style);
          form.setValue(`vehicles.${index}.body_style`, result.body_style);
        }
        
        if (result.country) {
          console.log('Setting country:', result.country);
          form.setValue(`vehicles.${index}.country`, result.country);
        }
        
        if (result.trim) {
          console.log('Setting trim:', result.trim);
          form.setValue(`vehicles.${index}.trim`, result.trim);
        }
        
        if (result.gvwr) {
          console.log('Setting gvwr:', result.gvwr);
          form.setValue(`vehicles.${index}.gvwr`, result.gvwr);
        }
        
        if (result.color) {
          console.log('Setting color:', result.color);
          form.setValue(`vehicles.${index}.color`, result.color);
        }
        
        // Trigger form validation
        form.trigger(`vehicles.${index}`);
      } else {
        console.log('VIN decode returned no result');
        setDecodedVehicleInfo(null);
      }
    } catch (error) {
      console.error('VIN decode failed:', error);
      setDecodedVehicleInfo(null);
    }
  };

  return {
    makes,
    models,
    vinProcessing,
    vinError,
    canRetry,
    hasAttempted,
    decodedVehicleInfo,
    fetchModels,
    handleVinDecode,
    onVinRetry,
    isLoadingMakes,
    makesError
  };
};
