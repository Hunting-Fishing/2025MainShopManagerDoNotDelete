
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CustomerFormValues } from "./CustomerFormSchema";
import { Mail, Phone, UserRound } from "lucide-react";

interface PersonalInfoFieldsProps {
  form: UseFormReturn<CustomerFormValues>;
}

export const PersonalInfoFields: React.FC<PersonalInfoFieldsProps> = ({ form }) => {
  return (
    <>
      <div className="flex items-center gap-2">
        <UserRound className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-medium">Personal Information</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="John" />
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
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Doe" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <div className="flex items-center">
                <FormControl>
                  <div className="relative w-full">
                    <div className="absolute left-3 top-2.5 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                    </div>
                    <Input {...field} type="email" className="pl-10" placeholder="customer@example.com" />
                  </div>
                </FormControl>
              </div>
              <FormDescription>Customer's contact email (optional)</FormDescription>
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
              <div className="flex items-center">
                <FormControl>
                  <div className="relative w-full">
                    <div className="absolute left-3 top-2.5 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                    </div>
                    <Input {...field} className="pl-10" placeholder="(555) 123-4567" />
                  </div>
                </FormControl>
              </div>
              <FormDescription>Format: (555) 123-4567</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};
