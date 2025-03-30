
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage, 
  FormDescription 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RequiredIndicator } from "@/components/ui/required-indicator";
import { CustomerFormValues, requiredFields } from "./CustomerFormSchema";
import { useMaskedInput } from "@/hooks/useMaskedInput";

interface PersonalInfoFieldsProps {
  form: UseFormReturn<CustomerFormValues>;
}

export const PersonalInfoFields: React.FC<PersonalInfoFieldsProps> = ({ form }) => {
  const { getPhoneInputProps } = useMaskedInput();

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Personal Information</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                First Name
                {requiredFields.first_name && <RequiredIndicator />}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="First name" 
                  {...field} 
                  className={form.formState.errors.first_name ? "border-destructive" : ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Last Name
                {requiredFields.last_name && <RequiredIndicator />}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Last name" 
                  {...field} 
                  className={form.formState.errors.last_name ? "border-destructive" : ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input 
                  placeholder="(555) 555-5555" 
                  {...getPhoneInputProps(field)}
                  className={form.formState.errors.phone ? "border-destructive" : ""}
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground">
                Format: (555) 555-5555
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="email@example.com" 
                  {...field} 
                  className={form.formState.errors.email ? "border-destructive" : ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter full address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
