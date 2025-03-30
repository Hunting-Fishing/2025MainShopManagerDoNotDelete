
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { CustomerFormValues } from "./CustomerFormSchema";
import { Car } from "lucide-react";

interface FleetFieldsProps {
  form: UseFormReturn<CustomerFormValues>;
}

export const FleetFields: React.FC<FleetFieldsProps> = ({ form }) => {
  const isFleet = form.watch("is_fleet");

  return (
    <>
      <div className="flex items-center gap-2">
        <Car className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-medium">Fleet Information</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="is_fleet"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Fleet Account</FormLabel>
                <FormDescription>
                  Mark this customer as a fleet account
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        {isFleet && (
          <FormField
            control={form.control}
            name="fleet_company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fleet Company Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Company or fleet name" />
                </FormControl>
                <FormDescription>Name of the company or organization</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </>
  );
};
