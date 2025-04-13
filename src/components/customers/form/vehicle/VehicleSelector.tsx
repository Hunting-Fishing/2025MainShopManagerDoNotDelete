
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
  const [isDecodingSuccess, setIsDecodingSuccess] = useState(false);
  const vin = form.watch(`vehicles.${index}.vin`);
  const make = form.watch(`vehicles.${index}.make`);
  const lastVin = useRef<string | null>(null);
  
  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (make) {
      fetchModels(make);
    }
  }, [make, fetchModels]);

  // Handle VIN decoding with debounce and duplicate check
  useEffect(() => {
    // Skip if VIN hasn't changed or is too short
    if (!vin || vin.length < 17 || vin === lastVin.current || isDecoding) {
      return;
    }

    let decodeTimeout: NodeJS.Timeout;

    const handleVinDecode = async () => {
      try {
        setIsDecoding(true);
        lastVin.current = vin;
        console.log("Attempting to decode VIN:", vin);
        
        const decodedData = await decodeVin(vin);
        
        if (!isMounted.current) return;
        
        if (decodedData) {
          console.log("Successfully decoded VIN:", decodedData);
          setDecodedVehicle(decodedData);
          
          // Set all the decoded details in the form
          if (decodedData.year) {
            form.setValue(`vehicles.${index}.year`, String(decodedData.year));
          }
          
          if (decodedData.make) {
            form.setValue(`vehicles.${index}.make`, decodedData.make);
            // Fetch models for this make
            await fetchModels(decodedData.make);
          }
          
          // Set model after a small delay to ensure models are loaded
          setTimeout(() => {
            if (isMounted.current && decodedData.model) {
              form.setValue(`vehicles.${index}.model`, decodedData.model);
            }
            
            // Set additional fields
            if (decodedData.trim) form.setValue(`vehicles.${index}.trim`, decodedData.trim);
            if (decodedData.transmission) form.setValue(`vehicles.${index}.transmission`, decodedData.transmission);
            if (decodedData.transmission_type) form.setValue(`vehicles.${index}.transmission_type`, decodedData.transmission_type);
            if (decodedData.drive_type) form.setValue(`vehicles.${index}.drive_type`, decodedData.drive_type);
            if (decodedData.fuel_type) form.setValue(`vehicles.${index}.fuel_type`, decodedData.fuel_type);
            if (decodedData.engine) form.setValue(`vehicles.${index}.engine`, decodedData.engine);
            if (decodedData.body_style) form.setValue(`vehicles.${index}.body_style`, decodedData.body_style);
            if (decodedData.country) form.setValue(`vehicles.${index}.country`, decodedData.country);
            if (decodedData.gvwr) form.setValue(`vehicles.${index}.gvwr`, decodedData.gvwr);
            
            // Trigger form validation
            form.trigger([
              `vehicles.${index}.year`,
              `vehicles.${index}.make`,
              `vehicles.${index}.model`
            ]);
            
            if (isMounted.current) {
              setIsDecodingSuccess(true);
              // Hide the success message after 3 seconds
              setTimeout(() => {
                if (isMounted.current) {
                  setIsDecodingSuccess(false);
                }
              }, 3000);
              
              toast({
                title: "VIN Decoded Successfully",
                description: `Vehicle identified as ${decodedData.year} ${decodedData.make} ${decodedData.model}`,
                variant: "success",
              });
            }
          }, 300);
        } else {
          if (isMounted.current) {
            toast({
              title: "VIN Not Recognized",
              description: "Unable to identify this VIN. Please enter vehicle details manually.",
              variant: "warning",
            });
          }
        }
      } catch (error) {
        console.error("Error decoding VIN:", error);
        if (isMounted.current) {
          toast({
            title: "Error",
            description: "Failed to decode VIN. Please enter vehicle details manually.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted.current) {
          setIsDecoding(false);
        }
      }
    };
    
    // Debounce the VIN decoding to prevent repeated API calls
    decodeTimeout = setTimeout(handleVinDecode, 500);
    
    // Cleanup timeout on component unmount or effect re-run
    return () => {
      clearTimeout(decodeTimeout);
    };
  }, [vin, form, index, toast, fetchModels]);

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
              year: String(decodedVehicle.year),
              make: decodedVehicle.make,
              model: decodedVehicle.model,
              valid: true
            } : undefined}
            isDecodingSuccess={isDecodingSuccess}
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
