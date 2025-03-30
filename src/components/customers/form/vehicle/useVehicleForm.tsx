
import { useEffect } from "react";
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

  // Auto-populate fields when VIN changes
  useEffect(() => {
    if (vin && vin.length >= 17) {
      const vehicleInfo = decodeVin(vin);
      if (vehicleInfo) {
        // Update form fields with decoded VIN information
        form.setValue(`vehicles.${index}.year`, vehicleInfo.year);
        form.setValue(`vehicles.${index}.make`, vehicleInfo.make);
        
        // Fetch models for this make first, then set the model
        fetchModels(vehicleInfo.make);
        form.setValue(`vehicles.${index}.model`, vehicleInfo.model);
      }
    }
  }, [vin, form, index, decodeVin, fetchModels]);

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
