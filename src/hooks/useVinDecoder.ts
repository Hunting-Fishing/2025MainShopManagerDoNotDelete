
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
  const toastIdRef = useRef<string | null>(null);
  const decodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const fieldPath = useCallback((field: string) => `vehicles.${vehicleIndex}.${field}`, [vehicleIndex]);
  
  const currentVin = form.watch(fieldPath('vin')) || '';
  
  useEffect(() => {
    if (currentVin !== lastVin.current && isDecodingSuccess) {
      setIsDecodingSuccess(false);
    }
  }, [currentVin, isDecodingSuccess]);
  
  const populateVehicleFields = useCallback(async (data: VinDecodeResult | null) => {
    if (!data) return;
    
    setDecodedVehicle(data);
    console.log('Populating form with vehicle data:', data);
    
    try {
      if (data.year) {
        form.setValue(fieldPath('year'), String(data.year));
      }
      
      if (data.make) {
        form.setValue(fieldPath('make'), data.make);
        
        await fetchModels(data.make);
        
        setTimeout(() => {
          if (data.model) {
            form.setValue(fieldPath('model'), data.model);
          }
          
          if (data.transmission) form.setValue(fieldPath('transmission'), data.transmission);
          if (data.drive_type) form.setValue(fieldPath('drive_type'), data.drive_type);
          if (data.fuel_type) form.setValue(fieldPath('fuel_type'), data.fuel_type);
          if (data.body_style) form.setValue(fieldPath('body_style'), data.body_style);
          if (data.engine) form.setValue(fieldPath('engine'), data.engine);
          if (data.trim) form.setValue(fieldPath('trim'), data.trim);
          if (data.transmission_type) form.setValue(fieldPath('transmission_type'), data.transmission_type);
          if (data.gvwr) form.setValue(fieldPath('gvwr'), data.gvwr);
          if (data.country) form.setValue(fieldPath('country'), data.country);
          
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
  
  const decodeVinHandler = useCallback(async (vinNumber: string) => {
    if (!vinNumber || vinNumber.length < 17 || vinNumber === lastVin.current) {
      return false;
    }
    
    setIsDecoding(true);
    setHasAttemptedDecode(true);
    lastVin.current = vinNumber;
    
    try {
      console.log('Decoding VIN:', vinNumber);
      const result = await decodeVinUtil(vinNumber);
      
      if (result) {
        await populateVehicleFields(result);
        setIsDecodingSuccess(true);
        
        // If we had a previous toast, dismiss it
        if (toastIdRef.current) {
          // FIXED: Correctly access the dismiss method from the useToast hook
          const { dismiss } = useToast();
          if (dismiss) {
            dismiss(toastIdRef.current);
          }
        }
        
        // Show new toast
        const toastResponse = toast({
          title: "VIN Decoded Successfully",
          description: `Vehicle identified as ${result.year} ${result.make} ${result.model}`,
          variant: "success",
          duration: 3000,
        });
        
        // Store the toast id for future reference
        toastIdRef.current = toastResponse.id;
        
        return true;
      } else {
        setIsDecodingSuccess(false);
        toast({
          title: "VIN Not Found",
          description: "This VIN couldn't be found. Please enter vehicle details manually.",
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
  
  useEffect(() => {
    if (currentVin?.length === 17 && currentVin !== lastVin.current && !isDecoding) {
      if (decodeTimeoutRef.current) {
        clearTimeout(decodeTimeoutRef.current);
      }
      
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
