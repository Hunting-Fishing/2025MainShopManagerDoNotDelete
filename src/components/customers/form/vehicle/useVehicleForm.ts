
import { useState, useEffect } from 'react';
import { VinDecodeResult } from '@/types/vehicle';
import { useVinDecoder } from './hooks/useVinDecoder';
import { UseFormReturn } from 'react-hook-form';

interface UseVehicleFormProps {
  form: UseFormReturn<any>;
  index: number;
}

export const useVehicleForm = ({ form, index }: UseVehicleFormProps) => {
  const [makes, setMakes] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [decodedVehicleInfo, setDecodedVehicleInfo] = useState<VinDecodeResult | null>(null);
  
  const { 
    decode, 
    isDecoding: vinProcessing, 
    error: vinError,
    canRetry,
    hasAttempted,
    retry: onVinRetry 
  } = useVinDecoder();

  // Mock data for makes with correct structure
  const mockMakes = [
    { make_id: 'chevrolet', make_display: 'Chevrolet' },
    { make_id: 'ford', make_display: 'Ford' },
    { make_id: 'toyota', make_display: 'Toyota' },
    { make_id: 'honda', make_display: 'Honda' },
    { make_id: 'nissan', make_display: 'Nissan' },
    { make_id: 'bmw', make_display: 'BMW' },
    { make_id: 'mercedes-benz', make_display: 'Mercedes-Benz' },
    { make_id: 'audi', make_display: 'Audi' },
    { make_id: 'volkswagen', make_display: 'Volkswagen' },
    { make_id: 'hyundai', make_display: 'Hyundai' },
    { make_id: 'kia', make_display: 'Kia' },
    { make_id: 'subaru', make_display: 'Subaru' },
    { make_id: 'mazda', make_display: 'Mazda' },
    { make_id: 'mitsubishi', make_display: 'Mitsubishi' },
    { make_id: 'volvo', make_display: 'Volvo' },
  ];

  // Mock data for models with correct structure
  const mockModels = [
    { model_name: 'Equinox', model_display: 'Equinox', make_id: 'chevrolet' },
    { model_name: 'Silverado', model_display: 'Silverado', make_id: 'chevrolet' },
    { model_name: 'F-150', model_display: 'F-150', make_id: 'ford' },
    { model_name: 'Mustang', model_display: 'Mustang', make_id: 'ford' },
    { model_name: 'Camry', model_display: 'Camry', make_id: 'toyota' },
    { model_name: 'Corolla', model_display: 'Corolla', make_id: 'toyota' },
    { model_name: 'Civic', model_display: 'Civic', make_id: 'honda' },
    { model_name: 'Accord', model_display: 'Accord', make_id: 'honda' },
  ];

  useEffect(() => {
    setMakes(mockMakes);
  }, []);

  const fetchModels = (makeId: string) => {
    console.log('Fetching models for make:', makeId);
    const filteredModels = mockModels.filter(model => 
      model.make_id.toLowerCase() === makeId.toLowerCase()
    );
    setModels(filteredModels);
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
          
          // Try to match with existing makes first
          const matchedMake = mockMakes.find(make => 
            make.make_display.toLowerCase() === result.make?.toLowerCase()
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
          form.setValue(`vehicles.${index}.model`, result.model);
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
    onVinRetry
  };
};
