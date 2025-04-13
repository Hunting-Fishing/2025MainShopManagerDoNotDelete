
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Car } from "lucide-react";
import { VinDecodeResult } from "@/types/vehicle";
import { VEHICLE_BODY_STYLES } from "@/types/vehicle";

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
  
  const driveTypes = ["FWD", "RWD", "AWD", "4WD", "Other"];
  const fuelTypes = ["Gasoline", "Diesel", "Electric", "Hybrid", "Plugin Hybrid", "Natural Gas", "Other"];
  const transmissionTypes = ["Automatic", "Manual", "CVT", "Auto-Manual", "Dual Clutch"];
  
  const hasAdditionalDetails = decodedDetails && (
    decodedDetails.drive_type || 
    decodedDetails.fuel_type || 
    decodedDetails.transmission ||
    decodedDetails.transmission_type ||
    decodedDetails.body_style ||
    decodedDetails.engine
  );

  return (
    <>
      <Button 
        type="button" 
        variant="ghost" 
        className="w-full mt-4 flex items-center justify-between border border-dashed"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <Car className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>Additional Vehicle Details</span>
          {hasAdditionalDetails && !isExpanded && (
            <span className="ml-2 text-xs bg-muted rounded-full px-2 py-0.5">
              Info available
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>
      
      {isExpanded && (
        <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name={`vehicles.${index}.color`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input placeholder="Vehicle color" {...field} />
                </FormControl>
                <FormMessage />
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
                  <Input placeholder="e.g. LX, EX, Limited" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name={`vehicles.${index}.transmission_type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transmission</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {transmissionTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name={`vehicles.${index}.drive_type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Drive Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {driveTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name={`vehicles.${index}.fuel_type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fuel Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {fuelTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name={`vehicles.${index}.body_style`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body Style</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {VEHICLE_BODY_STYLES.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
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
                  <Input placeholder="e.g. 2.0L 4-cylinder" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </>
  );
};
