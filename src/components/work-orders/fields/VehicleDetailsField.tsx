
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";

interface VehicleDetailsFieldProps {
  form: any;
}

export const VehicleDetailsField: React.FC<VehicleDetailsFieldProps> = ({ form }) => {
  const [searchParams] = useSearchParams();
  const vehicleInfo = searchParams.get('vehicleInfo');
  const vehicleMake = vehicleInfo?.split(' ')[1] || '';
  const vehicleModel = vehicleInfo?.split(' ')[2] || '';
  const vehicleYear = vehicleInfo?.split(' ')[0] || '';
  const vehicleId = searchParams.get('vehicleId') || '';
  
  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="vehicleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle ID</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    value={field.value || vehicleId}
                    readOnly 
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
