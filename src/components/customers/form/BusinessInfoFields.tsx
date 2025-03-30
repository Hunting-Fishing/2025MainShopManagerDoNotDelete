
import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RequiredIndicator } from "@/components/ui/required-indicator";
import { UseFormReturn } from "react-hook-form";
import { CustomerFormValues } from "./CustomerFormSchema";
import { TagSelector } from "./TagSelector";

interface BusinessInfoFieldsProps {
  form: UseFormReturn<CustomerFormValues>;
  disabled?: boolean;
}

export const BusinessInfoFields: React.FC<BusinessInfoFieldsProps> = ({
  form,
  disabled = false,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Company name"
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tags</FormLabel>
            <FormControl>
              <TagSelector 
                form={{ 
                  setValue: (name: string, value: string[]) => {
                    form.setValue("tags", value);
                  },
                  watch: () => form.watch("tags") || []
                }} 
                field={{
                  name: "tags",
                  value: field.value || [],
                  onChange: (value: string[]) => field.onChange(value)
                }}
                disabled={disabled} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Business Notes
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter any business related notes here"
                className="min-h-32"
                {...field}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
