
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { VinDecodeResult } from "@/types/vehicle";

interface DecodedVehicleFieldsProps {
  form: any;
  decodedVehicle: VinDecodeResult | null;
}

export const DecodedVehicleFields: React.FC<DecodedVehicleFieldsProps> = ({ 
  form, 
  decodedVehicle 
}) => {
  // If no decoded vehicle data, don't render anything
  if (!decodedVehicle) return null;

  // Create an array of fields to conditionally render
  const decodedFields = [
    {
      name: "transmission",
      label: "Transmission",
      value: decodedVehicle.transmission,
      placeholder: "Transmission"
    },
    {
      name: "driveType",
      label: "Drive Type",
      value: decodedVehicle.drive_type,
      placeholder: "Drive Type"
    },
    {
      name: "fuelType",
      label: "Fuel Type",
      value: decodedVehicle.fuel_type,
      placeholder: "Fuel Type"
    },
    {
      name: "engine",
      label: "Engine",
      value: decodedVehicle.engine,
      placeholder: "Engine"
    },
    {
      name: "country",
      label: "Country of Origin",
      value: decodedVehicle.country,
      placeholder: "Country of Origin"
    }
  ];

  return (
    <>
      {decodedFields.map(field => {
        // Only render fields that have values
        if (!field.value) return null;
        
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input 
                    {...formField} 
                    readOnly
                    placeholder={field.placeholder}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      })}
    </>
  );
};
