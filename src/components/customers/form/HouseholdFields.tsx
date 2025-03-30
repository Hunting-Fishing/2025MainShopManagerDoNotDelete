
import React, { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomerFormValues, relationshipTypes } from "./CustomerFormSchema";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HouseholdFieldsProps {
  form: UseFormReturn<CustomerFormValues>;
  disabled?: boolean;
}

type Household = {
  id: string;
  name: string;
  address?: string;
};

export const HouseholdFields: React.FC<HouseholdFieldsProps> = ({ form, disabled = false }) => {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const createNewHousehold = form.watch("create_new_household");

  useEffect(() => {
    const fetchHouseholds = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("households")
          .select("id, name, address")
          .order("name");

        if (error) {
          throw error;
        }

        setHouseholds(data || []);
      } catch (error) {
        console.error("Error fetching households:", error);
        toast({
          title: "Error",
          description: "Failed to load households",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHouseholds();
  }, [toast]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <FormField
          control={form.control}
          name="create_new_household"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Create New Household</FormLabel>
                <FormDescription>
                  Create a new household for this customer
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>

      {createNewHousehold ? (
        <FormField
          control={form.control}
          name="new_household_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Household Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter household name"
                  disabled={disabled}
                />
              </FormControl>
              <FormDescription>
                This will create a new household with this customer as the primary member
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <FormField
          control={form.control}
          name="household_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Household</FormLabel>
              <Select
                disabled={disabled || loading}
                onValueChange={field.onChange}
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an existing household" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {households.map((household) => (
                    <SelectItem key={household.id} value={household.id}>
                      {household.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {(form.watch("household_id") || createNewHousehold) && (
        <FormField
          control={form.control}
          name="household_relationship"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relationship to Household</FormLabel>
              <Select
                disabled={disabled}
                onValueChange={field.onChange}
                value={field.value || "primary"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {relationshipTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};
