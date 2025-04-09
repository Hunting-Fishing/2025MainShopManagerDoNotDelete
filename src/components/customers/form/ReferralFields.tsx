
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
import { CustomerFormValues } from "./CustomerFormSchema";
import { HelpCircle, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getActiveReferralSources } from "@/services/referral/referralService";
import { ReferralSource } from "@/types/referral";

interface ReferralFieldsProps {
  form: UseFormReturn<CustomerFormValues>;
}

export const ReferralFields: React.FC<ReferralFieldsProps> = ({ form }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showOtherField, setShowOtherField] = useState(false);
  const [referralSources, setReferralSources] = useState<ReferralSource[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Watch for changes to referral source to show/hide the "Other" field
  const referralSource = form.watch("referral_source");
  
  // Fetch referral sources from the database
  useEffect(() => {
    const fetchReferralSources = async () => {
      try {
        setLoading(true);
        const sources = await getActiveReferralSources();
        setReferralSources(sources);
      } catch (error) {
        console.error("Error loading referral sources:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReferralSources();
  }, []);
  
  useEffect(() => {
    setShowOtherField(referralSource === "Other");
    
    // If user selects "Other" but doesn't provide details, show validation error
    if (referralSource === "Other") {
      const otherDetails = form.getValues("other_referral_details");
      if (!otherDetails) {
        form.setError("other_referral_details", {
          type: "required",
          message: "Please specify the referral source"
        });
      } else {
        form.clearErrors("other_referral_details");
      }
    }
  }, [referralSource, form]);

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
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Clear other referral details if not selecting "Other"
                    if (value !== "Other") {
                      form.setValue("other_referral_details", "");
                    }
                  }}
                  value={field.value || "_none"}
                  disabled={loading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select referral source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="_none">Not specified</SelectItem>
                    {referralSources.map((source) => (
                      <SelectItem key={source.id} value={source.name}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Important for tracking marketing effectiveness
                </FormDescription>
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
                  <div className="flex items-center gap-2">
                    <FormLabel className="flex items-center">
                      Other Referral Details
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>This information is required when selecting "Other" as the referral source</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
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
