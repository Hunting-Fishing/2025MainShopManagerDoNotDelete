
import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CustomerFormValues, referralSources } from "./CustomerFormSchema";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ReferralFieldsProps {
  form: UseFormReturn<CustomerFormValues>;
}

export const ReferralFields: React.FC<ReferralFieldsProps> = ({ form }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showOtherField, setShowOtherField] = useState(false);
  
  // Watch for changes to referral source to show/hide the "Other" field
  const referralSource = form.watch("referral_source");
  
  useEffect(() => {
    setShowOtherField(referralSource === "Other");
  }, [referralSource]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full border rounded-md p-4 my-4 bg-white">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Referral Information</h3>
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
            name="referral_source"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Referral Source</FormLabel>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>How did the customer hear about us?</p>
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
                      <SelectValue placeholder="Select referral source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="_none">Not specified</SelectItem>
                    {referralSources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {showOtherField && (
            <FormField
              control={form.control}
              name="other_referral_details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Referral Details</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please specify how the customer was referred" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Please provide details about this referral source
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <FormField
            control={form.control}
            name="referral_person_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referred By Customer</FormLabel>
                <FormControl>
                  <Input placeholder="Customer ID (if applicable)" {...field} />
                </FormControl>
                <FormDescription>
                  If referred by another customer, enter their ID
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
