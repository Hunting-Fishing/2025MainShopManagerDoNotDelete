
import React, { useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { VinDecodeResult } from "@/types/vehicle";
import { UseFormReturn } from "react-hook-form";

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
  const color = form.watch(`vehicles.${index}.color`) || '';
  const transmission = form.watch(`vehicles.${index}.transmission`) || '';
  const transmissionType = form.watch(`vehicles.${index}.transmission_type`) || '';
  
  // Update form with decoded values if provided
  useEffect(() => {
    if (decodedDetails) {
      console.log("Rendering VehicleAdditionalDetails with:", {
        decodedDetails,
        color,
        transmissionType,
        transmission
      });

      form.setValue(`vehicles.${index}.transmission`, decodedDetails.transmission || '');
      form.setValue(`vehicles.${index}.transmission_type`, decodedDetails.transmission_type || '');
      form.setValue(`vehicles.${index}.drive_type`, decodedDetails.drive_type || '');
      form.setValue(`vehicles.${index}.fuel_type`, decodedDetails.fuel_type || '');
      form.setValue(`vehicles.${index}.engine`, decodedDetails.engine || '');
      form.setValue(`vehicles.${index}.body_style`, decodedDetails.body_style || '');
      form.setValue(`vehicles.${index}.country`, decodedDetails.country || '');
      form.setValue(`vehicles.${index}.gvwr`, decodedDetails.gvwr || '');
    }
  }, [decodedDetails, form, index]);
  
  return (
    <div className="grid grid-cols-1 gap-4 mt-4">
      <h4 className="text-sm font-medium text-slate-500">Vehicle Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Color Field */}
        <FormField
          control={form.control}
          name={`vehicles.${index}.color`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Vehicle color" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Transmission Field */}
        <FormField
          control={form.control}
          name={`vehicles.${index}.transmission`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transmission</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Transmission type" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Drive Type Field */}
        <FormField
          control={form.control}
          name={`vehicles.${index}.drive_type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Drive Type</FormLabel>
              <FormControl>
                <Input {...field} placeholder="AWD, FWD, 4x4, etc." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Fuel Type Field */}
        <FormField
          control={form.control}
          name={`vehicles.${index}.fuel_type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fuel Type</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Gas, Diesel, Electric, etc." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Engine Field */}
        <FormField
          control={form.control}
          name={`vehicles.${index}.engine`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Engine</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Engine size/configuration" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Body Style Field */}
        <FormField
          control={form.control}
          name={`vehicles.${index}.body_style`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Body Style</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Sedan, SUV, etc." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Country Field */}
        <FormField
          control={form.control}
          name={`vehicles.${index}.country`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country of Origin</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Country of manufacture" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Transmission Type Field - Specific details */}
        <FormField
          control={form.control}
          name={`vehicles.${index}.transmission_type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transmission Details</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Detailed transmission type" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* GVWR Field */}
      <FormField
        control={form.control}
        name={`vehicles.${index}.gvwr`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>GVWR (Gross Vehicle Weight Rating)</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Weight class" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
