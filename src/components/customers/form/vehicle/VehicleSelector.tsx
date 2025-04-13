
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { 
  VinField, 
  YearField, 
  MakeField, 
  ModelField, 
  LicensePlateField 
} from "./fields";
import { useVehicleData } from "@/hooks/useVehicleData";
import { VehicleAdditionalDetails } from "./VehicleAdditionalDetails";
import { useVinDecoder } from "@/hooks/useVinDecoder";

interface VehicleSelectorProps {
  form: UseFormReturn<any>;
  index: number;
  onRemove: (index: number) => void;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  form,
  index,
  onRemove
}) => {
  // Load vehicle data (makes, models, etc)
  const { 
    makes, 
    models, 
    years,
    fetchModels 
  } = useVehicleData();

  // Current vehicle make selected in the form
  const make = form.watch(`vehicles.${index}.make`);

  // VIN decoding functionality
  const {
    isDecoding,
    isDecodingSuccess,
    decodedVehicle,
    hasAttemptedDecode
  } = useVinDecoder({
    form,
    vehicleIndex: index
  });
  
  // Fetch models when make changes
  React.useEffect(() => {
    if (make) {
      fetchModels(make);
    }
  }, [make, fetchModels]);

  return (
    <Card className="relative">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-2 top-2 h-6 w-6 p-0 rounded-full"
        onClick={() => onRemove(index)}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <CardContent className="pt-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <VinField 
            form={form} 
            index={index}
            isDecoding={isDecoding}
            isDecodingSuccess={isDecodingSuccess}
            decodedVehicleInfo={decodedVehicle ? {
              year: decodedVehicle.year,
              make: decodedVehicle.make,
              model: decodedVehicle.model
            } : null}
            hasAttemptedDecode={hasAttemptedDecode}
          />
          <LicensePlateField form={form} index={index} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <YearField 
            form={form} 
            index={index}
            years={years}
          />
          <MakeField 
            form={form} 
            index={index} 
            makes={makes} 
            onMakeChange={(make) => {
              // When make changes, refresh models and reset model value
              fetchModels(make);
              form.setValue(`vehicles.${index}.model`, '');
            }}
          />
          <ModelField 
            form={form} 
            index={index} 
            models={models}
            selectedMake={make}
          />
        </div>
        <VehicleAdditionalDetails 
          form={form} 
          index={index} 
          decodedDetails={decodedVehicle}
        />
      </CardContent>
    </Card>
  );
};
