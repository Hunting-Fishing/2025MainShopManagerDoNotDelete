
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VinDecodeResult } from "@/types/vehicle";

interface VehicleAdditionalDetailsProps {
  form: UseFormReturn<any>;
  index: number;
  decodedDetails: VinDecodeResult | null;
}

export const VehicleAdditionalDetails: React.FC<VehicleAdditionalDetailsProps> = ({
  form,
  index,
  decodedDetails
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get all current vehicle values from the form
  const transmission = form.watch(`vehicles.${index}.transmission`);
  const transmissionType = form.watch(`vehicles.${index}.transmission_type`);
  const driveType = form.watch(`vehicles.${index}.drive_type`);
  const fuelType = form.watch(`vehicles.${index}.fuel_type`);
  const engine = form.watch(`vehicles.${index}.engine`);
  const bodyStyle = form.watch(`vehicles.${index}.body_style`);
  const country = form.watch(`vehicles.${index}.country`);
  const trim = form.watch(`vehicles.${index}.trim`);
  const gvwr = form.watch(`vehicles.${index}.gvwr`);
  
  // Auto-expand if we have decoded details or any fields are filled
  React.useEffect(() => {
    if (decodedDetails || transmission || transmissionType || driveType || 
        fuelType || engine || bodyStyle || country || trim || gvwr) {
      setIsExpanded(true);
    }
  }, [decodedDetails, transmission, transmissionType, driveType, fuelType, engine, bodyStyle, country, trim, gvwr]);

  // Common fuel types for the dropdown
  const fuelTypes = [
    "Gasoline",
    "Diesel",
    "Electric",
    "Hybrid",
    "Plug-in Hybrid",
    "Flex Fuel",
    "CNG",
    "LPG",
    "Hydrogen",
    "Other"
  ];
  
  // Common transmission types
  const transmissionTypes = [
    "Automatic",
    "Manual",
    "CVT",
    "DCT (Dual Clutch)",
    "AMT (Automated Manual)",
    "Sequential",
    "Other"
  ];
  
  // Common drive types
  const driveTypes = [
    "FWD",
    "RWD",
    "AWD",
    "4WD",
    "4x4",
    "Part-time 4WD"
  ];
  
  // Common body styles
  const bodyStyles = [
    "Sedan",
    "SUV",
    "Crossover",
    "Pickup",
    "Truck",
    "Van",
    "Minivan",
    "Hatchback",
    "Coupe",
    "Convertible",
    "Wagon",
    "Other"
  ];
  
  return (
    <div className="mt-4 border-t pt-4">
      <Button
        type="button"
        variant="ghost"
        className="w-full justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>Additional Vehicle Details</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>
      
      {isExpanded && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Transmission */}
          <FormField
            control={form.control}
            name={`vehicles.${index}.transmission`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transmission</FormLabel>
                <FormControl>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select transmission" />
                    </SelectTrigger>
                    <SelectContent>
                      {transmissionTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          
          {/* Transmission Type */}
          <FormField
            control={form.control}
            name={`vehicles.${index}.transmission_type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transmission Type</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. 6-Speed Automatic"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          {/* Drive Type */}
          <FormField
            control={form.control}
            name={`vehicles.${index}.drive_type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Drive Type</FormLabel>
                <FormControl>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select drive type" />
                    </SelectTrigger>
                    <SelectContent>
                      {driveTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          
          {/* Fuel Type */}
          <FormField
            control={form.control}
            name={`vehicles.${index}.fuel_type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fuel Type</FormLabel>
                <FormControl>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      {fuelTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          
          {/* Engine */}
          <FormField
            control={form.control}
            name={`vehicles.${index}.engine`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Engine</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. 2.0L 4-Cylinder"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          {/* Body Style */}
          <FormField
            control={form.control}
            name={`vehicles.${index}.body_style`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body Style</FormLabel>
                <FormControl>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select body style" />
                    </SelectTrigger>
                    <SelectContent>
                      {bodyStyles.map(style => (
                        <SelectItem key={style} value={style.toLowerCase()}>
                          {style}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          
          {/* Trim */}
          <FormField
            control={form.control}
            name={`vehicles.${index}.trim`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trim</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. XLE, Limited, Sport"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          {/* Country */}
          <FormField
            control={form.control}
            name={`vehicles.${index}.country`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country of Origin</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. USA, Japan, Germany"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          {/* GVWR */}
          <FormField
            control={form.control}
            name={`vehicles.${index}.gvwr`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>GVWR</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. Class 1: 0 - 6,000 lb"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};
