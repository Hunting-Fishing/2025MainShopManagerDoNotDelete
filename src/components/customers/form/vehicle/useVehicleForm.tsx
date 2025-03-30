
import { useEffect, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { CustomerFormValues } from "../CustomerFormSchema";
import { useVehicleData } from "@/hooks/useVehicleData";

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
    
    console.log("Populating form with decoded VIN info:", vehicleInfo);
    
    // First set the year
    form.setValue(`vehicles.${index}.year`, vehicleInfo.year);
    
    // Then set the make and fetch models for this make
    form.setValue(`vehicles.${index}.make`, vehicleInfo.make);
    await fetchModels(vehicleInfo.make);
    
    // Finally set the model after models are fetched
    setTimeout(() => {
      form.setValue(`vehicles.${index}.model`, vehicleInfo.model);
    }, 100); // Small delay to ensure models are loaded
  }, [form, index, fetchModels]);

  // Auto-populate fields when VIN changes
  useEffect(() => {
    if (vin && vin.length >= 17) {
      const vehicleInfo = decodeVin(vin);
      if (vehicleInfo) {
        populateVehicleFromVin(vehicleInfo);
      }
    }
  }, [vin, populateVehicleFromVin, decodeVin]);

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
    handleMakeChange
  };
};
