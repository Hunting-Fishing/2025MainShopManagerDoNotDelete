
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
  const [isModelLoading, setIsModelLoading] = useState<boolean>(false);
  
  const selectedMake = form.watch(`vehicles.${index}.make`);
  const vin = form.watch(`vehicles.${index}.vin`);

  // Manual make selection or change from outside the component
  useEffect(() => {
    if (selectedMake && !isModelLoading) {
      console.log("Make changed or selected in useVehicleForm:", selectedMake);
      setModelsLoaded(false);
      setIsModelLoading(true);
      
      fetchModels(selectedMake)
        .then((fetchedModels) => {
          setModelsLoaded(true);
          const modelsCount = fetchedModels ? fetchedModels.length : 0;
          console.log(`Loaded ${modelsCount} models for make:`, selectedMake);
        })
        .finally(() => {
          setIsModelLoading(false);
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
      // Batch our form updates to avoid race conditions
      const updates: Record<string, any> = {};
      
      // First set the year - ensure it's a string
      if (vehicleInfo.year) {
        updates[`vehicles.${index}.year`] = String(vehicleInfo.year);
        console.log("Setting year to:", vehicleInfo.year);
      }
      
      // Then set the make
      if (vehicleInfo.make) {
        console.log("Setting make to:", vehicleInfo.make);
        updates[`vehicles.${index}.make`] = vehicleInfo.make;
        
        // Wait for models to load
        console.log("Fetching models for make:", vehicleInfo.make);
        setIsModelLoading(true);
        const fetchedModels = await fetchModels(vehicleInfo.make);
        setIsModelLoading(false);
        const modelsCount = fetchedModels ? fetchedModels.length : 0;
        console.log(`Fetched ${modelsCount} models for make:`, vehicleInfo.make);
        setModelsLoaded(true);
        
        // Set the model
        if (vehicleInfo.model) {
          console.log("Setting model to:", vehicleInfo.model);
          updates[`vehicles.${index}.model`] = vehicleInfo.model;
          
          // Additional vehicle details
          if (vehicleInfo.transmission) updates[`vehicles.${index}.transmission`] = vehicleInfo.transmission;
          if (vehicleInfo.drive_type) updates[`vehicles.${index}.drive_type`] = vehicleInfo.drive_type;
          if (vehicleInfo.fuel_type) updates[`vehicles.${index}.fuel_type`] = vehicleInfo.fuel_type;
          if (vehicleInfo.body_style) updates[`vehicles.${index}.body_style`] = vehicleInfo.body_style;
          if (vehicleInfo.engine) updates[`vehicles.${index}.engine`] = vehicleInfo.engine;
          if (vehicleInfo.trim) updates[`vehicles.${index}.trim`] = vehicleInfo.trim;
          if (vehicleInfo.transmission_type) updates[`vehicles.${index}.transmission_type`] = vehicleInfo.transmission_type;
          if (vehicleInfo.gvwr) updates[`vehicles.${index}.gvwr`] = vehicleInfo.gvwr;
          if (vehicleInfo.country) updates[`vehicles.${index}.country`] = vehicleInfo.country;
        }
      }
      
      // Apply all updates at once
      Object.entries(updates).forEach(([key, value]) => {
        form.setValue(key, value);
      });
      
      // Trigger form validation after all fields are set
      form.trigger([
        `vehicles.${index}.year`,
        `vehicles.${index}.make`,
        `vehicles.${index}.model`
      ]);
      
      // Verify fields were set correctly
      console.log("After decoding - Current year:", form.getValues(`vehicles.${index}.year`));
      console.log("After decoding - Current make:", form.getValues(`vehicles.${index}.make`));
      console.log("After decoding - Current model:", form.getValues(`vehicles.${index}.model`));
      
      setVinDecodeSuccess(true);
      
      toast({
        title: "VIN Decoded Successfully",
        description: `Vehicle identified as ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`,
        variant: "success",
      });
    } catch (err) {
      console.error("Error populating vehicle form:", err);
      toast({
        title: "Error",
        description: "Failed to populate vehicle information.",
        variant: "destructive",
      });
    } finally {
      setVinProcessing(false);
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
        console.log(`Initiating VIN decode for ${vin}`);
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
    fetchModels,
    isModelLoading
  };
};
