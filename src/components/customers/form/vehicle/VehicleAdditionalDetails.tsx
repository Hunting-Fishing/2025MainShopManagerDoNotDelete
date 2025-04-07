
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

  // Get the color value from the form
  const color = form.watch(`vehicles.${index}.color`);

  console.log("Rendering VehicleAdditionalDetails with:", { 
    decodedDetails, 
    color,
    transmissionType: decodedDetails.transmission_type || "",
    transmission: decodedDetails.transmission || ""
  });

  // Define the fields to display - remove the duplicate transmission fields
  const additionalFields = [
    {
      name: `vehicles.${index}.transmission` as const,
      label: "Transmission",
      value: decodedDetails.transmission || "",
      placeholder: "Transmission"
    },
    // Only show transmission_type if it's different from transmission
    ...(decodedDetails.transmission_type && 
      decodedDetails.transmission_type !== decodedDetails.transmission ? 
      [{
        name: `vehicles.${index}.transmission_type` as const,
        label: "Transmission Type",
        value: decodedDetails.transmission_type || "",
        placeholder: "Transmission Type"
      }] : []),
    {
      name: `vehicles.${index}.drive_type` as const,
      label: "Drive Type",
      value: decodedDetails.drive_type || "",
      placeholder: "Drive Type"
    },
    {
      name: `vehicles.${index}.fuel_type` as const,
      label: "Fuel Type",
      value: decodedDetails.fuel_type || "",
      placeholder: "Fuel Type"
    },
    {
      name: `vehicles.${index}.engine` as const,
      label: "Engine",
      value: decodedDetails.engine || "",
      placeholder: "Engine"
    },
    {
      name: `vehicles.${index}.gvwr` as const,
      label: "GVWR",
      value: decodedDetails.gvwr || "",
      placeholder: "Gross Vehicle Weight Rating"
    },
    {
      name: `vehicles.${index}.body_style` as const,
      label: "Body Style",
      value: decodedDetails.body_style || "",
      placeholder: "Body Style"
    },
    {
      name: `vehicles.${index}.country` as const,
      label: "Country of Origin",
      value: decodedDetails.country || "",
      placeholder: "Country of Origin"
    },
    {
      name: `vehicles.${index}.color` as const,
      label: "Vehicle Color",
      value: color || "",
      placeholder: "Vehicle Color"
    }
  ];

  // Show all fields with values or fields that can be edited (like color)
  const fieldsToShow = additionalFields.filter(field => 
    field.value || field.name === `vehicles.${index}.color`
  );

  if (fieldsToShow.length === 0) return null;

  return (
    <div className="mt-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md">Additional Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {fieldsToShow.map(field => (
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
