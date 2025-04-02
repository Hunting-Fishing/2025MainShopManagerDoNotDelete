
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CustomerFormValues, shops as defaultShops, requiredFields } from "./CustomerFormSchema";
import { RequiredIndicator } from "@/components/ui/required-indicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BusinessInfoFieldsProps {
  form: UseFormReturn<CustomerFormValues>;
  availableShops?: Array<{id: string, name: string}>;
}

export const BusinessInfoFields: React.FC<BusinessInfoFieldsProps> = ({ 
  form,
  availableShops = defaultShops
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Company Field */}
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter company name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Shop Selection */}
        <FormField
          control={form.control}
          name="shop_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Shop {requiredFields.shop_id && <RequiredIndicator />}
              </FormLabel>
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
                disabled={availableShops.length <= 1}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shop" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableShops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id}>
                      {shop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
