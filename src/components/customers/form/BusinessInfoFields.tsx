
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
  Building2, 
  Truck, 
  Mail, 
  Phone, 
  CreditCard,
  FileText,
  BadgeDollarSign
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CustomerFormValues, shops as defaultShops, requiredFields } from "./CustomerFormSchema";
import { RequiredIndicator } from "@/components/ui/required-indicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface BusinessInfoFieldsProps {
  form: UseFormReturn<CustomerFormValues>;
  availableShops?: Array<{id: string, name: string}>;
  singleShopMode?: boolean;
}

// Business Type options
const businessTypes = [
  { value: "sole_proprietor", label: "Sole Proprietor" },
  { value: "llc", label: "LLC" },
  { value: "corporation", label: "Corporation" },
  { value: "partnership", label: "Partnership" },
  { value: "non_profit", label: "Non-Profit" },
  { value: "other", label: "Other" }
];

// Business Industry options
const businessIndustries = [
  { value: "auto_repair", label: "Auto Repair" },
  { value: "transportation", label: "Transportation" },
  { value: "delivery", label: "Delivery" },
  { value: "construction", label: "Construction" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "retail", label: "Retail" },
  { value: "other", label: "Other" }
];

// Payment method options
const paymentMethods = [
  { value: "credit_card", label: "Credit Card" },
  { value: "ach", label: "ACH/Bank Transfer" },
  { value: "paypal", label: "PayPal" },
  { value: "net30", label: "Net 30" },
  { value: "net60", label: "Net 60" },
  { value: "check", label: "Check" },
  { value: "cash", label: "Cash" }
];

export const BusinessInfoFields: React.FC<BusinessInfoFieldsProps> = ({ 
  form,
  availableShops = defaultShops,
  singleShopMode = false
}) => {
  const [isEssentialInfoOpen, setIsEssentialInfoOpen] = React.useState(true);
  const [isPaymentBillingOpen, setIsPaymentBillingOpen] = React.useState(true);
  const [isFleetOpen, setIsFleetOpen] = React.useState(true);
  const isFleet = form.watch("is_fleet");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Building2 className="h-5 w-5 text-muted-foreground" />
        <CardTitle>Business Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Essential Business Details Section */}
        <Collapsible open={isEssentialInfoOpen} onOpenChange={setIsEssentialInfoOpen} className="w-full border rounded-md p-4 my-4 bg-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Essential Business Details</h3>
            </div>
            <CollapsibleTrigger asChild>
              <button className="p-2 hover:bg-slate-100 rounded-md" aria-label="Toggle section">
                {isEssentialInfoOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
                  <Select value={field.value || ""} onValueChange={field.onChange}>
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

        {/* Payment & Billing Section */}
        <Collapsible open={isPaymentBillingOpen} onOpenChange={setIsPaymentBillingOpen} className="w-full border rounded-md p-4 my-4 bg-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Payment & Billing</h3>
            </div>
            <CollapsibleTrigger asChild>
              <button className="p-2 hover:bg-slate-100 rounded-md" aria-label="Toggle section">
                {isPaymentBillingOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-4 space-y-4">
            {/* Preferred Payment Method */}
            <FormField
              control={form.control}
              name="preferred_payment_method"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Preferred Payment Method</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>Customer's preferred way to pay for services</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Auto-Billing Option */}
            <FormField
              control={form.control}
              name="auto_billing"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <FormLabel>Auto-Billing</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>Automatically charge the customer's payment method for services</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormDescription>
                      Customer agrees to automatic payments for services
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

            {/* Credit Terms */}
            <FormField
              control={form.control}
              name="credit_terms"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Credit Terms</FormLabel>
                    <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select credit terms" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate Payment</SelectItem>
                      <SelectItem value="net15">Net 15</SelectItem>
                      <SelectItem value="net30">Net 30</SelectItem>
                      <SelectItem value="net60">Net 60</SelectItem>
                      <SelectItem value="custom">Custom Terms</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Payment terms for invoices
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* T&C Agreement */}
            <FormField
              control={form.control}
              name="terms_agreed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <FormLabel>Terms & Conditions</FormLabel>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <FormDescription>
                      Customer has agreed to our terms and conditions
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
          </CollapsibleContent>
        </Collapsible>

        {/* Fleet Management Section with improved UI */}
        <Collapsible open={isFleetOpen} onOpenChange={setIsFleetOpen} className="w-full border rounded-md p-4 my-4 bg-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Fleet Management</h3>
            </div>
            <CollapsibleTrigger asChild>
              <button className="p-2 hover:bg-slate-100 rounded-md" aria-label="Toggle section">
                {isFleetOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
      </CardContent>
    </Card>
  );
};
