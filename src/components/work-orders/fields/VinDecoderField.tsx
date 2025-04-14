
import React, { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { VinDecodeResult } from "@/types/vehicle";
import { toast } from "@/hooks/use-toast";
import { decodeVin } from "@/utils/vehicleUtils";
import { VehicleBodyStyle } from "@/types/vehicle";

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
      console.log(`Starting VIN decode for ${vinNumber}`);
      const decodedData = await decodeVin(vinNumber);
      
      if (decodedData) {
        console.log("Decoded vehicle data:", decodedData);
        
        // Update form fields with decoded vehicle information
        form.setValue("vehicleMake", decodedData.make || '');
        form.setValue("vehicleModel", decodedData.model || '');
        form.setValue("vehicleYear", decodedData.year || '');
        
        // Add additional vehicle details to the form
        if (decodedData.drive_type) {
          form.setValue("driveType", decodedData.drive_type);
          console.log("Setting drive type:", decodedData.drive_type);
        }
        
        if (decodedData.fuel_type) {
          form.setValue("fuelType", decodedData.fuel_type);
          console.log("Setting fuel type:", decodedData.fuel_type);
        }
        
        if (decodedData.transmission) {
          form.setValue("transmission", decodedData.transmission);
          console.log("Setting transmission:", decodedData.transmission);
        }
        
        if (decodedData.transmission_type) {
          form.setValue("transmissionType", decodedData.transmission_type);
          console.log("Setting transmission type:", decodedData.transmission_type);
        }
        
        // Update the body style if available
        if (decodedData.body_style) {
          const bodyStyle = decodedData.body_style.toLowerCase() as VehicleBodyStyle;
          form.setValue("bodyStyle", bodyStyle);
          console.log("Setting body style from VIN:", bodyStyle);
        }
        
        if (decodedData.country) {
          form.setValue("country", decodedData.country);
          console.log("Setting country:", decodedData.country);
        }
        
        if (decodedData.engine) {
          form.setValue("engine", decodedData.engine);
          console.log("Setting engine:", decodedData.engine);
        }
        
        if (decodedData.gvwr) {
          form.setValue("gvwr", decodedData.gvwr);
          console.log("Setting GVWR:", decodedData.gvwr);
        }
        
        if (decodedData.trim) {
          form.setValue("trim", decodedData.trim);
          console.log("Setting trim:", decodedData.trim);
        }
        
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
                const vinValue = e.target.value.toUpperCase();
                field.onChange(vinValue);
                if (vinValue.length === 17) {
                  handleVinDecode(vinValue);
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
