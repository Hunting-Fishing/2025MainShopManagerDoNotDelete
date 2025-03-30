
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { CustomerFormValues, shops } from "./CustomerFormSchema";
import { Building, MapPin, Bookmark } from "lucide-react";

interface BusinessInfoFieldsProps {
  form: UseFormReturn<CustomerFormValues>;
}

export const BusinessInfoFields: React.FC<BusinessInfoFieldsProps> = ({ form }) => {
  return (
    <>
      <div className="flex items-center gap-2">
        <Building className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-medium">Business Information</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <div className="flex items-center">
                <FormControl>
                  <div className="relative w-full">
                    <div className="absolute left-3 top-2.5 text-muted-foreground">
                      <Building className="h-4 w-4" />
                    </div>
                    <Input {...field} className="pl-10" placeholder="ABC Company" />
                  </div>
                </FormControl>
              </div>
              <FormDescription>If customer represents a business</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shop_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shop Location</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shop location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {shops.map(shop => (
                    <SelectItem key={shop.id} value={shop.id}>
                      {shop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Assign customer to a shop</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <div className="flex items-center">
              <FormControl>
                <div className="relative w-full">
                  <div className="absolute left-3 top-2.5 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <Textarea {...field} className="pl-10 min-h-[80px]" placeholder="123 Main St, City, State 12345" />
                </div>
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tags</FormLabel>
            <div className="flex items-center">
              <FormControl>
                <div className="relative w-full">
                  <div className="absolute left-3 top-2.5 text-muted-foreground">
                    <Bookmark className="h-4 w-4" />
                  </div>
                  <Input {...field} className="pl-10" placeholder="vip, referral, maintenance-plan" />
                </div>
              </FormControl>
            </div>
            <FormDescription>Separate multiple tags with commas</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea {...field} placeholder="Additional customer information" className="min-h-[120px]" />
            </FormControl>
            <FormDescription>Additional information about this customer</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
