
import React, { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { VinDecodeResult } from "@/types/vehicle";
import { toast } from "@/hooks/use-toast";
import { decodeVin } from "@/utils/vehicleUtils";
import { VehicleBodyStyle } from "@/types/vehicleBodyStyles";

interface VinDecoderFieldProps {
  form: any;
  onVehicleDecoded?: (vehicleData: VinDecodeResult) => void;
}

export const VinDecoderField: React.FC<VinDecoderFieldProps> = ({ form, onVehicleDecoded }) => {
  const [isDecoding, setIsDecoding] = useState(false);
  
  const handleVinDecode = async (vinNumber: string) => {
    if (vinNumber.length !== 17) return;
    
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
          const bodyStyle = decodedData.body_style.toLowerCase() as VehicleBodyStyle;
          form.setValue("bodyStyle", bodyStyle);
          console.log("Setting body style from VIN:", bodyStyle);
        }
        
        if (decodedData.country) form.setValue("country", decodedData.country);
        if (decodedData.engine) form.setValue("engine", decodedData.engine);
        
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
          title: "VIN Decode Failed",
          description: "Could not decode the provided VIN. Please check and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error decoding VIN:", error);
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
          <FormLabel>
            VIN {isDecoding && <Loader2 className="h-4 w-4 inline animate-spin ml-2" />}
          </FormLabel>
          <FormControl>
            <Input 
              {...field} 
              placeholder="Vehicle Identification Number"
              onChange={(e) => {
                field.onChange(e);
                if (e.target.value.length === 17) {
                  handleVinDecode(e.target.value);
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
