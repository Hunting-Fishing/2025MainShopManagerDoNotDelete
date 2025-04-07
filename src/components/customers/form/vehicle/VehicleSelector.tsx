
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash, Loader2 } from "lucide-react";
import { CustomerFormValues } from "../CustomerFormSchema";
import { useVehicleData } from "@/hooks/useVehicleData";
import { VehicleMakeSelector } from "./VehicleMakeSelector";
import { VehicleModelSelector } from "./VehicleModelSelector";
import { VehicleAdditionalDetails } from "./VehicleAdditionalDetails";

interface VehicleSelectorProps {
  form: UseFormReturn<CustomerFormValues>;
  index: number;
  onRemove: (index: number) => void;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({ form, index, onRemove }) => {
  const { decodeVin } = useVehicleData();
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodedDetails, setDecodedDetails] = useState<any>(null);
  const vehicle = form.watch(`vehicles.${index}`);
  
  const handleVinUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const vin = e.target.value;
    if (vin.length === 17) {
      setIsDecoding(true);
      try {
        const decodedData = await decodeVin(vin);
        if (decodedData) {
          console.log("Decoded VIN data:", decodedData);
          form.setValue(`vehicles.${index}.make`, decodedData.make || '');
          form.setValue(`vehicles.${index}.model`, decodedData.model || '');
          form.setValue(`vehicles.${index}.year`, decodedData.year || '');
          
          // Store additional decoded details for display
          setDecodedDetails(decodedData);
          
          // Set additional fields in the form data
          if (decodedData.drive_type) form.setValue(`vehicles.${index}.drive_type`, decodedData.drive_type);
          if (decodedData.fuel_type) form.setValue(`vehicles.${index}.fuel_type`, decodedData.fuel_type);
          if (decodedData.transmission) form.setValue(`vehicles.${index}.transmission`, decodedData.transmission);
          if (decodedData.transmission_type) {
            console.log("Setting transmission_type:", decodedData.transmission_type);
            form.setValue(`vehicles.${index}.transmission_type`, decodedData.transmission_type);
          }
          if (decodedData.body_style) form.setValue(`vehicles.${index}.body_style`, decodedData.body_style);
          if (decodedData.country) form.setValue(`vehicles.${index}.country`, decodedData.country);
          if (decodedData.engine) form.setValue(`vehicles.${index}.engine`, decodedData.engine);
          if (decodedData.gvwr) form.setValue(`vehicles.${index}.gvwr`, decodedData.gvwr);
          
          // Trigger form validation after setting values
          form.trigger([
            `vehicles.${index}.make`,
            `vehicles.${index}.model`,
            `vehicles.${index}.year`
          ]);
        }
      } catch (error) {
        console.error("Error decoding VIN:", error);
      } finally {
        setIsDecoding(false);
      }
    }
  };

  return (
    <Card className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
        className="absolute top-2 right-2 text-destructive hover:text-destructive-foreground hover:bg-destructive"
      >
        <Trash className="h-4 w-4" />
      </Button>
      <CardContent className="pt-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name={`vehicles.${index}.year`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Year" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <VehicleMakeSelector form={form} index={index} />
          
          <VehicleModelSelector form={form} index={index} />
          
          <FormField
            control={form.control}
            name={`vehicles.${index}.vin`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>VIN {isDecoding && <Loader2 className="h-4 w-4 inline animate-spin ml-2" />}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Vehicle Identification Number" 
                    {...field} 
                    value={field.value || ''}
                    onChange={(e) => {
                      field.onChange(e);
                      handleVinUpdate(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name={`vehicles.${index}.license_plate`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Plate</FormLabel>
                <FormControl>
                  <Input placeholder="License Plate Number" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name={`vehicles.${index}.color`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Vehicle Color" 
                    {...field} 
                    value={field.value || ''}
                    onChange={(e) => {
                      field.onChange(e);
                      // Force a re-render of the additional details component
                      if (decodedDetails) {
                        setDecodedDetails({...decodedDetails});
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <VehicleAdditionalDetails 
          form={form} 
          index={index}
          decodedDetails={decodedDetails} 
        />
      </CardContent>
    </Card>
  );
};
