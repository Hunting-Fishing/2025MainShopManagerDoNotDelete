
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface DecodedVehicleInfo {
  year?: string;
  make?: string;
  model?: string;
  valid: boolean;
}

interface VinFieldProps {
  form: UseFormReturn<any>;
  index: number;
  processing?: boolean;
  decodedVehicleInfo?: DecodedVehicleInfo;
  decodingFailed?: boolean;
}

export const VinField: React.FC<VinFieldProps> = ({ 
  form, 
  index, 
  processing = false,
  decodedVehicleInfo,
  decodingFailed = false
}) => {
  const hasVehicleInfo = decodedVehicleInfo && decodedVehicleInfo.valid;

  return (
    <FormField
      control={form.control}
      name={`vehicles.${index}.vin`}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center">
            VIN
            {processing && <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />}
            {hasVehicleInfo && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
            {decodingFailed && <AlertCircle className="ml-2 h-4 w-4 text-amber-500" />}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              placeholder="Vehicle Identification Number"
              className="font-mono"
              maxLength={17}
              onChange={(e) => {
                // Convert to uppercase and pass to the form field
                const value = e.target.value.toUpperCase();
                field.onChange(value);
              }}
            />
          </FormControl>
          <FormMessage />
          {hasVehicleInfo && (
            <div className="text-xs text-green-600 mt-1">
              Identified as: {decodedVehicleInfo.year} {decodedVehicleInfo.make} {decodedVehicleInfo.model}
            </div>
          )}
          {decodingFailed && (
            <div className="text-xs text-amber-600 mt-1">
              VIN not recognized. Please enter vehicle details manually.
            </div>
          )}
        </FormItem>
      )}
    />
  );
};
