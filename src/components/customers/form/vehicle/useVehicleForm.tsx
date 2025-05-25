
import { useState, useEffect, useCallback, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { CustomerFormValues } from "../CustomerFormSchema";
import { useVehicleData } from "@/hooks/useVehicleData";
import { useVinDecoder } from "./hooks/useVinDecoder";
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
    error: dataError,
    fetchModels
  } = useVehicleData();

  const {
    isProcessing: vinProcessing,
    error: vinError,
    canRetry,
    decode: decodeVin,
    retry: retryVinDecode,
    clearState: clearVinState
  } = useVinDecoder();

  const [decodedVehicleInfo, setDecodedVehicleInfo] = useState<VinDecodeResult | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  const lastProcessedVinRef = useRef<string>('');
  
  const selectedMake = form.watch(`vehicles.${index}.make`);
  const vin = form.watch(`vehicles.${index}.vin`);

  // Fetch models when make changes
  useEffect(() => {
    if (selectedMake && makes.length > 0) {
      fetchModels(selectedMake);
    }
  }, [selectedMake, fetchModels, makes.length]);

  // Find matching make by name or display name
  const findMakeByName = useCallback((makeName: string) => {
    if (!makeName || !makes.length) return null;
    
    const normalizedMakeName = makeName.toLowerCase().trim();
    
    // First try exact match with make_id
    let matchingMake = makes.find(make => 
      make.make_id.toLowerCase() === normalizedMakeName
    );
    
    // Then try exact match with display name
    if (!matchingMake) {
      matchingMake = makes.find(make => 
        make.make_display.toLowerCase() === normalizedMakeName
      );
    }
    
    // Finally try partial match
    if (!matchingMake) {
      matchingMake = makes.find(make => 
        make.make_display.toLowerCase().includes(normalizedMakeName) ||
        make.make_id.toLowerCase().includes(normalizedMakeName)
      );
    }
    
    return matchingMake;
  }, [makes]);

  const populateVehicleFromVin = useCallback(async (vehicleInfo: VinDecodeResult) => {
    if (!vehicleInfo || isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    setDecodedVehicleInfo(vehicleInfo);
    
    console.log("Populating vehicle from VIN:", vehicleInfo);
    
    try {
      // Set year first
      if (vehicleInfo.year) {
        form.setValue(`vehicles.${index}.year`, String(vehicleInfo.year));
      }
      
      // Find and set make
      if (vehicleInfo.make) {
        const matchingMake = findMakeByName(vehicleInfo.make);
        
        if (matchingMake) {
          console.log("Found matching make:", matchingMake);
          form.setValue(`vehicles.${index}.make`, matchingMake.make_id);
          
          // Fetch models for this make
          await fetchModels(matchingMake.make_id);
          
          // Wait a bit for models to load, then set model
          setTimeout(() => {
            if (vehicleInfo.model) {
              // Try to find matching model
              const currentModels = models;
              const normalizedModelName = vehicleInfo.model.toLowerCase().trim();
              
              const matchingModel = currentModels.find(model =>
                model.model_name.toLowerCase() === normalizedModelName ||
                model.model_name.toLowerCase().includes(normalizedModelName)
              );
              
              if (matchingModel) {
                console.log("Found matching model:", matchingModel);
                form.setValue(`vehicles.${index}.model`, matchingModel.model_name);
              } else {
                console.log("No matching model found for:", vehicleInfo.model);
                // Set the model name anyway, even if not in our database
                form.setValue(`vehicles.${index}.model`, vehicleInfo.model);
              }
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
            
            isProcessingRef.current = false;
          }, 1000); // Increased timeout to ensure models are loaded
        } else {
          console.log("No matching make found for:", vehicleInfo.make);
          // Set the make name anyway, even if not in our database
          form.setValue(`vehicles.${index}.make`, vehicleInfo.make);
          isProcessingRef.current = false;
        }
      } else {
        isProcessingRef.current = false;
      }
    } catch (err) {
      console.error("Error populating vehicle form:", err);
      isProcessingRef.current = false;
    }
  }, [form, index, fetchModels, findMakeByName, models]);

  // Handle VIN input changes with debouncing and duplicate prevention
  useEffect(() => {
    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Clear previous state when VIN changes or is invalid
    if (vin?.length !== 17) {
      clearVinState();
      setDecodedVehicleInfo(null);
      lastProcessedVinRef.current = '';
      return;
    }

    // Skip if this VIN was already processed
    if (vin === lastProcessedVinRef.current) {
      return;
    }

    // Skip if already processing or VIN decoder is busy
    if (vinProcessing || isProcessingRef.current) {
      return;
    }

    // Debounce VIN decoding
    debounceTimeoutRef.current = setTimeout(() => {
      if (vin?.length === 17 && vin !== lastProcessedVinRef.current && !vinProcessing && !isProcessingRef.current) {
        console.log("Starting VIN decode for:", vin);
        lastProcessedVinRef.current = vin;
        decodeVin(vin, populateVehicleFromVin);
      }
    }, 1000);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [vin, vinProcessing, decodeVin, populateVehicleFromVin, clearVinState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      isProcessingRef.current = false;
      lastProcessedVinRef.current = '';
      clearVinState();
    };
  }, [clearVinState]);

  const handleVinRetry = useCallback(() => {
    if (vin?.length === 17) {
      console.log("Retrying VIN decode for:", vin);
      lastProcessedVinRef.current = ''; // Reset to allow retry
      retryVinDecode(vin, populateVehicleFromVin);
    }
  }, [vin, retryVinDecode, populateVehicleFromVin]);

  return {
    makes,
    models,
    years,
    loading: dataLoading,
    error: dataError,
    vinProcessing,
    vinError,
    canRetry,
    decodedVehicleInfo,
    fetchModels,
    onVinRetry: handleVinRetry
  };
};
