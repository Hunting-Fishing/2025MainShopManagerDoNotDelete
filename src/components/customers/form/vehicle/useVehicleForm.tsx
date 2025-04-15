
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
  const { validateMakeModel } = useVehicleMakeModel({ 
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
      const vehicleInfo = await decodeVin(vin);
      if (vehicleInfo) {
        setDecodedVehicleInfo(vehicleInfo);
        
        // Validate make/model before setting
        const isValid = await validateMakeModel(vehicleInfo.make, vehicleInfo.model);
        if (isValid) {
          form.setValue(`vehicles.${index}.year`, String(vehicleInfo.year));
          form.setValue(`vehicles.${index}.make`, vehicleInfo.make);
          form.setValue(`vehicles.${index}.model`, vehicleInfo.model);
          setVinDecodeSuccess(true);
        }
      }
    } catch (error) {
      console.error("Error processing VIN:", error);
      setVinDecodeSuccess(false);
    } finally {
      setVinProcessing(false);
    }
  }, [form, index, lastProcessedVin, vinProcessing, decodeVin, validateMakeModel]);

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
    years
  };
};
