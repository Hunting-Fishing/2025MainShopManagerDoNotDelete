
import React, { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle, 
  Car,
  ChevronDown,
  ChevronUp
} from "lucide-react";
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
  decodedVehicleInfo = null,
  onVinDecode
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleVinChange = (value: string) => {
    const upperValue = value.toUpperCase();
    form.setValue(`vehicles.${index}.vin`, upperValue);
    
    // Automatically decode when VIN is 17 characters
    if (upperValue.length === 17 && onVinDecode) {
      onVinDecode(upperValue);
    }
  };

  return (
    <div className="space-y-3">
      <FormField
        control={form.control}
        name={`vehicles.${index}.vin`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              VIN
              {processing && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
              {decodedVehicleInfo && !processing && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Enter 17-character VIN"
                maxLength={17}
                onChange={(e) => handleVinChange(e.target.value)}
                className={`font-mono ${
                  decodedVehicleInfo ? 'border-green-300 bg-green-50' : ''
                } ${error ? 'border-red-300 bg-red-50' : ''}`}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            {canRetry && onRetry && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="ml-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Display with Vehicle Info */}
      {decodedVehicleInfo && !error && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                VIN Decoded Successfully
              </span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {decodedVehicleInfo.year} {decodedVehicleInfo.make} {decodedVehicleInfo.model}
              </Badge>
            </div>
            
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {decodedVehicleInfo.body_style && (
                    <div>
                      <span className="font-medium">Body Style:</span> {decodedVehicleInfo.body_style}
                    </div>
                  )}
                  {decodedVehicleInfo.drive_type && (
                    <div>
                      <span className="font-medium">Drive Type:</span> {decodedVehicleInfo.drive_type}
                    </div>
                  )}
                  {decodedVehicleInfo.fuel_type && (
                    <div>
                      <span className="font-medium">Fuel Type:</span> {decodedVehicleInfo.fuel_type}
                    </div>
                  )}
                  {decodedVehicleInfo.transmission && (
                    <div>
                      <span className="font-medium">Transmission:</span> {decodedVehicleInfo.transmission}
                    </div>
                  )}
                  {decodedVehicleInfo.engine && (
                    <div>
                      <span className="font-medium">Engine:</span> {decodedVehicleInfo.engine}
                    </div>
                  )}
                  {decodedVehicleInfo.country && (
                    <div>
                      <span className="font-medium">Country:</span> {decodedVehicleInfo.country}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      )}

      {/* Processing Display */}
      {processing && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Decoding VIN... This may take a few seconds.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
