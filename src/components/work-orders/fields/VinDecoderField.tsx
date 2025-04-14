
import React, { useState, useRef } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { VinDecodeResult } from "@/types/vehicle";
import { toast } from "@/hooks/use-toast";
import { decodeVin, populateFormFromVin } from "@/utils/vehicleUtils";

interface VinDecoderFieldProps {
  form: any;
  onVehicleDecoded?: (vehicleData: VinDecodeResult) => void;
}

export const VinDecoderField: React.FC<VinDecoderFieldProps> = ({ form, onVehicleDecoded }) => {
  const [isDecoding, setIsDecoding] = useState(false);
  const [isDecoded, setIsDecoded] = useState(false);
  const [decodingFailed, setDecodingFailed] = useState(false);
  const processedVinRef = useRef<string>('');
  
  const handleVinDecode = async (vinNumber: string) => {
    // Skip if VIN is invalid, we're already decoding, or we've already processed this VIN
    if (vinNumber.length !== 17 || isDecoding || vinNumber === processedVinRef.current) return;
    
    setIsDecoding(true);
    setDecodingFailed(false);
    processedVinRef.current = vinNumber;
    
    try {
      console.log(`Starting VIN decode for ${vinNumber}`);
      const decodedData = await decodeVin(vinNumber);
      
      if (decodedData) {
        console.log("Decoded vehicle data:", decodedData);
        setIsDecoded(true);
        
        // Use centralized helper function to populate form fields
        const success = await populateFormFromVin(form, decodedData);
        
        if (success) {
          // Notify parent component
          if (onVehicleDecoded) {
            onVehicleDecoded(decodedData);
          }
          
          toast({
            title: "VIN Decoded Successfully",
            description: `Vehicle identified as ${decodedData.year} ${decodedData.make} ${decodedData.model}`,
            variant: "success",
          });
        } else {
          toast({
            title: "Warning",
            description: "VIN decoded but some data couldn't be filled in. Please check the form.",
            variant: "warning",
          });
        }
      } else {
        setDecodingFailed(true);
        toast({
          title: "VIN Not Found",
          description: "Could not decode the provided VIN. Please enter vehicle details manually.",
          variant: "warning",
        });
      }
    } catch (error) {
      console.error("Error decoding VIN:", error);
      setDecodingFailed(true);
      toast({
        title: "Error",
        description: "An error occurred while decoding the VIN.",
        variant: "destructive",
      });
    } finally {
      setIsDecoding(false);
    }
  };

  return (
    <FormField
      control={form.control}
      name="vin"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center">
            VIN 
            {isDecoding && <Loader2 className="h-4 w-4 inline animate-spin ml-2" />}
            {isDecoded && !decodingFailed && <CheckCircle className="h-4 w-4 inline text-green-500 ml-2" />}
            {decodingFailed && <AlertCircle className="h-4 w-4 inline text-amber-500 ml-2" />}
          </FormLabel>
          <FormControl>
            <Input 
              {...field} 
              placeholder="Vehicle Identification Number"
              className="font-mono"
              maxLength={17}
              onChange={(e) => {
                const vinValue = e.target.value.toUpperCase();
                field.onChange(vinValue);
                // Only attempt decode if full VIN is entered
                if (vinValue.length === 17 && vinValue !== processedVinRef.current) {
                  handleVinDecode(vinValue);
                }
              }}
            />
          </FormControl>
          <FormMessage />
          {isDecoded && !decodingFailed && (
            <div className="text-xs text-green-600 mt-1">
              VIN decoded successfully.
            </div>
          )}
          {decodingFailed && (
            <div className="text-xs text-amber-600 mt-1">
              Could not decode this VIN. Please enter vehicle details manually.
            </div>
          )}
        </FormItem>
      )}
    />
  );
};
