
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { BaseFieldProps } from "./BaseFieldTypes";

export const VinField: React.FC<BaseFieldProps & { 
  isDecoding: boolean;
  isDecodingSuccess: boolean;
  decodedVehicleInfo?: {
    year?: string | number;
    make?: string;
    model?: string;
  } | null;
  hasAttemptedDecode?: boolean;
}> = ({ 
  form, 
  index, 
  isDecoding = false, 
  isDecodingSuccess = false, 
  decodedVehicleInfo, 
  hasAttemptedDecode = false
}) => {
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
                className="font-mono pr-10"
                maxLength={17}
                disabled={isDecoding}
                onChange={(e) => {
                  // Convert to uppercase as user types
                  field.onChange(e.target.value.toUpperCase());
                }}
              />
            </FormControl>
            
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
              {isDecoding && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
              
              {!isDecoding && hasAttemptedDecode && (
                isDecodingSuccess ? 
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                  <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
            </div>
          </div>
          
          {decodedVehicleInfo && isDecodingSuccess && (
            <div className="mt-2 text-sm">
              <div className="flex flex-wrap gap-2">
                {decodedVehicleInfo.year && (
                  <Badge variant="outline" className="bg-muted/50">
                    {decodedVehicleInfo.year}
                  </Badge>
                )}
                {decodedVehicleInfo.make && (
                  <Badge variant="outline" className="bg-muted/50">
                    {decodedVehicleInfo.make}
                  </Badge>
                )}
                {decodedVehicleInfo.model && (
                  <Badge variant="outline" className="bg-muted/50">
                    {decodedVehicleInfo.model}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Single FormDescription instead of duplicate */}
          <FormDescription>
            Enter a complete 17-digit VIN to auto-populate vehicle details
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
