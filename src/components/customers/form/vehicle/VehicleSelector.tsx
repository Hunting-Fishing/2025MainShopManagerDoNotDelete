
import React from "react";
import { Car, Trash, AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { CustomerFormValues } from "../CustomerFormSchema";
import { useVehicleForm } from "./useVehicleForm";
import { 
  VinField, 
  YearField, 
  MakeField, 
  ModelField, 
  LicensePlateField 
} from "./VehicleFormFields";
import { Card } from "@/components/ui/card";
import { validateVin } from "@/utils/vehicleUtils";

interface VehicleSelectorProps {
  form: UseFormReturn<CustomerFormValues>;
  index: number;
  onRemove: (index: number) => void;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({ 
  form, 
  index,
  onRemove
}) => {
  const {
    makes,
    models,
    years,
    error,
    selectedMake,
    vinProcessing,
    vinDecodeSuccess,
    decodedVehicleInfo,
    handleMakeChange
  } = useVehicleForm({ form, index });

  // Get current vehicle data
  const vehicle = form.watch(`vehicles.${index}`);
  
  // Check if VIN is valid based on its format and validate function
  const isVinValid = vehicle.vin?.length === 17 && validateVin(vehicle.vin);
  
  // Determine if we have a complete vehicle record
  const isCompleteVehicle = Boolean(
    vehicle.year && vehicle.make && vehicle.model
  );

  return (
    <div className="border rounded-md p-4 space-y-4 relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-muted-foreground" />
          <h4 className="text-md font-medium">Vehicle #{index + 1}</h4>
          
          {/* Show status indicator for vehicle completeness */}
          {isCompleteVehicle ? (
            <span className="flex items-center text-xs text-green-600">
              <Check className="h-3 w-3 mr-1" />
              Complete
            </span>
          ) : (
            <span className="flex items-center text-xs text-amber-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Incomplete
            </span>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onRemove(index)}
          type="button"
        >
          <Trash className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      {/* Enhanced vehicle summary if we have information */}
      {isCompleteVehicle && (
        <Card className="p-3 bg-muted/40 mb-2">
          <div className="flex flex-col gap-1">
            <div className="text-sm">
              <span className="font-medium">Vehicle:</span>{' '}
              {[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ')}
            </div>
            {vehicle.vin && (
              <div className="text-sm font-mono">
                <span className="font-medium">VIN:</span>{' '}
                {vehicle.vin}
                {isVinValid ? (
                  <Check className="h-3 w-3 inline ml-1 text-green-600" />
                ) : (
                  <AlertTriangle className="h-3 w-3 inline ml-1 text-amber-600" />
                )}
              </div>
            )}
            {vehicle.license_plate && (
              <div className="text-sm">
                <span className="font-medium">License:</span>{' '}
                {vehicle.license_plate}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* VIN Field - Placed at top for better UX since it auto-populates other fields */}
      <VinField 
        form={form} 
        index={index} 
        processing={vinProcessing}
        decodedVehicleInfo={{
          year: decodedVehicleInfo?.year,
          make: decodedVehicleInfo?.make,
          model: decodedVehicleInfo?.model,
          valid: vinDecodeSuccess
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Year Field */}
        <YearField form={form} index={index} years={years} />

        {/* Make Field */}
        <MakeField 
          form={form} 
          index={index} 
          makes={makes} 
          onMakeChange={handleMakeChange}
        />

        {/* Model Field */}
        <ModelField 
          form={form} 
          index={index} 
          models={models} 
          selectedMake={selectedMake} 
        />

        {/* License Plate Field */}
        <LicensePlateField form={form} index={index} />
      </div>

      {error && <div className="text-sm text-destructive mt-2">{error}</div>}
    </div>
  );
};
