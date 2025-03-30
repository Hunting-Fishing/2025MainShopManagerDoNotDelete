
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { CustomerFormValues } from "./CustomerFormSchema";
import { Award } from "lucide-react";
import { referralSources } from "./CustomerFormSchema";

interface ReferralFieldsProps {
  form: UseFormReturn<CustomerFormValues>;
}

export const ReferralFields: React.FC<ReferralFieldsProps> = ({ form }) => {
  return (
    <>
      <div className="flex items-center gap-2">
        <Award className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-medium">Referral Information</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="referral_source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Referral Source</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="How did they find us?" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Unknown/Not specified</SelectItem>
                  {referralSources.map(source => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>How the customer found your shop</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="referral_person_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Referred By</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Customer ID or name of referrer" />
              </FormControl>
              <FormDescription>Name or ID of person who referred this customer</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};
