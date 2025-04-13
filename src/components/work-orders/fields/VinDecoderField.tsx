
import React, { useState, useRef } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2 } from "lucide-react";
import { VinDecodeResult } from "@/types/vehicle";
import { useToast } from "@/hooks/use-toast";
import { decodeVin } from "@/utils/vehicleUtils";

interface VinDecoderFieldProps {
  form: any;
  onVehicleDecoded?: (vehicleData: VinDecodeResult) => void;
}

export const VinDecoderField: React.FC<VinDecoderFieldProps> = ({ form, onVehicleDecoded }) => {
  const [isDecoding, setIsDecoding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const lastVin = useRef<string | null>(null);
  const { toast } = useToast();
  
  const handleVinDecode = async (vinNumber: string) => {
    if (vinNumber.length !== 17 || vinNumber === lastVin.current) return;
    lastVin.current = vinNumber;
    
    setIsDecoding(true);
    try {
      const decodedData = await decodeVin(vinNumber);
      if (decodedData) {
        // Update form fields with decoded vehicle information
        form.setValue("vehicleMake", decodedData.make || '');
        form.setValue("vehicleModel", decodedData.model || '');
        form.setValue("vehicleYear", decodedData.year || '');
        
        // Add additional vehicle details to the form
        if (decodedData.drive_type) form.setValue("driveType", decodedData.drive_type);
        if (decodedData.fuel_type) form.setValue("fuelType", decodedData.fuel_type);
        if (decodedData.transmission) form.setValue("transmission", decodedData.transmission);
        
        // Update the body style if available
        if (decodedData.body_style) {
          form.setValue("bodyStyle", decodedData.body_style);
          console.log("Setting body style from VIN:", decodedData.body_style);
        }
        
        if (decodedData.country) form.setValue("country", decodedData.country);
        if (decodedData.engine) form.setValue("engine", decodedData.engine);
        
        // Notify parent component
        if (onVehicleDecoded) {
          onVehicleDecoded(decodedData);
        }
        
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
        
        toast({
          title: "VIN Decoded Successfully",
          description: `Vehicle identified as ${decodedData.year} ${decodedData.make} ${decodedData.model}`,
          variant: "success",
        });
      } else {
        toast({
          title: "VIN Decode Failed",
          description: "Could not decode the provided VIN. Please check and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error decoding VIN:", error);
      toast({
        title: "Error",
        description: "An error occurred while decoding the VIN. Please enter vehicle details manually.",
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
          <FormLabel className="flex items-center gap-2">
            VIN 
            {isDecoding && <Loader2 className="h-4 w-4 inline animate-spin ml-2" />}
            {isSuccess && !isDecoding && <CheckCircle2 className="h-4 w-4 text-green-500 ml-2" />}
          </FormLabel>
          <FormControl>
            <Input 
              {...field} 
              placeholder="Vehicle Identification Number"
              className="font-mono"
              maxLength={17}
              disabled={isDecoding}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                field.onChange(value);
                if (value.length === 17) {
                  // Use setTimeout to let the input update first
                  setTimeout(() => handleVinDecode(value), 100);
                }
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
