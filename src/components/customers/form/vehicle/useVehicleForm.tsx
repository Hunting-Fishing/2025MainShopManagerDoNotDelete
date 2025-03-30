
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
      // First set the year
      form.setValue(`vehicles.${index}.year`, vehicleInfo.year);
      
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
  }, [form, index, fetchModels]);

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
          setVinDecodeSuccess(false);
          toast({
            title: "Invalid VIN",
            description: "Could not decode the provided VIN. Please check and try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("VIN decode error:", error);
        setVinProcessing(false);
        setVinDecodeSuccess(false);
        toast({
          title: "VIN Decode Error",
          description: "An error occurred while decoding the VIN.",
          variant: "destructive",
        });
      }
    }, 800); // Increased debounce time for better UX
    
    setVinDecodeTimeout(timeoutId);
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [vin, populateVehicleFromVin, lastProcessedVin, vinProcessing, decodeVin]);

  const handleMakeChange = (value: string) => {
    // Update the form
    form.setValue(`vehicles.${index}.make`, value);
    // Clear the model since it depends on make
    form.setValue(`vehicles.${index}.model`, '');
    // Fetch models for this make
    fetchModels(value);
  };

  return {
    makes,
    models,
    years,
    loading: dataLoading,
    error,
    selectedMake,
    vinProcessing,
    modelsLoaded,
    vinDecodeSuccess,
    decodedVehicleInfo,
    handleMakeChange
  };
};
