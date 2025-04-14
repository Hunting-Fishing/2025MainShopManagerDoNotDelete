
import React, { useState, useEffect, useRef } from "react";
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
import { decodeVin } from "@/utils/vehicleUtils";
import { useToast } from "@/hooks/use-toast";
import { VehicleAdditionalDetails } from "./VehicleAdditionalDetails";
import { VinDecodeResult } from "@/types/vehicle";
import { useVehicleData } from "@/hooks/useVehicleData";

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
  const { fetchModels, makes, models } = useVehicleData();
  const [decodedVehicle, setDecodedVehicle] = useState<VinDecodeResult | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [hasDecodingFailed, setHasDecodingFailed] = useState(false);
  const vin = form.watch(`vehicles.${index}.vin`);
  const make = form.watch(`vehicles.${index}.make`);
  const processedVinRef = useRef<string>('');

  useEffect(() => {
    if (make) {
      fetchModels(make);
    }
  }, [make, fetchModels]);

  useEffect(() => {
    const handleVinDecode = async () => {
      // Only process if:
      // 1. VIN is valid (17 chars)
      // 2. We're not already decoding
      // 3. This VIN hasn't been processed before
      // 4. Fields aren't already filled in (to prevent overwriting user edits)
      if (vin?.length === 17 && !isDecoding && vin !== processedVinRef.current) {
        setIsDecoding(true);
        setHasDecodingFailed(false);
        processedVinRef.current = vin; // Mark this VIN as processed
        
        try {
          console.log(`Starting VIN decode for ${vin}`);
          const decodedData = await decodeVin(vin);
          
          if (decodedData) {
            console.log("Decoded VIN data:", decodedData);
            setDecodedVehicle(decodedData);
            
            // Set primary fields immediately - this ensures they appear in the form
            form.setValue(`vehicles.${index}.make`, decodedData.make || '');
            form.setValue(`vehicles.${index}.model`, decodedData.model || '');
            form.setValue(`vehicles.${index}.year`, decodedData.year || '');
            
            // Set all additional fields from the decoded data - check each one to avoid setting undefined values
            const fieldsToSet = [
              { name: 'trim', value: decodedData.trim },
              { name: 'transmission', value: decodedData.transmission },
              { name: 'transmission_type', value: decodedData.transmission_type },
              { name: 'drive_type', value: decodedData.drive_type },
              { name: 'fuel_type', value: decodedData.fuel_type },
              { name: 'engine', value: decodedData.engine },
              { name: 'body_style', value: decodedData.body_style },
              { name: 'country', value: decodedData.country },
              { name: 'gvwr', value: decodedData.gvwr }
            ];
            
            // Only set fields that have values
            fieldsToSet.forEach(field => {
              if (field.value) {
                form.setValue(`vehicles.${index}.${field.name}`, field.value);
                console.log(`Setting ${field.name}:`, field.value);
              }
            });
            
            // If the make has changed, update the models
            if (decodedData.make) {
              await fetchModels(decodedData.make);
            }
            
            toast({
              title: "VIN Decoded Successfully",
              description: `Vehicle identified as ${decodedData.year} ${decodedData.make} ${decodedData.model} ${decodedData.trim || ''}`,
              variant: "success",
            });
            
            // Force a form validation after setting values
            form.trigger([
              `vehicles.${index}.make`, 
              `vehicles.${index}.model`,
              `vehicles.${index}.year`
            ]);
          } else {
            setHasDecodingFailed(true);
            toast({
              title: "VIN Not Found",
              description: "Could not find vehicle information for this VIN. Please enter vehicle details manually.",
              variant: "warning",
            });
          }
        } catch (error) {
          console.error("Error decoding VIN:", error);
          setHasDecodingFailed(true);
          toast({
            title: "Error",
            description: "Failed to decode VIN. Please enter vehicle details manually.",
            variant: "destructive",
          });
        } finally {
          setIsDecoding(false);
        }
      }
    };
    
    handleVinDecode();
  }, [vin, form, index, toast, fetchModels, isDecoding]);

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
            processing={isDecoding}
            decodedVehicleInfo={decodedVehicle ? {
              year: decodedVehicle.year?.toString(),
              make: decodedVehicle.make,
              model: decodedVehicle.model,
              valid: !!decodedVehicle.make
            } : undefined}
            decodingFailed={hasDecodingFailed}
          />
          <LicensePlateField form={form} index={index} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <YearField 
            form={form} 
            index={index}
            years={Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i)}
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
        <VehicleAdditionalDetails form={form} index={index} decodedDetails={decodedVehicle} />
      </CardContent>
    </Card>
  );
};
