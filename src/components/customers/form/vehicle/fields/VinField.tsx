
import React, { useState, useCallback } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HelpCircle, AlertCircle, CheckCircle, RotateCcw, Search } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BaseFieldProps } from "./BaseFieldTypes";
import { VinDecodeResult } from "@/types/vehicle";

interface VinFieldProps extends BaseFieldProps {
  processing?: boolean;
  error?: string | null;
  canRetry?: boolean;
  onRetry?: () => void;
  decodedVehicleInfo?: VinDecodeResult | null;
  onVinDecode?: (vin: string) => void;
}

export const VinField: React.FC<VinFieldProps> = ({ 
  form, 
  index, 
  processing = false,
  error = null,
  canRetry = false,
  onRetry,
  decodedVehicleInfo,
  onVinDecode 
}) => {
  const [hasAttemptedDecode, setHasAttemptedDecode] = useState(false);

  const handleVinDecode = useCallback(async () => {
    const vin = form.getValues(`vehicles.${index}.vin`);
    if (vin && vin.length === 17 && onVinDecode) {
      setHasAttemptedDecode(true);
      await onVinDecode(vin);
    }
  }, [form, index, onVinDecode]);

  const getVinStatusIcon = () => {
    if (processing) {
      return <Search className="h-4 w-4 text-blue-500 animate-spin" />;
    }
    if (error) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    if (decodedVehicleInfo) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return null;
  };

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
                <TooltipContent side="right">
                  <p>17-character Vehicle Identification Number</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {getVinStatusIcon()}
          </div>
          
          <div className="flex gap-2">
            <FormControl>
              <Input
                {...field}
                placeholder="Enter 17-character VIN"
                maxLength={17}
                className="uppercase"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  field.onChange(value);
                  setHasAttemptedDecode(false);
                }}
              />
            </FormControl>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleVinDecode}
              disabled={!field.value || field.value.length !== 17 || processing}
              className="shrink-0"
            >
              {processing ? (
                <Search className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Decode
            </Button>
            
            {canRetry && onRetry && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="shrink-0"
              >
                <RotateCcw className="h-4 w-4" />
                Retry
              </Button>
            )}
          </div>

          {/* Display decoded vehicle information */}
          {decodedVehicleInfo && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm font-medium text-green-800">
                Vehicle Decoded: {decodedVehicleInfo.year} {decodedVehicleInfo.make} {decodedVehicleInfo.model}
              </p>
            </div>
          )}

          {/* Display error */}
          {error && hasAttemptedDecode && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
