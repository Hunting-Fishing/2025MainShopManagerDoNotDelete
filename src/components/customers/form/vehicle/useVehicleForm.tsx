
import { useState, useEffect, useCallback, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { CustomerFormValues } from "../CustomerFormSchema";
import { useVehicleData } from "@/hooks/useVehicleData";
import { toast } from "@/hooks/use-toast";
import { VinDecodeResult } from "@/types/vehicle";
import { decodeVin } from "@/utils/vehicleUtils";

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
    fetchModels
  } = useVehicleData();

  const [vinProcessing, setVinProcessing] = useState<boolean>(false);
  const [decodedVehicleInfo, setDecodedVehicleInfo] = useState<VinDecodeResult | null>(null);
  const vinDecodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  
  const selectedMake = form.watch(`vehicles.${index}.make`);
  const vin = form.watch(`vehicles.${index}.vin`);

  // Fetch models when make changes
  useEffect(() => {
    if (selectedMake && makes.length > 0) {
      fetchModels(selectedMake);
    }
  }, [selectedMake, fetchModels, makes.length]);

  const populateVehicleFromVin = useCallback(async (vehicleInfo: VinDecodeResult) => {
    if (!vehicleInfo || isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    setVinProcessing(true);
    setDecodedVehicleInfo(vehicleInfo);
    
    console.log("Populating vehicle from VIN:", vehicleInfo);
    
    try {
      // Set year first
      if (vehicleInfo.year) {
        form.setValue(`vehicles.${index}.year`, String(vehicleInfo.year));
      }
      
      // Set make and wait for models to load
      if (vehicleInfo.make) {
        form.setValue(`vehicles.${index}.make`, vehicleInfo.make);
        
        // Wait for models to be fetched
        await fetchModels(vehicleInfo.make);
        
        // Small delay to ensure models are loaded
        setTimeout(() => {
          if (vehicleInfo.model) {
            form.setValue(`vehicles.${index}.model`, vehicleInfo.model);
          }
          
          // Set additional details
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
          
          // Trigger validation
          form.trigger([
            `vehicles.${index}.year`,
            `vehicles.${index}.make`,
            `vehicles.${index}.model`
          ]);
          
          toast({
            title: "VIN Decoded Successfully",
            description: `Vehicle identified as ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`,
          });
          
          setVinProcessing(false);
          isProcessingRef.current = false;
        }, 500);
      } else {
        setVinProcessing(false);
        isProcessingRef.current = false;
      }
    } catch (err) {
      console.error("Error populating vehicle form:", err);
      setVinProcessing(false);
      isProcessingRef.current = false;
      
      toast({
        title: "Error",
        description: "Failed to populate vehicle information.",
        variant: "destructive",
      });
    }
  }, [form, index, fetchModels, toast]);

  // VIN decoding effect with improved debouncing
  useEffect(() => {
    if (!vin || vin.length !== 17 || vinProcessing || isProcessingRef.current) {
      return;
    }
    
    // Clear existing timeout
    if (vinDecodeTimeoutRef.current) {
      clearTimeout(vinDecodeTimeoutRef.current);
    }
    
    // Set new timeout for debouncing
    vinDecodeTimeoutRef.current = setTimeout(async () => {
      if (isProcessingRef.current) return;
      
      console.log("Starting VIN decode for:", vin);
      
      try {
        const vehicleInfo = await decodeVin(vin);
        if (vehicleInfo) {
          await populateVehicleFromVin(vehicleInfo);
        } else {
          toast({
            title: "VIN Not Found",
            description: "Could not decode the VIN. Please enter vehicle details manually.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error decoding VIN:", error);
        toast({
          title: "VIN Decode Error",
          description: "VIN decoding service is unavailable. Please enter vehicle details manually.",
          variant: "destructive",
        });
      }
    }, 1000);
    
    return () => {
      if (vinDecodeTimeoutRef.current) {
        clearTimeout(vinDecodeTimeoutRef.current);
      }
    };
  }, [vin, vinProcessing, populateVehicleFromVin, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (vinDecodeTimeoutRef.current) {
        clearTimeout(vinDecodeTimeoutRef.current);
      }
      isProcessingRef.current = false;
    };
  }, []);

  return {
    makes,
    models,
    years,
    loading: dataLoading,
    error,
    vinProcessing,
    decodedVehicleInfo,
    fetchModels
  };
};
