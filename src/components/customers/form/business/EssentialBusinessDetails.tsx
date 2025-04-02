
import React, { useEffect } from "react";
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
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Building2,
  Mail,
  Phone
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CustomerFormValues, shops as defaultShops, requiredFields } from "../CustomerFormSchema";
import { RequiredIndicator } from "@/components/ui/required-indicator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { businessTypes, businessIndustries } from "./businessConstants";

interface EssentialBusinessDetailsProps {
  form: UseFormReturn<CustomerFormValues>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  availableShops?: Array<{id: string, name: string}>;
  singleShopMode?: boolean;
}

export const EssentialBusinessDetails: React.FC<EssentialBusinessDetailsProps> = ({
  form,
  isOpen,
  setIsOpen,
  availableShops = defaultShops,
  singleShopMode = false
}) => {
  const businessIndustryValue = form.watch("business_industry");
  const showOtherIndustryField = businessIndustryValue === "other";
  
  // Set validation errors when switching to "other" but not providing a value
  useEffect(() => {
    if (businessIndustryValue === "other") {
      const otherIndustry = form.getValues("other_business_industry");
      if (!otherIndustry || otherIndustry.trim() === "") {
        form.trigger("other_business_industry");
      }
    }
  }, [businessIndustryValue, form]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full border rounded-md p-4 my-4 bg-white">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Essential Business Details</h3>
        </div>
        <CollapsibleTrigger asChild>
          <button className="p-2 hover:bg-slate-100 rounded-md" aria-label="Toggle section">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-4 space-y-4">
        {/* Company/Business Name Field */}
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Business Name</FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>The company or business name associated with this customer</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormControl>
                <Input placeholder="Enter business name" {...field} />
              </FormControl>
              <FormDescription>
                This will appear on invoices and work orders
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Business Type */}
        <FormField
          control={form.control}
          name="business_type"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Business Type</FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>The legal structure of the business</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Business Industry */}
        <FormField
          control={form.control}
          name="business_industry"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Business Industry</FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>The primary industry this business operates in</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select 
                value={field.value || ""} 
                onValueChange={(value) => {
                  field.onChange(value);
                  // Reset other_business_industry when not selecting "other"
                  if (value !== "other") {
                    form.setValue("other_business_industry", "");
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business industry" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {businessIndustries.map((industry) => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Other Business Industry Field - Only shown when "other" is selected */}
        {showOtherIndustryField && (
          <FormField
            control={form.control}
            name="other_business_industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specify Industry <RequiredIndicator /></FormLabel>
                <FormControl>
                  <Input placeholder="Enter specific business industry" {...field} />
                </FormControl>
                <FormDescription>
                  Please specify the business industry
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Tax ID */}
        <FormField
          control={form.control}
          name="tax_id"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Tax ID / GST/HST Number</FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Company tax identification number for billing purposes</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormControl>
                <Input placeholder="Enter tax ID or GST/HST number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Business Email */}
        <FormField
          control={form.control}
          name="business_email"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Business Email</FormLabel>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <FormControl>
                <Input type="email" placeholder="Enter business email" {...field} />
              </FormControl>
              <FormDescription>
                For business communications and invoices
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Business Phone */}
        <FormField
          control={form.control}
          name="business_phone"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Business Phone</FormLabel>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <FormControl>
                <Input placeholder="Enter business phone number" {...field} />
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
                <div className="flex items-center gap-2">
                  <FormLabel>
                    Service Location {requiredFields.shop_id && <RequiredIndicator />}
                  </FormLabel>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>The shop location this customer is associated with</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
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
                <FormDescription>
                  Determines which shop will service this customer
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
