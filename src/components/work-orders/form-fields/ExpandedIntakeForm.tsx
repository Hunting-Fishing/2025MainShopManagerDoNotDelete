import React, { useState, useEffect } from "react";
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
import { Clock, AlertTriangle, User, Car, FileText, Tag, Phone, DollarSign, CheckCircle2 } from "lucide-react";
import { InteractiveVehicleDamageSelector, DamageArea } from "../vehicle/InteractiveVehicleDamageSelector";

interface ExpandedIntakeFormProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
}

const complaintSources = ["Customer", "Fleet Manager", "Warranty Claim", "Insurance", "Other"];
const contactMethods = ["Phone", "Email", "Text", "In-Person"];
const urgencyLevels = [
  { 
    value: "Low", 
    label: "Low Priority", 
    color: "bg-success/20 text-success border-success/30", 
    icon: "🟢",
    bgClass: "bg-success/10",
    textClass: "text-success",
    borderClass: "border-success/20"
  },
  { 
    value: "Normal", 
    label: "Normal Priority", 
    color: "bg-info/20 text-info border-info/30", 
    icon: "🔵",
    bgClass: "bg-info/10", 
    textClass: "text-info",
    borderClass: "border-info/20"
  },
  { 
    value: "Urgent", 
    label: "Urgent", 
    color: "bg-warning/20 text-warning border-warning/30", 
    icon: "🟠",
    bgClass: "bg-warning/10",
    textClass: "text-warning", 
    borderClass: "border-warning/20"
  },
  { 
    value: "Emergency", 
    label: "Emergency", 
    color: "bg-error/20 text-error border-error/30", 
    icon: "🔴",
    bgClass: "bg-error/10",
    textClass: "text-error",
    borderClass: "border-error/20"
  }
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
  const [vehicleDamages, setVehicleDamages] = useState<DamageArea[]>([]);

  // Sync local state with form state changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "serviceTags") {
        setSelectedServiceTags(value.serviceTags || []);
      }
      if (name === "requestedServices") {
        setSelectedRequestedServices(value.requestedServices || []);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Get current urgency level for dynamic styling
  const currentUrgency = form.watch("urgencyLevel");
  const urgencyStyle = urgencyLevels.find(level => level.value === currentUrgency);

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
      <Card className="modern-card hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-subtle rounded-t-xl">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <span className="font-heading">Intake Information</span>
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
                  <FormLabel className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Urgency Level
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className={`${urgencyStyle ? urgencyStyle.color + ' border-2' : ''} transition-all duration-300`}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {urgencyLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{level.icon}</span>
                            <span className="font-medium">{level.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                   {urgencyStyle && (
                    <div className={`flex items-center gap-3 mt-3 px-4 py-3 rounded-xl border-2 ${urgencyStyle.color} transition-all duration-500 shadow-lg ring-2 ring-opacity-50 ${
                      currentUrgency === 'Emergency' ? 'ring-red-500 animate-pulse' : 
                      currentUrgency === 'Urgent' ? 'ring-orange-500' : 
                      currentUrgency === 'Normal' ? 'ring-blue-500' : 'ring-green-500'
                    }`}>
                      <span className="text-xl animate-bounce">{urgencyStyle.icon}</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">CURRENT URGENCY</span>
                        <span className="text-lg font-bold">{urgencyStyle.label}</span>
                      </div>
                      {currentUrgency === 'Emergency' && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                      )}
                    </div>
                  )}
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
      <Card className="modern-card hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-subtle rounded-t-xl">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-lg bg-info/10">
              <Phone className="h-5 w-5 text-info" />
            </div>
            <span className="font-heading">Communication Preferences</span>
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
      <Card className={`modern-card hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 ${selectedRequestedServices.length > 0 ? 'ring-4 ring-info/30 bg-gradient-to-br from-info/5 to-success/5 border-info shadow-xl' : 'hover:ring-4 hover:ring-info/20'}`}>
        <CardHeader className={`${selectedRequestedServices.length > 0 ? 'bg-gradient-to-r from-info/20 to-success/20 shadow-inner' : 'bg-gradient-subtle'} rounded-t-xl transition-all duration-500`}>
          <CardTitle className="flex items-center justify-between text-foreground">
            <div className="flex items-center gap-3">
              <div className={`p-4 rounded-xl ${selectedRequestedServices.length > 0 ? 'bg-gradient-to-r from-info to-success text-white shadow-xl ring-2 ring-white/30' : 'bg-info/10'} transition-all duration-500 hover:scale-105`}>
                <CheckCircle2 className={`h-8 w-8 ${selectedRequestedServices.length > 0 ? 'text-white' : 'text-info'} transition-all duration-500`} />
              </div>
              <div>
                <span className="font-heading text-2xl font-black">Requested Services</span>
                {selectedRequestedServices.length > 0 && (
                  <p className="text-lg text-success font-bold">✓ Services Selected!</p>
                )}
              </div>
            </div>
            {selectedRequestedServices.length > 0 && (
              <Badge className="bg-gradient-to-r from-info to-success text-white border-none shadow-xl px-6 py-3 text-xl font-bold ring-2 ring-white/30 hover:scale-105 transition-all duration-300">
                🎯 {selectedRequestedServices.length} SERVICES
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Select services requested by the customer:</p>
            <div className="flex flex-wrap gap-3">
              {commonRequestedServices.map((service) => {
                const isSelected = selectedRequestedServices.includes(service);
                return (
                  <Button
                    key={service}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRequestedServiceToggle(service)}
                    className={`
                      relative text-lg font-bold transition-all duration-300 hover:scale-105 transform group border-2 shadow-lg
                      ${isSelected 
                        ? 'bg-info text-white border-info shadow-glow ring-4 ring-info/30 hover:shadow-xl hover:bg-info/90' 
                        : 'bg-card hover:bg-info/10 hover:border-info hover:text-info border-border hover:shadow-xl hover:ring-2 hover:ring-info/20'
                      }
                    `}
                  >
                    {isSelected && (
                      <CheckCircle2 className="h-6 w-6 mr-3 text-white drop-shadow-lg" />
                    )}
                    <span className={`${isSelected ? 'font-black text-xl' : 'font-semibold'} group-hover:font-bold transition-all duration-300 uppercase tracking-wider`}>
                      {service}
                    </span>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full shadow-lg"></div>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Tags & Classification */}
      <Card className={`modern-card hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 ${selectedServiceTags.length > 0 ? 'ring-4 ring-warning/30 bg-gradient-to-br from-warning/5 to-success/5 border-warning shadow-xl' : 'hover:ring-4 hover:ring-warning/20'}`}>
        <CardHeader className={`${selectedServiceTags.length > 0 ? 'bg-gradient-to-r from-warning/20 to-success/20 shadow-inner' : 'bg-gradient-subtle'} rounded-t-xl transition-all duration-500`}>
          <CardTitle className="flex items-center justify-between text-foreground">
            <div className="flex items-center gap-3">
              <div className={`p-4 rounded-xl ${selectedServiceTags.length > 0 ? 'bg-gradient-to-r from-warning to-success text-white shadow-xl ring-2 ring-white/30' : 'bg-warning/10'} transition-all duration-500 hover:scale-105`}>
                <Tag className={`h-8 w-8 ${selectedServiceTags.length > 0 ? 'text-white' : 'text-warning'} transition-all duration-500`} />
              </div>
              <div>
                <span className="font-heading text-2xl font-black">Service Classification</span>
                {selectedServiceTags.length > 0 && (
                  <p className="text-lg text-success font-bold">✓ Categories Tagged!</p>
                )}
              </div>
            </div>
            {selectedServiceTags.length > 0 && (
              <Badge className="bg-gradient-to-r from-warning to-success text-white border-none shadow-xl px-6 py-3 text-xl font-bold ring-2 ring-white/30 hover:scale-105 transition-all duration-300">
                🏷️ {selectedServiceTags.length} TAGS
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Tag this work order by service areas:</p>
            <div className="flex flex-wrap gap-3">
              {commonServiceTags.map((tag) => {
                const isSelected = selectedServiceTags.includes(tag);
                return (
                  <Button
                    key={tag}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleServiceTagToggle(tag)}
                    className={`
                      relative text-lg font-bold transition-all duration-300 hover:scale-105 transform group border-2 shadow-lg
                      ${isSelected 
                        ? 'bg-warning text-white border-warning shadow-glow ring-4 ring-warning/30 hover:shadow-xl hover:bg-warning/90' 
                        : 'bg-card hover:bg-warning/10 hover:border-warning hover:text-warning border-border hover:shadow-xl hover:ring-2 hover:ring-warning/20'
                      }
                    `}
                  >
                    {isSelected && (
                      <CheckCircle2 className="h-6 w-6 mr-3 text-white drop-shadow-lg" />
                    )}
                    <span className={`${isSelected ? 'font-black text-xl' : 'font-semibold'} group-hover:font-bold transition-all duration-300 uppercase tracking-wider`}>
                      {tag}
                    </span>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full shadow-lg"></div>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Condition & Additional Info */}
      <Card className="modern-card hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-subtle rounded-t-xl">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-lg bg-success/10">
              <Car className="h-5 w-5 text-success" />
            </div>
            <span className="font-heading">Vehicle Condition & Notes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Interactive Vehicle Damage Selector */}
          <InteractiveVehicleDamageSelector
            bodyStyle="suv"
            damages={vehicleDamages}
            onDamagesChange={setVehicleDamages}
            vehicleInfo={{
              make: form.watch("vehicleMake") || "Unknown",
              model: form.watch("vehicleModel") || "Vehicle", 
              year: form.watch("vehicleYear") || "2023"
            }}
          />

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
      <Card className="modern-card hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-subtle rounded-t-xl">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-lg bg-info/10">
              <User className="h-5 w-5 text-info" />
            </div>
            <span className="font-heading">Technical Notes & Flags</span>
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
                <FormItem className={`
                  flex flex-row items-center justify-between rounded-lg border-2 p-4 transition-all duration-300
                  ${field.value ? 'bg-warning/10 border-warning/30' : 'border-border hover:border-primary/30'}
                `}>
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center gap-2 font-medium">
                      <Clock className="h-4 w-4" />
                      Customer Waiting
                    </FormLabel>
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
                <FormItem className={`
                  flex flex-row items-center justify-between rounded-lg border-2 p-4 transition-all duration-300
                  ${field.value ? 'bg-info/10 border-info/30' : 'border-border hover:border-primary/30'}
                `}>
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="h-4 w-4" />
                      Warranty Work
                    </FormLabel>
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
                <FormItem className={`
                  flex flex-row items-center justify-between rounded-lg border-2 p-4 transition-all duration-300
                  ${field.value ? 'bg-error/10 border-error/30' : 'border-border hover:border-primary/30'}
                `}>
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center gap-2 font-medium">
                      <AlertTriangle className="h-4 w-4" />
                      Repeat Issue
                    </FormLabel>
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