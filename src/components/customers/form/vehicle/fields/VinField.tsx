
import React, { useState, useCallback } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HelpCircle, AlertCircle, CheckCircle, RotateCcw, Search, Loader2, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BaseFieldProps } from "./BaseFieldTypes";
import { VinDecodeResult } from "@/types/vehicle";

interface VinFieldProps extends BaseFieldProps {
  processing?: boolean;
  error?: string | null;
  canRetry?: boolean;
  hasAttempted?: boolean;
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
  hasAttempted = false,
  onRetry,
  decodedVehicleInfo,
  onVinDecode 
}) => {
  const [localError, setLocalError] = useState<string | null>(null);

  const handleVinDecode = useCallback(async () => {
    const vin = form.getValues(`vehicles.${index}.vin`);
    if (vin && vin.length === 17 && onVinDecode) {
      setLocalError(null);
      await onVinDecode(vin);
    }
  }, [form, index, onVinDecode]);

  const handleVinChange = useCallback((value: string) => {
    const upperValue = value.toUpperCase();
    form.setValue(`vehicles.${index}.vin`, upperValue);
    setLocalError(null);
    
    // Basic validation
    if (upperValue.length > 0 && upperValue.length < 17) {
      setLocalError(`VIN must be 17 characters (current: ${upperValue.length})`);
    } else if (upperValue.length === 17) {
      // Check for invalid characters
      const invalidChars = /[IOQ]/i;
      if (invalidChars.test(upperValue)) {
        setLocalError('VIN contains invalid characters (I, O, Q are not allowed)');
      }
    }
  }, [form, index]);

  const getVinStatusIcon = () => {
    if (processing) {
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    }
    if (error || localError) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    if (decodedVehicleInfo) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return null;
  };

  const currentVin = form.watch(`vehicles.${index}.vin`) || '';
  const isValidLength = currentVin.length === 17;
  const hasLocalError = localError !== null;
  const hasRemoteError = error !== null && hasAttempted;

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
                  <div className="text-sm">
                    <p>17-character Vehicle Identification Number</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Letters I, O, Q are not allowed in VINs
                    </p>
                  </div>
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
                className={`uppercase font-mono ${hasLocalError || hasRemoteError ? 'border-red-500' : ''}`}
                onChange={(e) => {
                  handleVinChange(e.target.value);
                  field.onChange(e.target.value.toUpperCase());
                }}
              />
            </FormControl>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleVinDecode}
              disabled={!isValidLength || processing || hasLocalError}
              className="shrink-0"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {processing ? 'Decoding...' : 'Decode'}
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

          {/* Character count indicator */}
          {currentVin.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {currentVin.length}/17 characters
            </div>
          )}

          {/* Local validation error */}
          {hasLocalError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{localError}</AlertDescription>
            </Alert>
          )}

          {/* Display decoded vehicle information */}
          {decodedVehicleInfo && !hasLocalError && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Vehicle Decoded:</strong> {decodedVehicleInfo.year} {decodedVehicleInfo.make} {decodedVehicleInfo.model}
                {decodedVehicleInfo.country && (
                  <span className="block text-sm text-green-600 mt-1">
                    Country: {decodedVehicleInfo.country}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Display remote error */}
          {hasRemoteError && !hasLocalError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                {canRetry && (
                  <span className="block text-sm mt-1">
                    Click "Retry" to attempt VIN decoding again.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
