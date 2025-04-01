
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomerFormValues, technicians } from "./CustomerFormSchema";
import { HelpCircle, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

interface PreferencesFieldsProps {
  form: UseFormReturn<CustomerFormValues>;
}

export const PreferencesFields: React.FC<PreferencesFieldsProps> = ({ form }) => {
  const [isOpen, setIsOpen] = useState(true);

  // This would come from your API in a real implementation
  // For now, we'll simulate that one technician is inactive
  const technicianStatuses = {
    "TECH-3": "inactive"  // Emily Chen is inactive
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full border rounded-md p-4 my-4 bg-white">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Customer Preferences</h3>
        <CollapsibleTrigger asChild>
          <button className="p-2 hover:bg-slate-100 rounded-md" aria-label="Toggle section">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="preferred_technician_id"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Preferred Technician</FormLabel>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Technician the customer prefers to work with for service</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || "_none"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a preferred technician" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="_none">No preference</SelectItem>
                    {technicians.map((tech) => (
                      <SelectItem key={tech.id} value={tech.id} disabled={technicianStatuses[tech.id] === "inactive"}>
                        <div className="flex items-center justify-between w-full">
                          <span>{tech.name}</span>
                          {technicianStatuses[tech.id] === "inactive" && (
                            <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 border-amber-200">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Will be assigned to this customer when possible
                </FormDescription>
                {field.value && technicianStatuses[field.value] === "inactive" && (
                  <div className="mt-2 flex items-center text-xs text-amber-600">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    <span>This technician is no longer active. Consider updating the preference.</span>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="communication_preference"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Communication Preference</FormLabel>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Customer's preferred method of communication</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || "_none"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select communication preference" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="_none">Not specified</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="text">Text Messages</SelectItem>
                    <SelectItem value="any">Any Method</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  How the customer prefers to be contacted
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
