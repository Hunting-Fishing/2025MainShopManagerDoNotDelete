
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
    year?: string;
    make?: string;
    model?: string;
    valid: boolean;
  };
  isDecodingSuccess?: boolean;
}> = ({ form, index, processing = false, decodedVehicleInfo, isDecodingSuccess = false }) => {
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
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {!processing && decodedVehicleInfo && (
                decodedVehicleInfo.valid ? 
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                  <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
            </div>
          </div>
          
          {decodedVehicleInfo && decodedVehicleInfo.valid && decodedVehicleInfo.make && decodedVehicleInfo.model && (
            <div className="mt-2 text-sm">
              <Badge variant="outline" className="bg-muted/50 mr-2">
                {decodedVehicleInfo.year || ''}
              </Badge>
              <Badge variant="outline" className="bg-muted/50 mr-2">
                {decodedVehicleInfo.make || ''}
              </Badge>
              <Badge variant="outline" className="bg-muted/50">
                {decodedVehicleInfo.model || ''}
              </Badge>
            </div>
          )}
          
          <FormDescription>
            Enter a complete 17-digit VIN to auto-populate vehicle details
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
