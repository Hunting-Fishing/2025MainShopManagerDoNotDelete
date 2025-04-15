
import { useState, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useVehicleData } from './useVehicleData';
import { toast } from '@/hooks/use-toast';
import { CarMake, CarModel } from '@/types/vehicle';

interface UseVehicleMakeModelProps {
  form: UseFormReturn<any>;
  fieldPrefix: string;
}

export const useVehicleMakeModel = ({ form, fieldPrefix }: UseVehicleMakeModelProps) => {
  const {
    makes,
    models,
    loading: vehicleDataLoading,
    fetchModels,
  } = useVehicleData();

  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const handleMakeChange = useCallback(async (makeValue: string) => {
    console.log("Make changed:", makeValue);
    
    if (!makeValue) return;
    
    try {
      // Clear model when make changes
      const currentModel = form.getValues(`${fieldPrefix}model`);
      if (currentModel) {
        form.setValue(`${fieldPrefix}model`, '');
      }
      
      setIsModelLoading(true);
      await fetchModels(makeValue);
      setModelsLoaded(true);
      console.log(`Models fetched for make: ${makeValue}`);
    } catch (err) {
      console.error("Error handling make change:", err);
      toast({
        title: "Error",
        description: "Failed to load models for the selected make.",
        variant: "destructive",
      });
    } finally {
      setIsModelLoading(false);
    }
  }, [form, fieldPrefix, fetchModels]);

  const validateMakeModel = useCallback(async (make: string, model: string) => {
    if (!make || !model) return true;
    
    try {
      const makeExists = makes.some(m => 
        m.make_id.toLowerCase() === make.toLowerCase() ||
        m.make_display.toLowerCase() === make.toLowerCase()
      );
      
      if (!makeExists) {
        console.log(`Make "${make}" not found in available makes`);
        return false;
      }
      
      await fetchModels(make);
      
      const modelExists = models.some(m => 
        m.model_name.toLowerCase() === model.toLowerCase()
      );
      
      if (!modelExists) {
        console.log(`Model "${model}" not found for make "${make}"`);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error("Error validating make/model:", err);
      return false;
    }
  }, [makes, models, fetchModels]);

  return {
    makes,
    models,
    isModelLoading,
    modelsLoaded,
    vehicleDataLoading,
    handleMakeChange,
    validateMakeModel,
    fetchModels
  };
};
