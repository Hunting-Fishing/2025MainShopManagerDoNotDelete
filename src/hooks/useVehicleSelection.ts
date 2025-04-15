
import { useState, useCallback, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useVehicleData } from './useVehicleData';
import { VinDecodeResult } from '@/types/vehicle';

interface UseVehicleSelectionProps {
  form: UseFormReturn<any>;
  index: number;
}

export const useVehicleSelection = ({ form, index }: UseVehicleSelectionProps) => {
  const [vinProcessing, setVinProcessing] = useState(false);
  const [vinDecodeSuccess, setVinDecodeSuccess] = useState(false);
  const [decodedVehicleInfo, setDecodedVehicleInfo] = useState<VinDecodeResult | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [lastProcessedVin, setLastProcessedVin] = useState('');
  const [modelCache, setModelCache] = useState<Record<string, any>>({});
  const [modelSetTimeout, setModelSetTimeout] = useState<NodeJS.Timeout | null>(null);

  const { 
    makes,
    models,
    years,
    decodeVin,
    fetchModels: fetchAvailableModels
  } = useVehicleData();

  const vin = form.watch(`vehicles.${index}.vin`);
  const selectedMake = form.watch(`vehicles.${index}.make`);
  const selectedModel = form.watch(`vehicles.${index}.model`);

  // Debug log for selected model value
  useEffect(() => {
    if (selectedModel) {
      console.log(`useVehicleSelection: Current model value for index ${index}:`, selectedModel);
    }
  }, [selectedModel, index]);

  const fetchModels = useCallback(async (make: string) => {
    if (!make) return;
    
    const makeLower = make.toLowerCase();
    if (modelCache[makeLower]) {
      console.log('Using cached models for', make);
      return modelCache[makeLower];
    }

    setIsModelLoading(true);
    try {
      const models = await fetchAvailableModels(make);
      setModelCache(prev => ({ ...prev, [makeLower]: models }));
      return models;
    } catch (err) {
      console.error('Error fetching models:', err);
    } finally {
      setIsModelLoading(false);
    }
  }, [fetchAvailableModels]);

  const handleMakeChange = useCallback(async (make: string) => {
    if (!make) return;
    console.log('Make changed:', make);
    
    // Only clear model if make has changed and there's no VIN processing going on
    if (!vinProcessing) {
      form.setValue(`vehicles.${index}.model`, '');
    }
    await fetchModels(make);
  }, [form, index, fetchModels, vinProcessing]);

  const processVin = useCallback(async (vin: string) => {
    if (!vin || vin.length !== 17 || vin === lastProcessedVin || vinProcessing) return;

    setVinProcessing(true);
    setLastProcessedVin(vin);
    console.log('Processing VIN:', vin);

    try {
      const vehicleInfo = await decodeVin(vin);
      if (vehicleInfo) {
        console.log("Decoded vehicle info:", vehicleInfo);
        setDecodedVehicleInfo(vehicleInfo);
        
        if (vehicleInfo.year) {
          form.setValue(`vehicles.${index}.year`, String(vehicleInfo.year));
        }

        if (vehicleInfo.make) {
          form.setValue(`vehicles.${index}.make`, vehicleInfo.make);
          await fetchModels(vehicleInfo.make);
          
          // Clear any previous timeout
          if (modelSetTimeout) {
            clearTimeout(modelSetTimeout);
          }
          
          // Set model with a slight delay to ensure models are loaded first
          const timeout = setTimeout(() => {
            if (vehicleInfo.model) {
              console.log(`Setting model to:`, vehicleInfo.model);
              form.setValue(`vehicles.${index}.model`, vehicleInfo.model);
              // Force trigger form update to ensure UI reflects the change
              form.trigger(`vehicles.${index}.model`);
            }
          }, 800);
          
          setModelSetTimeout(timeout);
        }

        const additionalFields = [
          'transmission_type', 'drive_type', 
          'fuel_type', 'engine', 'body_style', 
          'country', 'trim', 'gvwr'
        ];

        additionalFields.forEach(field => {
          if (vehicleInfo[field as keyof VinDecodeResult]) {
            console.log(`Setting ${field} to:`, vehicleInfo[field as keyof VinDecodeResult]);
            form.setValue(`vehicles.${index}.${field}`, vehicleInfo[field as keyof VinDecodeResult]);
          }
        });

        setVinDecodeSuccess(true);
        form.trigger([
          `vehicles.${index}.year`,
          `vehicles.${index}.make`,
          `vehicles.${index}.model`
        ]);
      }
    } catch (err) {
      console.error('Error processing VIN:', err);
      setVinDecodeSuccess(false);
    } finally {
      setVinProcessing(false);
    }
  }, [form, index, lastProcessedVin, vinProcessing, decodeVin, fetchModels, modelSetTimeout]);

  useEffect(() => {
    if (vin && vin.length === 17 && vin !== lastProcessedVin) {
      processVin(vin);
    }
  }, [vin, processVin, lastProcessedVin]);

  useEffect(() => {
    if (selectedMake) {
      handleMakeChange(selectedMake);
    }
  }, [selectedMake, handleMakeChange]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (modelSetTimeout) {
        clearTimeout(modelSetTimeout);
      }
    };
  }, [modelSetTimeout]);

  return {
    makes,
    models,
    years,
    vinProcessing,
    vinDecodeSuccess,
    decodedVehicleInfo,
    isModelLoading,
    handleMakeChange,
    modelCache
  };
};
