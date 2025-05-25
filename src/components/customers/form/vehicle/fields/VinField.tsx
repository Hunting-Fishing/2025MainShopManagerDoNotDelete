
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle, HelpCircle, RotateCcw, AlertTriangle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BaseFieldProps } from "./BaseFieldTypes";

export const VinField: React.FC<BaseFieldProps & { 
  processing?: boolean;
  error?: string | null;
  canRetry?: boolean;
  onRetry?: () => void;
  decodedVehicleInfo?: {
    year?: string | number;
    make?: string;
    model?: string;
    trim?: string;
    engine?: string;
    transmission?: string;
    drive_type?: string;
    fuel_type?: string;
    body_style?: string;
    country?: string;
    gvwr?: string;
    valid?: boolean;
  };
}> = ({ 
  form, 
  index, 
  processing = false, 
  error = null,
  canRetry = false,
  onRetry,
  decodedVehicleInfo 
}) => {
  const [showDetails, setShowDetails] = React.useState(false);
  
  const vinValue = form.watch(`vehicles.${index}.vin`);
  const makeValue = form.watch(`vehicles.${index}.make`);
  const modelValue = form.watch(`vehicles.${index}.model`);
  const yearValue = form.watch(`vehicles.${index}.year`);
  
  const showDecodedInfo = decodedVehicleInfo && (makeValue || modelValue || yearValue);
  const hasError = error && vinValue?.length === 17;
  const isComplete = vinValue?.length === 17 && showDecodedInfo && !error;
  
  // Count how many additional details we have
  const additionalDetails = decodedVehicleInfo ? [
    decodedVehicleInfo.trim,
    decodedVehicleInfo.engine,
    decodedVehicleInfo.transmission,
    decodedVehicleInfo.drive_type,
    decodedVehicleInfo.fuel_type,
    decodedVehicleInfo.body_style,
    decodedVehicleInfo.country,
    decodedVehicleInfo.gvwr
  ].filter(Boolean).length : 0;
  
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
                  <p>Vehicle Identification Number - A 17-character unique identifier. Enter a complete VIN to auto-populate vehicle details including make, model, year, engine, transmission, and more.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="relative">
            <FormControl>
              <Input 
                {...field} 
                placeholder="Enter 17-digit VIN to auto-populate" 
                className={`font-mono pr-16 ${hasError ? 'border-red-500' : ''} ${isComplete ? 'border-green-500' : ''}`}
                maxLength={17}
                disabled={processing}
                onChange={(e) => {
                  // Convert to uppercase as user types
                  field.onChange(e.target.value.toUpperCase());
                }}
              />
            </FormControl>
            
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              {processing && (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              )}
              
              {!processing && isComplete && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
              
              {!processing && hasError && (
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  {canRetry && onRetry && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={onRetry}
                      title="Retry VIN decode"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Error Alert */}
          {hasError && (
            <Alert variant="destructive" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {error}
                {canRetry && onRetry && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-auto p-1 text-xs underline"
                    onClick={onRetry}
                  >
                    Try Again
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Success Info with Primary Details */}
          {showDecodedInfo && !hasError && (
            <div className="mt-2 space-y-2">
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
                {decodedVehicleInfo?.trim && (
                  <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700">
                    {decodedVehicleInfo.trim}
                  </Badge>
                )}
              </div>
              
              {/* Additional Details Toggle */}
              {additionalDetails > 0 && (
                <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Info className="h-3 w-3 mr-1" />
                      {showDetails ? 'Hide' : 'Show'} {additionalDetails} additional detail{additionalDetails !== 1 ? 's' : ''}
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {decodedVehicleInfo?.engine && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Engine:</span>
                          <span className="font-medium">{decodedVehicleInfo.engine}</span>
                        </div>
                      )}
                      {decodedVehicleInfo?.transmission && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Transmission:</span>
                          <span className="font-medium">{decodedVehicleInfo.transmission}</span>
                        </div>
                      )}
                      {decodedVehicleInfo?.drive_type && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Drive Type:</span>
                          <span className="font-medium">{decodedVehicleInfo.drive_type}</span>
                        </div>
                      )}
                      {decodedVehicleInfo?.fuel_type && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fuel Type:</span>
                          <span className="font-medium">{decodedVehicleInfo.fuel_type}</span>
                        </div>
                      )}
                      {decodedVehicleInfo?.body_style && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Body Style:</span>
                          <span className="font-medium">{decodedVehicleInfo.body_style}</span>
                        </div>
                      )}
                      {decodedVehicleInfo?.country && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Country:</span>
                          <span className="font-medium">{decodedVehicleInfo.country}</span>
                        </div>
                      )}
                      {decodedVehicleInfo?.gvwr && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">GVWR:</span>
                          <span className="font-medium">{decodedVehicleInfo.gvwr}</span>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          )}
          
          <FormDescription>
            {processing 
              ? "Decoding VIN and retrieving detailed vehicle information..." 
              : hasError 
                ? "Fix the error above to continue"
                : "Enter a complete 17-digit VIN to auto-populate vehicle details"
            }
          </FormDescription>
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
