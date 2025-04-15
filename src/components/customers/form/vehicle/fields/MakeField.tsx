
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpCircle, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BaseFieldProps } from "./BaseFieldTypes";

interface MakeFieldProps extends BaseFieldProps {
  onMakeChange?: (make: string) => void;
  isLoading?: boolean;
  makes: { make_id: string; make_display: string }[];
}

export const MakeField: React.FC<MakeFieldProps> = ({ 
  form, 
  index, 
  makes = [], 
  onMakeChange,
  isLoading = false 
}) => {
  // Get current make value from form
  const makeValue = form.watch(`vehicles.${index}.make`) || "";
  
  const handleMakeChange = (value: string) => {
    console.log(`Make selected: ${value}`);
    form.setValue(`vehicles.${index}.make`, value);
    
    if (onMakeChange) {
      onMakeChange(value);
    }
  };
  
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
            onValueChange={handleMakeChange}
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
              ) : makes.length > 0 ? (
                makes
                  .filter(make => make.make_id && make.make_display)
                  .sort((a, b) => a.make_display.localeCompare(b.make_display))
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
