
import { useState, useEffect, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { CustomerFormValues } from "../CustomerFormSchema";
import { useVehicleData } from "@/hooks/useVehicleData";
import { toast } from "@/hooks/use-toast";
import { VinDecodeResult } from "@/types/vehicle";

interface UseVehicleFormProps {
  form: UseFormReturn<CustomerFormValues>;
  index: number;
}

export const useVehicleForm = ({ form, index }: UseVehicleFormProps) => {
  const { 
    makes, 
    models, 
    years, 
    loading: dataLoading, 
    error,
    fetchModels,
    decodeVin
  } = useVehicleData();

  const [vinProcessing, setVinProcessing] = useState<boolean>(false);
  const [lastProcessedVin, setLastProcessedVin] = useState<string>('');
  const [vinDecodeTimeout, setVinDecodeTimeout] = useState<NodeJS.Timeout | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState<boolean>(false);
  const [vinDecodeSuccess, setVinDecodeSuccess] = useState<boolean>(false);
  const [decodedVehicleInfo, setDecodedVehicleInfo] = useState<VinDecodeResult | null>(null);
  
  const selectedMake = form.watch(`vehicles.${index}.make`);
  const vin = form.watch(`vehicles.${index}.vin`);

  // Fetch models when make changes
  useEffect(() => {
    if (selectedMake) {
      setModelsLoaded(false);
      fetchModels(selectedMake).then(() => {
        setModelsLoaded(true);
      });
    }
  }, [selectedMake, fetchModels]);

  // Enhanced auto-populate function that ensures proper order of operations
  const populateVehicleFromVin = useCallback(async (vehicleInfo: VinDecodeResult) => {
    if (!vehicleInfo) return;
    
    setVinProcessing(true);
    setDecodedVehicleInfo(vehicleInfo);
    console.log("Populating form with decoded VIN info:", vehicleInfo);
    
    try {
      // First set the year - ensure it's a string
      if (vehicleInfo.year) {
        form.setValue(`vehicles.${index}.year`, String(vehicleInfo.year));
      }
      
      // Then set the make and fetch models for this make
      if (vehicleInfo.make) {
        form.setValue(`vehicles.${index}.make`, vehicleInfo.make);
        
        // Wait for models to load
        await fetchModels(vehicleInfo.make);
        setModelsLoaded(true);
        
        // Set the model after models are fetched
        if (vehicleInfo.model) {
          setTimeout(() => {
            form.setValue(`vehicles.${index}.model`, vehicleInfo.model);
            
            // Set additional vehicle details if available
            if (vehicleInfo.transmission) 
              form.setValue(`vehicles.${index}.transmission`, vehicleInfo.transmission);
            if (vehicleInfo.drive_type) 
              form.setValue(`vehicles.${index}.drive_type`, vehicleInfo.drive_type);
            if (vehicleInfo.fuel_type) 
              form.setValue(`vehicles.${index}.fuel_type`, vehicleInfo.fuel_type);
            if (vehicleInfo.body_style) 
              form.setValue(`vehicles.${index}.body_style`, vehicleInfo.body_style);
            if (vehicleInfo.engine) 
              form.setValue(`vehicles.${index}.engine`, vehicleInfo.engine);
            if (vehicleInfo.trim)
              form.setValue(`vehicles.${index}.trim`, vehicleInfo.trim);
            if (vehicleInfo.transmission_type)
              form.setValue(`vehicles.${index}.transmission_type`, vehicleInfo.transmission_type);
            if (vehicleInfo.gvwr)
              form.setValue(`vehicles.${index}.gvwr`, vehicleInfo.gvwr);
            if (vehicleInfo.country)
              form.setValue(`vehicles.${index}.country`, vehicleInfo.country);
            
            // Trigger form validation after all fields are set
            form.trigger([
              `vehicles.${index}.year`,
              `vehicles.${index}.make`,
              `vehicles.${index}.model`
            ]);
            
            toast({
              title: "VIN Decoded Successfully",
              description: `Vehicle identified as ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`,
              variant: "success",
            });
            
            setVinDecodeSuccess(true);
            setVinProcessing(false);
          }, 300); // Small delay to ensure models are loaded
        } else {
          setVinProcessing(false);
        }
      } else {
        setVinProcessing(false);
      }
    } catch (err) {
      console.error("Error populating vehicle form:", err);
      setVinProcessing(false);
      setVinDecodeSuccess(false);
      
      toast({
        title: "Error",
        description: "Failed to populate vehicle information.",
        variant: "destructive",
      });
    }
  }, [form, index, fetchModels, toast]);

  // Auto-populate fields when VIN changes with improved debouncing
  useEffect(() => {
    // Skip if the VIN hasn't changed or is not long enough
    if (!vin || vin.length < 17 || vin === lastProcessedVin || vinProcessing) {
      return;
    }
    
    // Clear existing timeout if any
    if (vinDecodeTimeout) {
      clearTimeout(vinDecodeTimeout);
    }
    
    // Set a new timeout for debouncing
    const timeoutId = setTimeout(async () => {
      setVinProcessing(true);
      setLastProcessedVin(vin);
      setVinDecodeSuccess(false);
      
      try {
        const vehicleInfo = await decodeVin(vin);
        if (vehicleInfo) {
          await populateVehicleFromVin(vehicleInfo);
        } else {
          setVinProcessing(false);
          toast({
            title: "VIN Decode Failed",
            description: "Could not decode the VIN. Please check and try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error decoding VIN:", error);
        setVinProcessing(false);
        toast({
          title: "Error",
          description: "Failed to decode VIN. Please try again.",
          variant: "destructive",
        });
      }
    }, 1000);
    
    setVinDecodeTimeout(timeoutId);
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [vin, lastProcessedVin, vinProcessing, decodeVin, populateVehicleFromVin]);

  return {
    makes,
    models,
    years,
    loading: dataLoading,
    error,
    vinProcessing,
    modelsLoaded,
    vinDecodeSuccess,
    decodedVehicleInfo,
    fetchModels
  };
};
