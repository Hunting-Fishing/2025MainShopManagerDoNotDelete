
import React, { useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { VinDecodeResult } from "@/types/vehicle";
import { UseFormReturn } from "react-hook-form";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VehicleBodyStyle } from '@/types/vehicleBodyStyles';

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
  // Update form with decoded values if provided
  useEffect(() => {
    if (decodedDetails) {
      console.log("Updating form with decoded vehicle details:", decodedDetails);

      // Only set values that aren't already set in the form
      const currentTransmission = form.getValues(`vehicles.${index}.transmission`);
      if (!currentTransmission && decodedDetails.transmission) {
        form.setValue(`vehicles.${index}.transmission`, decodedDetails.transmission);
      }
      
      const currentTransmissionType = form.getValues(`vehicles.${index}.transmission_type`);
      if (!currentTransmissionType && decodedDetails.transmission_type) {
        form.setValue(`vehicles.${index}.transmission_type`, decodedDetails.transmission_type);
      }
      
      const currentDriveType = form.getValues(`vehicles.${index}.drive_type`);
      if (!currentDriveType && decodedDetails.drive_type) {
        form.setValue(`vehicles.${index}.drive_type`, decodedDetails.drive_type);
      }
      
      const currentFuelType = form.getValues(`vehicles.${index}.fuel_type`);
      if (!currentFuelType && decodedDetails.fuel_type) {
        form.setValue(`vehicles.${index}.fuel_type`, decodedDetails.fuel_type);
      }
      
      const currentEngine = form.getValues(`vehicles.${index}.engine`);
      if (!currentEngine && decodedDetails.engine) {
        form.setValue(`vehicles.${index}.engine`, decodedDetails.engine);
      }
      
      const currentBodyStyle = form.getValues(`vehicles.${index}.body_style`);
      if (!currentBodyStyle && decodedDetails.body_style) {
        form.setValue(`vehicles.${index}.body_style`, decodedDetails.body_style);
      }
      
      const currentCountry = form.getValues(`vehicles.${index}.country`);
      if (!currentCountry && decodedDetails.country) {
        form.setValue(`vehicles.${index}.country`, decodedDetails.country);
      }
      
      const currentGvwr = form.getValues(`vehicles.${index}.gvwr`);
      if (!currentGvwr && decodedDetails.gvwr) {
        form.setValue(`vehicles.${index}.gvwr`, decodedDetails.gvwr);
      }
      
      const currentTrim = form.getValues(`vehicles.${index}.trim`);
      if (!currentTrim && decodedDetails.trim) {
        form.setValue(`vehicles.${index}.trim`, decodedDetails.trim);
      }
    }
  }, [decodedDetails, form, index]);
  
  // Define body style options
  const bodyStyleOptions: { label: string; value: VehicleBodyStyle }[] = [
    { label: 'Sedan', value: 'sedan' },
    { label: 'Hatchback', value: 'hatchback' },
    { label: 'Coupe', value: 'coupe' },
    { label: 'Convertible', value: 'convertible' },
    { label: 'Wagon', value: 'wagon' },
    { label: 'SUV', value: 'suv' },
    { label: 'Crossover', value: 'crossover' },
    { label: 'Minivan', value: 'minivan' },
    { label: 'Van', value: 'van' },
    { label: 'Pickup', value: 'pickup' },
    { label: 'Truck', value: 'truck' },
    { label: 'Bus', value: 'bus' },
    { label: 'Motorcycle', value: 'motorcycle' },
    { label: 'Off-road', value: 'off-road' },
    { label: 'Other', value: 'other' },
  ];
  
  // Common fuel types
  const fuelTypeOptions = [
    'Gasoline',
    'Diesel',
    'Electric',
    'Hybrid',
    'Plug-in Hybrid',
    'Flex-Fuel',
    'CNG',
    'LPG',
    'Hydrogen',
    'Other'
  ];
  
  // Common transmission types
  const transmissionOptions = [
    'Automatic',
    'Manual',
    'CVT',
    'Semi-Automatic',
    'Dual Clutch',
    'Other'
  ];
  
  // Common drive types
  const driveTypeOptions = [
    'FWD',
    'RWD',
    'AWD',
    '4WD',
    '4x4',
    'Part-time 4WD',
    'Other'
  ];
  
  return (
    <div className="mt-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="additional-details">
          <AccordionTrigger className="text-sm font-medium">
            Additional Vehicle Details
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Trim Field */}
              <FormField
                control={form.control}
                name={`vehicles.${index}.trim`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trim</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Trim level (e.g., SE, XLE, Limited)" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Transmission Field */}
              <FormField
                control={form.control}
                name={`vehicles.${index}.transmission`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transmission</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transmission type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {transmissionOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Drive Type Field */}
              <FormField
                control={form.control}
                name={`vehicles.${index}.drive_type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drive Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select drive type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {driveTypeOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Fuel Type Field */}
              <FormField
                control={form.control}
                name={`vehicles.${index}.fuel_type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuel Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fuel type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fuelTypeOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select body style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bodyStyleOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
              
              {/* Transmission Details Field */}
              <FormField
                control={form.control}
                name={`vehicles.${index}.transmission_type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transmission Details</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="E.g., 6-speed, CVT with paddle shifters" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
              
              {/* GVWR Field */}
              <FormField
                control={form.control}
                name={`vehicles.${index}.gvwr`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GVWR</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Weight class" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
