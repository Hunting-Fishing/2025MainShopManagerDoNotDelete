
import { useState, useEffect, useCallback, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { decodeVin as decodeVinUtil } from '@/utils/vehicleUtils';
import { useToast } from '@/hooks/use-toast';
import { VinDecodeResult } from '@/types/vehicle';
import { useVehicleData } from '@/hooks/useVehicleData';

interface UseVinDecoderProps {
  form: UseFormReturn<any>;
  vehicleIndex: number;
}

export function useVinDecoder({ form, vehicleIndex }: UseVinDecoderProps) {
  const { toast } = useToast();
  const { fetchModels } = useVehicleData();
  const [isDecoding, setIsDecoding] = useState(false);
  const [isDecodingSuccess, setIsDecodingSuccess] = useState(false);
  const [decodedVehicle, setDecodedVehicle] = useState<VinDecodeResult | null>(null);
  const [hasAttemptedDecode, setHasAttemptedDecode] = useState(false);
  
  const lastVin = useRef<string | null>(null);
  const lastSuccessToastId = useRef<string | null>(null);
  const decodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Create path helpers to make the code more readable
  const fieldPath = useCallback((field: string) => `vehicles.${vehicleIndex}.${field}`, [vehicleIndex]);
  
  // Current VIN value from the form
  const currentVin = form.watch(fieldPath('vin')) || '';
  
  // Reset success state when VIN changes
  useEffect(() => {
    if (currentVin !== lastVin.current && isDecodingSuccess) {
      setIsDecodingSuccess(false);
    }
  }, [currentVin, isDecodingSuccess]);
  
  // Function to fill form fields with decoded vehicle data
  const populateVehicleFields = useCallback(async (data: VinDecodeResult | null) => {
    if (!data) return;
    
    setDecodedVehicle(data);
    console.log('Populating form with vehicle data:', data);
    
    try {
      // First set the year - ensure it's a string
      if (data.year) {
        form.setValue(fieldPath('year'), String(data.year));
      }
      
      // Then set the make
      if (data.make) {
        form.setValue(fieldPath('make'), data.make);
        
        // Load models for this make
        await fetchModels(data.make);
        
        // Set model after a small delay to ensure models are loaded
        setTimeout(() => {
          if (data.model) {
            form.setValue(fieldPath('model'), data.model);
          }
          
          // Set additional fields
          if (data.transmission) form.setValue(fieldPath('transmission'), data.transmission);
          if (data.drive_type) form.setValue(fieldPath('drive_type'), data.drive_type);
          if (data.fuel_type) form.setValue(fieldPath('fuel_type'), data.fuel_type);
          if (data.body_style) form.setValue(fieldPath('body_style'), data.body_style);
          if (data.engine) form.setValue(fieldPath('engine'), data.engine);
          if (data.trim) form.setValue(fieldPath('trim'), data.trim);
          if (data.transmission_type) form.setValue(fieldPath('transmission_type'), data.transmission_type);
          if (data.gvwr) form.setValue(fieldPath('gvwr'), data.gvwr);
          if (data.country) form.setValue(fieldPath('country'), data.country);
          
          // Trigger form validation
          form.trigger([
            fieldPath('year'),
            fieldPath('make'),
            fieldPath('model')
          ]);
        }, 100);
      }
    } catch (err) {
      console.error('Error populating vehicle fields:', err);
    }
  }, [fieldPath, form, fetchModels]);
  
  // Handler to perform VIN decoding
  const decodeVinHandler = useCallback(async (vinNumber: string) => {
    if (!vinNumber || vinNumber.length < 17 || vinNumber === lastVin.current) {
      return false;
    }
    
    setIsDecoding(true);
    setHasAttemptedDecode(true);
    lastVin.current = vinNumber;
    
    try {
      const result = await decodeVinUtil(vinNumber);
      
      if (result) {
        await populateVehicleFields(result);
        setIsDecodingSuccess(true);
        
        // Clear previous success toast if it exists
        if (lastSuccessToastId.current) {
          // Directly call dismiss from the toast instance
          toast({
            id: lastSuccessToastId.current,
            open: false
          });
        }
        
        // Show success toast and store the ID for future reference
        const toastResult = toast({
          title: "VIN Decoded Successfully",
          description: `Vehicle identified as ${result.year} ${result.make} ${result.model}`,
          variant: "success",
          duration: 3000,
        });
        
        // Store the toast ID for potential future dismissal
        lastSuccessToastId.current = toastResult.id;
        
        return true;
      } else {
        setIsDecodingSuccess(false);
        toast({
          title: "VIN Not Found",
          description: "This VIN couldn't be found in our database. Please enter vehicle details manually.",
          variant: "warning",
        });
        return false;
      }
    } catch (err) {
      console.error('Error decoding VIN:', err);
      setIsDecodingSuccess(false);
      toast({
        title: "Error",
        description: "An error occurred while decoding the VIN. Please enter vehicle details manually.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDecoding(false);
    }
  }, [populateVehicleFields, toast]);
  
  // Debounced VIN decoding effect
  useEffect(() => {
    if (currentVin?.length === 17 && currentVin !== lastVin.current && !isDecoding) {
      // Clear any existing timeout
      if (decodeTimeoutRef.current) {
        clearTimeout(decodeTimeoutRef.current);
      }
      
      // Set new timeout for debouncing
      decodeTimeoutRef.current = setTimeout(() => {
        decodeVinHandler(currentVin);
      }, 500);
    }
    
    return () => {
      if (decodeTimeoutRef.current) {
        clearTimeout(decodeTimeoutRef.current);
      }
    };
  }, [currentVin, isDecoding, decodeVinHandler]);
  
  return {
    isDecoding,
    isDecodingSuccess,
    decodedVehicle,
    hasAttemptedDecode,
    decodeVin: decodeVinHandler,
  };
}
