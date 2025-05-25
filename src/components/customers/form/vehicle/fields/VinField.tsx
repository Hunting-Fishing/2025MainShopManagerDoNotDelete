
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { BaseFieldProps } from "./BaseFieldTypes";

export const VinField: React.FC<BaseFieldProps & { 
  processing?: boolean;
  decodedVehicleInfo?: {
    year?: string | number;
    make?: string;
    model?: string;
    valid?: boolean;
  };
}> = ({ form, index, processing = false, decodedVehicleInfo }) => {
  const vinValue = form.watch(`vehicles.${index}.vin`);
  const makeValue = form.watch(`vehicles.${index}.make`);
  const modelValue = form.watch(`vehicles.${index}.model`);
  const yearValue = form.watch(`vehicles.${index}.year`);
  
  const showDecodedInfo = decodedVehicleInfo && (makeValue || modelValue || yearValue);
  
  return (
    <FormField
      control={form.control}
      name={`vehicles.${index}.vin`}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormLabel>VIN</FormLabel>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-sm">
                  <p>Vehicle Identification Number - A 17-character unique identifier for the vehicle. Enter a complete VIN to auto-populate vehicle details.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <FormControl>
              <Input 
                {...field} 
                placeholder="Enter 17-digit VIN to auto-populate" 
                className="font-mono pr-8"
                maxLength={17}
                disabled={processing}
                onChange={(e) => {
                  // Convert to uppercase as user types
                  field.onChange(e.target.value.toUpperCase());
                }}
              />
            </FormControl>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
              {processing && (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              )}
              {!processing && vinValue?.length === 17 && showDecodedInfo && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
              {!processing && vinValue?.length === 17 && !showDecodedInfo && (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
            </div>
          </div>
          
          {showDecodedInfo && (
            <div className="mt-2 text-sm">
              <div className="flex flex-wrap gap-1">
                {yearValue && (
                  <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                    {yearValue}
                  </Badge>
                )}
                {makeValue && (
                  <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                    {makeValue}
                  </Badge>
                )}
                {modelValue && (
                  <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                    {modelValue}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <FormDescription>
            {processing ? "Decoding VIN..." : "Enter a complete 17-digit VIN to auto-populate vehicle details"}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
