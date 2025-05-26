
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
  const decodedMake = form.watch(`vehicles.${index}.decoded_make`);
  
  console.log('MakeField render - makes:', safeMakes);
  console.log('MakeField render - current form value:', form.getValues(`vehicles.${index}.make`));
  console.log('MakeField render - decoded make:', decodedMake);
  
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

            {/* Show decoded make information if available and no database entries */}
            {decodedMake && safeMakes.length === 0 && (
              <div className="mb-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Car className="h-3 w-3 mr-1" />
                  VIN Decoded: {decodedMake}
                </Badge>
              </div>
            )}

            {safeMakes.length > 0 ? (
              <Select
                value={field.value || ""}
                onValueChange={(value) => {
                  console.log("Make field value changed to:", value);
                  field.onChange(value);
                  if (onMakeChange) {
                    onMakeChange(value);
                  }
                }}
                disabled={field.disabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select make" />
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
                  placeholder={decodedMake ? `VIN decoded: ${decodedMake}` : "Enter vehicle make"}
                  value={field.value || decodedMake || ""}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    if (onMakeChange) {
                      onMakeChange(e.target.value);
                    }
                  }}
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
