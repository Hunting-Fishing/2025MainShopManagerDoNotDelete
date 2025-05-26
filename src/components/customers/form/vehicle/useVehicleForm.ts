import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CarMake, CarModel, VinDecodeResult } from '@/types/vehicle';
import { useVinDecoder } from './hooks/useVinDecoder';
import { fetchMakes, fetchModels as fetchModelsFromAPI } from '@/services/vehicleDataService';

interface UseVehicleFormProps {
  form: UseFormReturn<any>;
  index: number;
}

export const useVehicleForm = ({ form, index }: UseVehicleFormProps) => {
  const [makes, setMakes] = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [decodedVehicleInfo, setDecodedVehicleInfo] = useState<VinDecodeResult | null>(null);
  
  const { 
    decode: decodeVin, 
    isDecoding: vinProcessing, 
    error: vinError,
    canRetry,
    hasAttempted,
    retry
  } = useVinDecoder();

  // Load makes on component mount
  useEffect(() => {
    const loadMakes = async () => {
      try {
        const makesData = await fetchMakes();
        console.log('Loaded makes data:', makesData);
        setMakes(makesData || []);
      } catch (error) {
        console.error('Error loading makes:', error);
        setMakes([]);
      }
    };

    loadMakes();
  }, []);

  // Function to fetch models based on make
  const fetchModels = async (makeId: string) => {
    if (!makeId) {
      console.log('No make ID provided, clearing models');
      setModels([]);
      return;
    }

    try {
      console.log('Fetching models for make ID:', makeId);
      const modelsData = await fetchModelsFromAPI(makeId);
      console.log('Loaded models data:', modelsData);
      setModels(modelsData || []);
    } catch (error) {
      console.error('Error loading models:', error);
      setModels([]);
    }
  };

  // Handle VIN decoding
  const handleVinDecode = async (vin: string) => {
    if (!vin || vin.length !== 17) {
      return;
    }

    try {
      console.log('Starting VIN decode process for:', vin);
      const result = await decodeVin(vin);
      
      if (result) {
        console.log('VIN decode successful, result:', result);
        setDecodedVehicleInfo(result);
        
        // Store decoded data in form - Basic Info
        if (result.year) {
          console.log('Setting year:', result.year);
          form.setValue(`vehicles.${index}.year`, result.year.toString());
          form.setValue(`vehicles.${index}.decoded_year`, result.year.toString());
        }
        
        if (result.make) {
          console.log('Setting decoded make:', result.make);
          form.setValue(`vehicles.${index}.decoded_make`, result.make);
          
          // Check if we have makes in database and find matching make
          if (makes.length > 0) {
            const matchingMake = makes.find(make => 
              make.make_display?.toLowerCase() === result.make?.toLowerCase()
            );
            
            if (matchingMake) {
              console.log('Found matching make in database:', matchingMake);
              form.setValue(`vehicles.${index}.make`, matchingMake.make_id);
              // Auto-fetch models for the matched make
              fetchModels(matchingMake.make_id);
            } else {
              console.log('No matching make found in database for:', result.make);
              // Clear the make field to allow manual selection
              form.setValue(`vehicles.${index}.make`, '');
            }
          } else {
            console.log('No makes database available, using raw make value:', result.make);
            form.setValue(`vehicles.${index}.make`, result.make);
          }
        }
        
        if (result.model && result.model !== 'Unknown') {
          console.log('Setting decoded model:', result.model);
          form.setValue(`vehicles.${index}.decoded_model`, result.model);
          
          // If we have models and find a match, set it
          if (models.length > 0) {
            const matchingModel = models.find(model => 
              model.model_name?.toLowerCase() === result.model?.toLowerCase()
            );
            
            if (matchingModel) {
              console.log('Found matching model in database:', matchingModel);
              form.setValue(`vehicles.${index}.model`, matchingModel.model_name);
            }
          } else {
            // Set the raw model value if no database
            form.setValue(`vehicles.${index}.model`, result.model);
          }
        }
        
        // Set additional decoded fields - THIS IS THE KEY FIX
        if (result.transmission) {
          console.log('Setting transmission:', result.transmission);
          form.setValue(`vehicles.${index}.transmission`, result.transmission);
          form.setValue(`vehicles.${index}.decoded_transmission`, result.transmission);
        }
        
        if (result.fuel_type) {
          console.log('Setting fuel_type:', result.fuel_type);
          form.setValue(`vehicles.${index}.fuel_type`, result.fuel_type);
          form.setValue(`vehicles.${index}.decoded_fuel_type`, result.fuel_type);
        }
        
        if (result.drive_type) {
          console.log('Setting drive_type:', result.drive_type);
          form.setValue(`vehicles.${index}.drive_type`, result.drive_type);
          form.setValue(`vehicles.${index}.decoded_drive_type`, result.drive_type);
        }
        
        if (result.engine) {
          console.log('Setting engine:', result.engine);
          form.setValue(`vehicles.${index}.engine`, result.engine);
          form.setValue(`vehicles.${index}.decoded_engine`, result.engine);
        }
        
        if (result.body_style) {
          console.log('Setting body_style:', result.body_style);
          form.setValue(`vehicles.${index}.body_style`, result.body_style);
          form.setValue(`vehicles.${index}.decoded_body_style`, result.body_style);
        }
        
        if (result.country) {
          console.log('Setting country:', result.country);
          form.setValue(`vehicles.${index}.country`, result.country);
          form.setValue(`vehicles.${index}.decoded_country`, result.country);
        }
        
        if (result.trim) {
          console.log('Setting trim:', result.trim);
          form.setValue(`vehicles.${index}.trim`, result.trim);
          form.setValue(`vehicles.${index}.decoded_trim`, result.trim);
        }
        
        if (result.gvwr) {
          console.log('Setting gvwr:', result.gvwr);
          form.setValue(`vehicles.${index}.gvwr`, result.gvwr);
          form.setValue(`vehicles.${index}.decoded_gvwr`, result.gvwr);
        }
        
        // Trigger form validation
        form.trigger(`vehicles.${index}`);
      }
    } catch (error) {
      console.error('VIN decode error:', error);
      setDecodedVehicleInfo(null);
    }
  };

  const onVinRetry = () => {
    retry();
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
    onVinRetry
  };
};
