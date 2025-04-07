
import React, { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash } from "lucide-react";
import { CustomerFormValues } from "../CustomerFormSchema";
import { useVehicleData } from "@/hooks/useVehicleData";
import { VehicleMakeSelector } from "./VehicleMakeSelector";
import { VehicleModelSelector } from "./VehicleModelSelector";

interface VehicleSelectorProps {
  form: UseFormReturn<CustomerFormValues>;
  index: number;
  onRemove: (index: number) => void;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({ form, index, onRemove }) => {
  const { decodeVin } = useVehicleData();
  const [isDecoding, setIsDecoding] = useState(false);
  const vehicle = form.watch(`vehicles.${index}`);
  
  const handleVinUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const vin = e.target.value;
    if (vin.length === 17) {
      setIsDecoding(true);
      try {
        const decodedData = await decodeVin(vin);
        if (decodedData) {
          form.setValue(`vehicles.${index}.make`, decodedData.make || '');
          form.setValue(`vehicles.${index}.model`, decodedData.model || '');
          form.setValue(`vehicles.${index}.year`, decodedData.year || '');
        }
      } catch (error) {
        console.error("Error decoding VIN:", error);
      } finally {
        setIsDecoding(false);
      }
    }
  };

  return (
    <Card className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
        className="absolute top-2 right-2 text-destructive hover:text-destructive-foreground hover:bg-destructive"
      >
        <Trash className="h-4 w-4" />
      </Button>
      <CardContent className="pt-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name={`vehicles.${index}.year`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Year" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <VehicleMakeSelector form={form} index={index} />
          
          <VehicleModelSelector form={form} index={index} />
          
          <FormField
            control={form.control}
            name={`vehicles.${index}.vin`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>VIN</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Vehicle Identification Number" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e);
                      handleVinUpdate(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name={`vehicles.${index}.license_plate`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Plate</FormLabel>
                <FormControl>
                  <Input placeholder="License Plate Number" {...field} />
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
