
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { User, ToggleLeft, ToggleRight } from "lucide-react";

interface CustomerDetailsFieldProps {
  form: any;
}

export const CustomerDetailsField: React.FC<CustomerDetailsFieldProps> = ({ form }) => {
  const [useEnhancedSelector, setUseEnhancedSelector] = useState(false);

  return (
    <Card className="mb-4 border-green-100">
      <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <User className="h-5 w-5 mr-2 text-green-600" />
            Customer Details
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {useEnhancedSelector ? "Enhanced" : "Hierarchical"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUseEnhancedSelector(!useEnhancedSelector)}
              className="p-1"
            >
              {useEnhancedSelector ? (
                <ToggleRight className="h-5 w-5 text-green-600" />
              ) : (
                <ToggleLeft className="h-5 w-5 text-gray-400" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <FormField
          control={form.control}
          name="customer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <FormControl>
                <Input placeholder="Enter customer name" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
