
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BaseFieldProps } from "./BaseFieldTypes";
import { CarMake } from "@/types/vehicle";

interface MakeFieldProps extends BaseFieldProps {
  makes: CarMake[];
  onMakeChange?: (make: string) => void;
}

export const MakeField: React.FC<MakeFieldProps> = ({ form, index, makes = [], onMakeChange }) => {
  const makeValue = form.watch(`vehicles.${index}.make`);

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
              {makes.length > 0 ? (
                makes.map((make) => (
                  <SelectItem 
                    key={make.make_id} 
                    value={make.make_id}
                  >
                    {make.make_display}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>No makes available</SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
