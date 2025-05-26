
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VinDecodeResult } from "@/types/vehicle";
import { Info } from "lucide-react";

interface VehicleAdditionalDetailsProps {
  form: UseFormReturn<any>;
  index: number;
  decodedDetails?: VinDecodeResult | null;
}

export const VehicleAdditionalDetails: React.FC<VehicleAdditionalDetailsProps> = ({ 
  form, 
  index, 
  decodedDetails 
}) => {
  // Watch current form values to show what's populated
  const currentValues = form.watch(`vehicles.${index}`);
  
  return (
    <div className="mt-6 space-y-4">
      {decodedDetails && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center text-blue-700">
              <Info className="h-4 w-4 mr-2" />
              VIN Decoded Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-blue-600">
            <p>The following details were automatically populated from the VIN decode:</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {decodedDetails.transmission && <span>• Transmission: {decodedDetails.transmission}</span>}
              {decodedDetails.fuel_type && <span>• Fuel Type: {decodedDetails.fuel_type}</span>}
              {decodedDetails.drive_type && <span>• Drive Type: {decodedDetails.drive_type}</span>}
              {decodedDetails.engine && <span>• Engine: {decodedDetails.engine}</span>}
              {decodedDetails.body_style && <span>• Body Style: {decodedDetails.body_style}</span>}
              {decodedDetails.country && <span>• Country: {decodedDetails.country}</span>}
              {decodedDetails.trim && <span>• Trim: {decodedDetails.trim}</span>}
              {decodedDetails.gvwr && <span>• GVWR: {decodedDetails.gvwr}</span>}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name={`vehicles.${index}.color`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="e.g., Red, Blue, Silver"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`vehicles.${index}.trim`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trim Level</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={decodedDetails?.trim || "e.g., LT, EX, Premium"}
                  value={field.value || currentValues?.trim || ''}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`vehicles.${index}.engine`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Engine</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={decodedDetails?.engine || "e.g., 2.4L 4-Cylinder"}
                  value={field.value || currentValues?.engine || ''}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`vehicles.${index}.transmission`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transmission</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={decodedDetails?.transmission || "e.g., Automatic, Manual"}
                  value={field.value || currentValues?.transmission || ''}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`vehicles.${index}.fuel_type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fuel Type</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={decodedDetails?.fuel_type || "e.g., Gasoline, Diesel, Hybrid"}
                  value={field.value || currentValues?.fuel_type || ''}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`vehicles.${index}.drive_type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Drive Type</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={decodedDetails?.drive_type || "e.g., FWD, RWD, AWD, 4WD"}
                  value={field.value || currentValues?.drive_type || ''}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`vehicles.${index}.body_style`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Body Style</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={decodedDetails?.body_style || "e.g., Sedan, SUV, Truck"}
                  value={field.value || currentValues?.body_style || ''}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`vehicles.${index}.country`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country of Origin</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={decodedDetails?.country || "e.g., United States, Japan"}
                  value={field.value || currentValues?.country || ''}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`vehicles.${index}.gvwr`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>GVWR</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={decodedDetails?.gvwr || "Gross Vehicle Weight Rating"}
                  value={field.value || currentValues?.gvwr || ''}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
