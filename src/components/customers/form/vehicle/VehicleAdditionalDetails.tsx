
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { VinDecodeResult } from "@/types/vehicle";
import { CustomerFormValues } from "../CustomerFormSchema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface VehicleAdditionalDetailsProps {
  form: UseFormReturn<CustomerFormValues>;
  index: number;
  decodedDetails: VinDecodeResult | null;
}

export const VehicleAdditionalDetails: React.FC<VehicleAdditionalDetailsProps> = ({ 
  form, 
  index,
  decodedDetails 
}) => {
  // If no decoded details, don't render anything
  if (!decodedDetails) return null;

  // Define the fields to display
  const additionalFields = [
    {
      name: `vehicles.${index}.transmission` as const,
      label: "Transmission",
      value: decodedDetails.transmission,
      placeholder: "Transmission"
    },
    {
      name: `vehicles.${index}.drive_type` as const,
      label: "Drive Type",
      value: decodedDetails.drive_type,
      placeholder: "Drive Type"
    },
    {
      name: `vehicles.${index}.fuel_type` as const,
      label: "Fuel Type",
      value: decodedDetails.fuel_type,
      placeholder: "Fuel Type"
    },
    {
      name: `vehicles.${index}.engine` as const,
      label: "Engine",
      value: decodedDetails.engine,
      placeholder: "Engine"
    },
    {
      name: `vehicles.${index}.country` as const,
      label: "Country of Origin",
      value: decodedDetails.country,
      placeholder: "Country of Origin"
    }
  ];

  // Check if any of the fields have values to display
  const hasAdditionalInfo = additionalFields.some(field => field.value);

  if (!hasAdditionalInfo) return null;

  return (
    <div className="mt-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md">Additional Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {additionalFields.map(field => {
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
                        value={field.value || formField.value || ''}
                        placeholder={field.placeholder}
                        className="bg-gray-50"
                        readOnly
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
