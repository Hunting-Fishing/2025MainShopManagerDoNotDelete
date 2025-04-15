
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { VinField, YearField, MakeField, ModelField, LicensePlateField } from "./fields";
import { useToast } from "@/hooks/use-toast";
import { VehicleAdditionalDetails } from "./VehicleAdditionalDetails";
import { useVehicleSelection } from "@/hooks/useVehicleSelection";

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
  const { toast } = useToast();
  const {
    makes,
    models,
    years,
    vinProcessing,
    vinDecodeSuccess,
    decodedVehicleInfo,
    isModelLoading,
    handleMakeChange
  } = useVehicleSelection({ form, index });

  return (
    <div className="p-4 pt-2 space-y-6">
      <div className="flex justify-end">
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          onClick={() => onRemove(index)}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <VinField 
          form={form}
          index={index}
          processing={vinProcessing}
          success={vinDecodeSuccess}
        />
        
        <YearField 
          form={form}
          index={index}
          years={years}
        />
        
        <MakeField 
          form={form}
          index={index}
          makes={makes}
          onMakeChange={handleMakeChange}
        />
        
        <ModelField 
          form={form}
          index={index}
          models={models}
          isLoading={isModelLoading}
        />
        
        <LicensePlateField 
          form={form}
          index={index}
        />
      </div>
      
      {decodedVehicleInfo && (
        <VehicleAdditionalDetails
          form={form}
          index={index}
          decodedDetails={decodedVehicleInfo}
        />
      )}
    </div>
  );
};
