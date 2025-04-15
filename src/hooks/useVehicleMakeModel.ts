
import { useState, useCallback, useRef, useEffect } from 'react';
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
    models: availableModels,
    loading: vehicleDataLoading,
    fetchModels: fetchAvailableModels,
  } = useVehicleData();

  const [models, setModels] = useState<CarModel[]>([]);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const lastMakeRef = useRef<string>('');
  
  // Get the current make value
  const currentMake = form.watch(`${fieldPrefix}make`) as string;

  // Effect to load models when make changes
  useEffect(() => {
    if (currentMake && currentMake !== lastMakeRef.current) {
      handleMakeChange(currentMake);
    }
  }, [currentMake]);

  const fetchModels = useCallback(async (makeValue: string) => {
    if (!makeValue) return [];
    
    console.log(`Fetching models for make: ${makeValue}`);
    setIsModelLoading(true);
    
    try {
      const fetchedModels = await fetchAvailableModels(makeValue);
      console.log(`Fetched ${fetchedModels.length} models for ${makeValue}`);
      setModels(fetchedModels);
      return fetchedModels;
    } catch (err) {
      console.error("Error fetching models:", err);
      toast({
        title: "Error",
        description: "Failed to load vehicle models",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsModelLoading(false);
    }
  }, [fetchAvailableModels]);

  const handleMakeChange = useCallback(async (makeValue: string) => {
    console.log("Make changed:", makeValue);
    
    if (!makeValue) {
      setModels([]);
      setModelsLoaded(false);
      return;
    }
    
    try {
      // Clear model when make changes
      const currentModel = form.getValues(`${fieldPrefix}model`);
      if (currentModel && makeValue !== lastMakeRef.current) {
        form.setValue(`${fieldPrefix}model`, '');
      }
      
      // Don't refetch if we just loaded models for this make
      if (makeValue === lastMakeRef.current && modelsLoaded) {
        console.log(`Using cached models for ${makeValue}`);
        return;
      }
      
      setIsModelLoading(true);
      const fetchedModels = await fetchAvailableModels(makeValue);
      setModels(fetchedModels);
      setModelsLoaded(true);
      lastMakeRef.current = makeValue;
      console.log(`Models fetched for make: ${makeValue}, found ${fetchedModels.length} models`);
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
  }, [form, fieldPrefix, fetchAvailableModels, modelsLoaded]);

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
      
      // If we haven't loaded models for this make yet or it's different from the last make, fetch them
      if (make !== lastMakeRef.current || !modelsLoaded) {
        await fetchModels(make);
        lastMakeRef.current = make;
      }
      
      // Check if model exists, case insensitive
      const modelExists = models.some(m => 
        m.model_name.toLowerCase() === model.toLowerCase()
      );
      
      if (!modelExists) {
        console.log(`Model "${model}" not found for make "${make}"`);
        // Still return true since we allow custom models that might not be in our database
        return true;
      }
      
      return true;
    } catch (err) {
      console.error("Error validating make/model:", err);
      return false;
    }
  }, [makes, models, fetchModels, modelsLoaded]);

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
