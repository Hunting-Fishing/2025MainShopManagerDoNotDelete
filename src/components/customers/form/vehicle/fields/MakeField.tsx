
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { HelpCircle, Car } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { BaseFieldProps } from "./BaseFieldTypes";
import { CarMake } from "@/types/vehicle";

interface MakeFieldProps extends BaseFieldProps {
  makes: CarMake[];
  onMakeChange?: (make: string) => void;
}

export const MakeField: React.FC<MakeFieldProps> = ({ form, index, makes = [], onMakeChange }) => {
  // Ensure makes is valid array
  const safeMakes = Array.isArray(makes) ? makes : [];
  
  // Get the current form values safely
  const currentValues = form.getValues();
  const vehicleData = currentValues.vehicles?.[index];
  const decodedMake = vehicleData?.decoded_make;
  const currentMakeValue = form.watch(`vehicles.${index}.make`);
  
  console.log('MakeField render - makes:', safeMakes);
  console.log('MakeField render - current form value:', currentMakeValue);
  console.log('MakeField render - decoded make:', decodedMake);
  
  // Check if current value is a VIN decoded value (not in our makes list)
  const isVinDecodedValue = currentMakeValue && !safeMakes.find(make => make.make_id === currentMakeValue);
  
  return (
    <FormField
      control={form.control}
      name={`vehicles.${index}.make`}
      render={({ field }) => {
        console.log('MakeField field value:', field.value);
        
        return (
          <FormItem>
            <div className="flex items-center gap-2">
              <FormLabel>Make</FormLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Vehicle manufacturer (e.g., Toyota, Ford)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Show decoded make information if available */}
            {isVinDecodedValue && (
              <div className="mb-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Car className="h-3 w-3 mr-1" />
                  VIN Decoded: {field.value}
                </Badge>
              </div>
            )}

            {safeMakes.length > 0 ? (
              <Select
                value={!isVinDecodedValue ? field.value || "" : ""}
                onValueChange={(value) => {
                  console.log("Make field value changed to:", value);
                  field.onChange(value);
                  // Clear decoded make when manually selecting
                  form.setValue(`vehicles.${index}.decoded_make`, '');
                  if (onMakeChange) {
                    onMakeChange(value);
                  }
                }}
                disabled={field.disabled}
              >
                <FormControl>
                  <SelectTrigger className={isVinDecodedValue ? "border-green-200 bg-green-50" : ""}>
                    <SelectValue placeholder={isVinDecodedValue ? `VIN: ${field.value}` : "Select make"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {safeMakes
                    .filter(make => make.make_id && make.make_display) // Filter out invalid makes
                    .map((make) => (
                      <SelectItem key={make.make_id} value={make.make_id}>
                        {make.make_display}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            ) : (
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Enter vehicle make"
                  value={field.value || ""}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    // Clear decoded make when manually entering
                    form.setValue(`vehicles.${index}.decoded_make`, '');
                    if (onMakeChange) {
                      onMakeChange(e.target.value);
                    }
                  }}
                  className={isVinDecodedValue ? "border-green-200 bg-green-50" : ""}
                />
              </FormControl>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
