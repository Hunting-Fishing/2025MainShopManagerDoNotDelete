
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
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Truck
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CustomerFormValues } from "../CustomerFormSchema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface FleetManagementSectionProps {
  form: UseFormReturn<CustomerFormValues>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isFleet: boolean;
}

export const FleetManagementSection: React.FC<FleetManagementSectionProps> = ({
  form,
  isOpen,
  setIsOpen,
  isFleet
}) => {
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full border rounded-md p-4 my-4 bg-white">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Fleet Management</h3>
        </div>
        <CollapsibleTrigger asChild>
          <button className="p-2 hover:bg-slate-100 rounded-md" aria-label="Toggle section">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-4">
        <div className="space-y-4">
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
                    Customer manages a fleet of commercial vehicles
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
            <div className="space-y-4 mt-4 pl-2 border-l-2 border-primary/20">
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
              
              {/* Fleet Manager */}
              <FormField
                control={form.control}
                name="fleet_manager"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Fleet Manager Name</FormLabel>
                    </div>
                    <FormControl>
                      <Input 
                        placeholder="Fleet manager name" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Fleet Manager Contact */}
              <FormField
                control={form.control}
                name="fleet_contact"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Fleet Manager Contact</FormLabel>
                    </div>
                    <FormControl>
                      <Input 
                        placeholder="Phone or email for fleet manager" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Preferred Service Type */}
              <FormField
                control={form.control}
                name="preferred_service_type"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Preferred Service Type</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>Primary service arrangement for fleet vehicles</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="preventative">Preventative Maintenance</SelectItem>
                        <SelectItem value="on_demand">On-Demand Service</SelectItem>
                        <SelectItem value="emergency">Emergency Service</SelectItem>
                        <SelectItem value="scheduled">Regularly Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Fleet benefits:</span> Dedicated account manager, volume discounts, priority scheduling, and maintenance alerts
                </p>
              </div>
              
              <Separator />
              
              <div className="pt-2">
                <p className="text-sm font-medium mb-2">Fleet Vehicle Management</p>
                <p className="text-sm text-muted-foreground mb-4">
                  You can add and manage fleet vehicles in the Vehicles tab after saving this customer profile.
                </p>
                <div className="flex items-center text-sm text-blue-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  VIN decoding and vehicle tracking available in the Vehicles tab
                </div>
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
