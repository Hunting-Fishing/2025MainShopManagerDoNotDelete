
import { useState, useEffect, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { CustomerFormValues } from "../CustomerFormSchema";
import { useVehicleData } from "@/hooks/useVehicleData";
import { toast } from "@/hooks/use-toast";

interface UseVehicleFormProps {
  form: UseFormReturn<CustomerFormValues>;
  index: number;
}

export const useVehicleForm = ({ form, index }: UseVehicleFormProps) => {
  const { 
    makes, 
    models, 
    years, 
    loading, 
    error,
    fetchModels,
    decodeVin
  } = useVehicleData();

  const [vinProcessing, setVinProcessing] = useState<boolean>(false);
  const [lastProcessedVin, setLastProcessedVin] = useState<string>('');
  
  const selectedMake = form.watch(`vehicles.${index}.make`);
  const vin = form.watch(`vehicles.${index}.vin`);

  // Fetch models when make changes
  useEffect(() => {
    if (selectedMake) {
      fetchModels(selectedMake);
    }
  }, [selectedMake, fetchModels]);

  // Enhanced auto-populate function that ensures proper order of operations
  const populateVehicleFromVin = useCallback(async (vehicleInfo: any) => {
    if (!vehicleInfo) return;
    
    setVinProcessing(true);
    console.log("Populating form with decoded VIN info:", vehicleInfo);
    
    try {
      // First set the year
      form.setValue(`vehicles.${index}.year`, vehicleInfo.year);
      
      // Then set the make and fetch models for this make
      form.setValue(`vehicles.${index}.make`, vehicleInfo.make);
      await fetchModels(vehicleInfo.make);
      
      // Wait to ensure models are loaded before setting model
      setTimeout(() => {
        // Finally set the model after models are fetched
        form.setValue(`vehicles.${index}.model`, vehicleInfo.model);
        
        // Trigger form validation after all fields are set
        form.trigger([
          `vehicles.${index}.year`,
          `vehicles.${index}.make`,
          `vehicles.${index}.model`
        ]);
        
        toast({
          title: "VIN Decoded",
          description: "Vehicle information has been populated.",
          variant: "default",
        });
        
        setVinProcessing(false);
      }, 300); // Small delay to ensure models are loaded
    } catch (err) {
      console.error("Error populating vehicle form:", err);
      setVinProcessing(false);
      
      toast({
        title: "Error",
        description: "Failed to populate vehicle information.",
        variant: "destructive",
      });
    }
  }, [form, index, fetchModels, toast]);

  // Auto-populate fields when VIN changes
  useEffect(() => {
    // Skip if the VIN hasn't changed or is not long enough
    if (!vin || vin.length < 17 || vin === lastProcessedVin || vinProcessing) {
      return;
    }
    
    setLastProcessedVin(vin);
    
    const timeoutId = setTimeout(() => {
      const vehicleInfo = decodeVin(vin);
      if (vehicleInfo) {
        populateVehicleFromVin(vehicleInfo);
      } else {
        toast({
          title: "Invalid VIN",
          description: "Could not decode the provided VIN. Please check and try again.",
          variant: "destructive",
        });
      }
    }, 500); // Debounce to prevent multiple calls
    
    return () => clearTimeout(timeoutId);
  }, [vin, populateVehicleFromVin, decodeVin, lastProcessedVin, vinProcessing]);

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
    loading,
    error,
    selectedMake,
    vinProcessing,
    handleMakeChange
  };
};
