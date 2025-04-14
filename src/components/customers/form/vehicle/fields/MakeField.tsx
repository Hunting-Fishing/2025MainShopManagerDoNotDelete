
import React, { useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpCircle, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BaseFieldProps } from "./BaseFieldTypes";
import { CarMake } from "@/types/vehicle";

interface MakeFieldProps extends BaseFieldProps {
  makes: CarMake[];
  onMakeChange?: (make: string) => void;
  isLoading?: boolean;
}

export const MakeField: React.FC<MakeFieldProps> = ({ 
  form, 
  index, 
  makes = [], 
  onMakeChange,
  isLoading = false 
}) => {
  // Ensure makes is valid array
  const safeMakes = Array.isArray(makes) ? makes : [];
  
  // Extract current make value from form - force to string for proper comparison
  const makeValue = String(form.watch(`vehicles.${index}.make`) || "");
  
  // Effect to normalize make value if it doesn't match exactly what's in the database
  useEffect(() => {
    if (makeValue && safeMakes.length > 0) {
      // Check if the current value exists in the makes list
      const exactMatch = safeMakes.find(make => make.make_id === makeValue);
      
      // If no exact match but we have a value, try to find case-insensitive match
      if (!exactMatch && makeValue) {
        const caseInsensitiveMatch = safeMakes.find(
          make => make.make_id.toLowerCase() === makeValue.toLowerCase() ||
                 make.make_display.toLowerCase() === makeValue.toLowerCase()
        );
        
        // If found a match with different casing, update the form value
        if (caseInsensitiveMatch) {
          console.log(`Found case-insensitive match for "${makeValue}": "${caseInsensitiveMatch.make_id}"`);
          form.setValue(`vehicles.${index}.make`, caseInsensitiveMatch.make_id);
          
          if (onMakeChange) {
            onMakeChange(caseInsensitiveMatch.make_id);
          }
        }
      }
    }
  }, [makeValue, safeMakes, form, index, onMakeChange]);
  
  return (
    <FormField
      control={form.control}
      name={`vehicles.${index}.make`}
      render={({ field }) => (
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
          <Select
            value={field.value || ""}
            onValueChange={(value) => {
              field.onChange(value);
              console.log(`Updating make field to: ${value}`);
              if (onMakeChange) {
                onMakeChange(value);
              }
            }}
            disabled={field.disabled || isLoading}
          >
            <FormControl>
              <SelectTrigger>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Loading makes...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Select make" />
                )}
              </SelectTrigger>
            </FormControl>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              {isLoading ? (
                <SelectItem value="loading" disabled>Loading makes...</SelectItem>
              ) : safeMakes.length > 0 ? (
                safeMakes
                  .filter(make => make.make_id && make.make_display) // Filter out invalid makes
                  .map((make) => (
                    <SelectItem key={make.make_id} value={make.make_id}>
                      {make.make_display}
                    </SelectItem>
                  ))
              ) : (
                <SelectItem value="no-makes" disabled>No makes available</SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
