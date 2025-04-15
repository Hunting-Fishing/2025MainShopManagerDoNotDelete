
import React, { useState, useCallback, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { useVehicleData } from "@/hooks/useVehicleData";
import { VinDecodeResult } from "@/types/vehicle";
import { useVehicleMakeModel } from "@/hooks/useVehicleMakeModel";

interface UseVehicleFormProps {
  form: UseFormReturn<any>;
  index: number;
}

export const useVehicleForm = ({ form, index }: UseVehicleFormProps) => {
  const [vinProcessing, setVinProcessing] = useState<boolean>(false);
  const [lastProcessedVin, setLastProcessedVin] = useState<string>('');
  const [vinDecodeSuccess, setVinDecodeSuccess] = useState<boolean>(false);
  const [decodedVehicleInfo, setDecodedVehicleInfo] = useState<VinDecodeResult | null>(null);
  
  const { decodeVin, years } = useVehicleData();
  const { 
    validateMakeModel, 
    fetchModels,
    makes 
  } = useVehicleMakeModel({ 
    form, 
    fieldPrefix: `vehicles.${index}.` 
  });
  
  // Watch VIN changes
  const vin = form.watch(`vehicles.${index}.vin`);
  
  // Process VIN when it changes
  const processVin = useCallback(async (vin: string) => {
    if (!vin || vin.length !== 17 || vin === lastProcessedVin || vinProcessing) {
      return;
    }
    
    setVinProcessing(true);
    setLastProcessedVin(vin);
    setVinDecodeSuccess(false);
    
    try {
      console.log("Processing VIN:", vin);
      const vehicleInfo = await decodeVin(vin);
      
      if (vehicleInfo) {
        console.log("VIN decoded successfully:", vehicleInfo);
        setDecodedVehicleInfo(vehicleInfo);
        
        // Set year directly
        if (vehicleInfo.year) {
          form.setValue(`vehicles.${index}.year`, String(vehicleInfo.year));
        }
        
        // Set make and fetch models first
        if (vehicleInfo.make) {
          console.log("Setting make from VIN:", vehicleInfo.make);
          
          form.setValue(`vehicles.${index}.make`, vehicleInfo.make);
          
          // Fetch models for this make
          try {
            console.log("Fetching models for make:", vehicleInfo.make);
            const modelsList = await fetchModels(vehicleInfo.make);
            
            // Small delay to ensure models are loaded
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Then set model if provided in vehicleInfo
            if (vehicleInfo.model) {
              console.log("Setting model from VIN:", vehicleInfo.model);
              form.setValue(`vehicles.${index}.model`, vehicleInfo.model);
            }
            
            setVinDecodeSuccess(true);
          } catch (err) {
            console.error("Error fetching models:", err);
            // Still try to set the model directly
            if (vehicleInfo.model) {
              form.setValue(`vehicles.${index}.model`, vehicleInfo.model);
            }
          }
        }
        
        // Set any additional fields
        if (vehicleInfo.transmission) {
          form.setValue(`vehicles.${index}.transmission`, vehicleInfo.transmission);
        }
        if (vehicleInfo.fuel_type) {
          form.setValue(`vehicles.${index}.fuel_type`, vehicleInfo.fuel_type);
        }
        if (vehicleInfo.body_style) {
          form.setValue(`vehicles.${index}.body_style`, vehicleInfo.body_style);
        }
        
        // Ensure form validation is triggered
        form.trigger([
          `vehicles.${index}.year`,
          `vehicles.${index}.make`,
          `vehicles.${index}.model`
        ]);
      }
    } catch (error) {
      console.error("Error processing VIN:", error);
      setVinDecodeSuccess(false);
    } finally {
      setVinProcessing(false);
    }
  }, [form, index, lastProcessedVin, vinProcessing, decodeVin, fetchModels]);

  // Process VIN on change
  useEffect(() => {
    if (vin) {
      processVin(vin);
    }
  }, [vin, processVin]);

  return {
    vinProcessing,
    vinDecodeSuccess,
    decodedVehicleInfo,
    years,
    makes
  };
};
