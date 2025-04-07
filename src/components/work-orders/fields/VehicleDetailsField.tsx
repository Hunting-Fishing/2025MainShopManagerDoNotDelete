
import React, { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { decodeVin } from "@/utils/vehicleUtils";
import { VinDecodeResult } from "@/types/vehicle";
import { toast } from "@/hooks/use-toast";

interface VehicleDetailsFieldProps {
  form: any;
  isFleetCustomer?: boolean;
}

export const VehicleDetailsField: React.FC<VehicleDetailsFieldProps> = ({ form, isFleetCustomer = false }) => {
  const [searchParams] = useSearchParams();
  const vehicleInfo = searchParams.get('vehicleInfo');
  const vehicleId = searchParams.get('vehicleId') || '';
  const [isDecoding, setIsDecoding] = useState(false);
  
  // Parse vehicle info - assuming format "YEAR MAKE MODEL"
  const vehicleParts = vehicleInfo?.split(' ') || [];
  const vehicleYear = vehicleParts[0] || '';
  const vehicleMake = vehicleParts.length > 1 ? vehicleParts[1] : '';
  const vehicleModel = vehicleParts.length > 2 ? vehicleParts.slice(2).join(' ') : '';
  
  // If a VIN exists in the form, attempt to decode it on component mount
  const vin = form.watch("vin");
  
  useEffect(() => {
    if (vin && vin.length === 17) {
      handleVinDecode(vin);
    }
  }, []);
  
  const handleVinDecode = async (vinNumber: string) => {
    if (vinNumber.length !== 17) return;
    
    setIsDecoding(true);
    try {
      const decodedData = await decodeVin(vinNumber);
      if (decodedData) {
        // Update form fields with decoded vehicle information
        form.setValue("vehicleMake", decodedData.make || '');
        form.setValue("vehicleModel", decodedData.model || '');
        form.setValue("vehicleYear", decodedData.year || '');
        
        toast({
          title: "VIN Decoded Successfully",
          description: `Vehicle identified as ${decodedData.year} ${decodedData.make} ${decodedData.model}`,
          variant: "success",
        });
      } else {
        toast({
          title: "VIN Decode Failed",
          description: "Could not decode the provided VIN. Please check and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error decoding VIN:", error);
      toast({
        title: "Error",
        description: "An error occurred while decoding the VIN.",
        variant: "destructive",
      });
    } finally {
      setIsDecoding(false);
    }
  };
  
  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Only display Vehicle ID field for fleet/business customers */}
          {isFleetCustomer && (
            <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fleet Vehicle ID</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      value={field.value || vehicleId}
                      placeholder="Fleet/Business Vehicle ID"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {/* Always hidden field to store vehicle ID for database reference */}
          {!isFleetCustomer && vehicleId && (
            <input type="hidden" name="vehicleId" value={vehicleId} />
          )}

          {/* VIN Field with decoder */}
          <FormField
            control={form.control}
            name="vin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  VIN {isDecoding && <Loader2 className="h-4 w-4 inline animate-spin ml-2" />}
                </FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Vehicle Identification Number"
                    onChange={(e) => {
                      field.onChange(e);
                      if (e.target.value.length === 17) {
                        handleVinDecode(e.target.value);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicleMake"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Make</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    value={field.value || vehicleMake}
                    placeholder="Vehicle make" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicleModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    value={field.value || vehicleModel}
                    placeholder="Vehicle model" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicleYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    value={field.value || vehicleYear}
                    placeholder="Vehicle year" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="odometer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Odometer</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Current odometer reading" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="licensePlate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Plate</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="License plate number" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};
