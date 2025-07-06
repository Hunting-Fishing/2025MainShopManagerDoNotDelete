import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { Clock, AlertTriangle, User, Car, FileText, Tag, Phone, DollarSign } from "lucide-react";

interface ExpandedIntakeFormProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
}

const complaintSources = ["Customer", "Fleet Manager", "Warranty Claim", "Insurance", "Other"];
const contactMethods = ["Phone", "Email", "Text", "In-Person"];
const urgencyLevels = [
  { value: "Low", label: "Low Priority", color: "bg-green-100 text-green-800", icon: "🟢" },
  { value: "Normal", label: "Normal Priority", color: "bg-blue-100 text-blue-800", icon: "🔵" },
  { value: "Urgent", label: "Urgent", color: "bg-orange-100 text-orange-800", icon: "🟠" },
  { value: "Emergency", label: "Emergency", color: "bg-red-100 text-red-800", icon: "🔴" }
];
const dropOffTypes = ["Walk-in", "Appointment", "Tow-in", "Night Drop"];

const commonServiceTags = [
  "Oil Change", "Brake Service", "Engine Repair", "Transmission", "Electrical", 
  "AC/Heating", "Tires", "Suspension", "Diagnostics", "Preventive Maintenance"
];

const commonRequestedServices = [
  "Oil Change", "Multi-point Inspection", "Brake Check", "Battery Test", 
  "Tire Rotation", "Engine Diagnostics", "AC Service", "Transmission Service",
  "Alignment", "State Inspection"
];

export const ExpandedIntakeForm: React.FC<ExpandedIntakeFormProps> = ({ form }) => {
  const [selectedServiceTags, setSelectedServiceTags] = useState<string[]>(
    form.getValues("serviceTags") || []
  );
  const [selectedRequestedServices, setSelectedRequestedServices] = useState<string[]>(
    form.getValues("requestedServices") || []
  );

  const handleServiceTagToggle = (tag: string) => {
    const newTags = selectedServiceTags.includes(tag)
      ? selectedServiceTags.filter(t => t !== tag)
      : [...selectedServiceTags, tag];
    
    setSelectedServiceTags(newTags);
    form.setValue("serviceTags", newTags);
  };

  const handleRequestedServiceToggle = (service: string) => {
    const newServices = selectedRequestedServices.includes(service)
      ? selectedRequestedServices.filter(s => s !== service)
      : [...selectedRequestedServices, service];
    
    setSelectedRequestedServices(newServices);
    form.setValue("requestedServices", newServices);
  };

  return (
    <div className="space-y-6">
      {/* Basic Intake Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Intake Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="complaintSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complaint Source</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {complaintSources.map((source) => (
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

            <FormField
              control={form.control}
              name="dropOffType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Drop-off Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dropOffTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="urgencyLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Urgency Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {urgencyLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div className="flex items-center gap-2">
                            <span>{level.icon}</span>
                            <span>{level.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="initialMileage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Mileage</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      type="number"
                      placeholder="Current odometer reading"
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="authorizationLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Authorization Limit
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="Pre-authorized amount"
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Customer Communication Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Communication Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="preferredContactMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Contact Method</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {contactMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customerInstructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Instructions</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Call before repair, customer will wait, park outside, etc."
                    className="min-h-[80px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Requested Services */}
      <Card>
        <CardHeader>
          <CardTitle>Requested Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Select services requested by the customer:</p>
            <div className="flex flex-wrap gap-2">
              {commonRequestedServices.map((service) => (
                <Button
                  key={service}
                  type="button"
                  variant={selectedRequestedServices.includes(service) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRequestedServiceToggle(service)}
                  className="text-xs"
                >
                  {service}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Tags & Classification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Service Classification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Tag this work order by service areas:</p>
            <div className="flex flex-wrap gap-2">
              {commonServiceTags.map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  variant={selectedServiceTags.includes(tag) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleServiceTagToggle(tag)}
                  className="text-xs"
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Condition & Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Condition & Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="vehicleConditionNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle Condition at Intake</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Note any existing damage, fuel level, warning lights, tire condition, etc."
                    className="min-h-[80px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="additionalInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Information</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Any other relevant observations, context, or non-critical information"
                    className="min-h-[60px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Technical Notes & Flags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Technical Notes & Flags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="diagnosticNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diagnostic Notes</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Internal notes for technicians before starting diagnosis"
                    className="min-h-[60px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="customerWaiting"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Customer Waiting</FormLabel>
                    <div className="text-xs text-muted-foreground">
                      Customer is waiting onsite
                    </div>
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

            <FormField
              control={form.control}
              name="isWarranty"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Warranty Work</FormLabel>
                    <div className="text-xs text-muted-foreground">
                      This is warranty-related
                    </div>
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

            <FormField
              control={form.control}
              name="isRepeatIssue"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Repeat Issue</FormLabel>
                    <div className="text-xs text-muted-foreground">
                      This issue occurred before
                    </div>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};