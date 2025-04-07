
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { VinDecodeResult } from "@/types/vehicle";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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

  // Check if any of the fields have values
  const hasAdditionalInfo = decodedFields.some(field => field.value);

  if (!hasAdditionalInfo) return null;

  return (
    <div className="col-span-full mt-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md">Additional Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
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
                        value={field.value}
                        placeholder={field.placeholder}
                        className="bg-gray-50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
