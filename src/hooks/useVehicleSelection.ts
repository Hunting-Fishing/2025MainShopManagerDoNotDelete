
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

  const { 
    makes,
    models,
    years,
    decodeVin,
    fetchModels: fetchAvailableModels
  } = useVehicleData();

  // Watch VIN and make changes
  const vin = form.watch(`vehicles.${index}.vin`);
  const selectedMake = form.watch(`vehicles.${index}.make`);

  // Fetch models when make changes
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

  // Handle make changes
  const handleMakeChange = useCallback(async (make: string) => {
    if (!make) return;
    console.log('Make changed:', make);
    
    form.setValue(`vehicles.${index}.model`, '');
    await fetchModels(make);
  }, [form, index, fetchModels]);

  // Process VIN when it changes
  const processVin = useCallback(async (vin: string) => {
    if (!vin || vin.length !== 17 || vin === lastProcessedVin || vinProcessing) return;

    setVinProcessing(true);
    setLastProcessedVin(vin);
    console.log('Processing VIN:', vin);

    try {
      const vehicleInfo = await decodeVin(vin);
      if (vehicleInfo) {
        setDecodedVehicleInfo(vehicleInfo);
        
        // Set year
        if (vehicleInfo.year) {
          form.setValue(`vehicles.${index}.year`, String(vehicleInfo.year));
        }

        // Set make and fetch models
        if (vehicleInfo.make) {
          form.setValue(`vehicles.${index}.make`, vehicleInfo.make);
          await fetchModels(vehicleInfo.make);
          
          // Small delay to ensure models are loaded
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Set model
          if (vehicleInfo.model) {
            form.setValue(`vehicles.${index}.model`, vehicleInfo.model);
          }
        }

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
  }, [form, index, lastProcessedVin, vinProcessing, decodeVin, fetchModels]);

  // Process VIN changes
  useEffect(() => {
    if (vin && vin.length === 17 && vin !== lastProcessedVin) {
      processVin(vin);
    }
  }, [vin, processVin, lastProcessedVin]);

  // Handle make changes
  useEffect(() => {
    if (selectedMake) {
      handleMakeChange(selectedMake);
    }
  }, [selectedMake, handleMakeChange]);

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
