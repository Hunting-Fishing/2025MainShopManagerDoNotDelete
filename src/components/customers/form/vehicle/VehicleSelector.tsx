
import React, { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle } from "lucide-react";
import { 
  VinField, 
  YearField, 
  MakeField, 
  ModelField, 
  LicensePlateField 
} from "./fields";
import { useToast } from "@/hooks/use-toast";
import { VehicleAdditionalDetails } from "./VehicleAdditionalDetails";
import { useVehicleForm } from "./useVehicleForm";

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
    loading: vehicleDataLoading,
    vinProcessing,
    modelsLoaded,
    vinDecodeSuccess,
    decodedVehicleInfo,
    isModelLoading,
    fetchModels
  } = useVehicleForm({ form, index });

  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  
  // Current field values
  const vin = form.watch(`vehicles.${index}.vin`);
  const make = form.watch(`vehicles.${index}.make`);
  const model = form.watch(`vehicles.${index}.model`);
  
  // Debug make and model values to check form state
  useEffect(() => {
    if (make || model) {
      console.log(`Current form state at index ${index}: make=${make}, model=${model}`);
    }
  }, [make, model, index]);
  
  // Handle manual make change
  const handleMakeChange = async (makeValue: string) => {
    console.log("Make changed via selector:", makeValue);
    setHasAttemptedLoad(true);
    
    if (!makeValue) return;
    
    try {
      // Fetch models for the selected make
      await fetchModels(makeValue);
      console.log(`Models fetched for make: ${makeValue}`);
      
      // Clear the model when make changes
      if (model) {
        form.setValue(`vehicles.${index}.model`, '');
      }
    } catch (err) {
      console.error("Error handling make change:", err);
      toast({
        title: "Error",
        description: "Failed to load models for the selected make.",
        variant: "destructive",
      });
    }
  };

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
          isLoading={vehicleDataLoading}
        />
        
        <ModelField 
          form={form}
          index={index}
          models={models}
          selectedMake={make}
          isLoading={isModelLoading || (hasAttemptedLoad && !modelsLoaded && !!make)}
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
          vehicleInfo={decodedVehicleInfo}
        />
      )}
    </div>
  );
};
