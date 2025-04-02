
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
import { Switch } from "@/components/ui/switch";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CustomerFormValues, shops as defaultShops, requiredFields } from "./CustomerFormSchema";
import { RequiredIndicator } from "@/components/ui/required-indicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BusinessInfoFieldsProps {
  form: UseFormReturn<CustomerFormValues>;
  availableShops?: Array<{id: string, name: string}>;
  singleShopMode?: boolean;
}

export const BusinessInfoFields: React.FC<BusinessInfoFieldsProps> = ({ 
  form,
  availableShops = defaultShops,
  singleShopMode = false
}) => {
  const [isFleetOpen, setIsFleetOpen] = React.useState(true);
  const isFleet = form.watch("is_fleet");

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
        
        {/* Shop Selection - Only show if not in single shop mode */}
        {!singleShopMode && (
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
        )}

        {/* Fleet Management Section */}
        <Collapsible open={isFleetOpen} onOpenChange={setIsFleetOpen} className="w-full border rounded-md p-4 my-4 bg-white">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Fleet Management</h3>
            <CollapsibleTrigger asChild>
              <button className="p-2 hover:bg-slate-100 rounded-md" aria-label="Toggle section">
                {isFleetOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="is_fleet"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <FormLabel>Fleet Account</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p>Mark this customer as a fleet account with multiple vehicles</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormDescription>
                        Customer has a fleet of vehicles
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
                      <div className="flex items-center gap-2">
                        <FormLabel>Fleet Company Name</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p>Legal name of the fleet management company</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormControl>
                        <Input 
                          placeholder="Fleet company name" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Will appear on invoices and work orders
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
