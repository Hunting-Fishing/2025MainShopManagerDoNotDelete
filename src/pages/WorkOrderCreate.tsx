
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm";
import { WorkOrderPageLayout } from "@/components/work-orders/WorkOrderPageLayout";
import { useTechnicians } from "@/hooks/useTechnicians";
import { WorkOrderFormHeader } from "@/components/work-orders/WorkOrderFormHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerSearch } from "@/components/work-orders/customer-select/CustomerSearch";
import { Customer } from "@/types/customer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkOrderStatusSection } from "@/components/work-orders/WorkOrderStatusSection";
import { WorkOrderInfoSection } from "@/components/work-orders/WorkOrderInfoSection";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";

// Simple form schema for the work order
const workOrderFormSchema = z.object({
  serviceCategory: z.string().optional(),
  estimatedHours: z.number().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  // Add other fields as needed
});

type WorkOrderFormValues = z.infer<typeof workOrderFormSchema>;

export default function WorkOrderCreate() {
  const navigate = useNavigate();
  const { technicians, isLoading: isLoadingTechnicians } = useTechnicians();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Initialize the form
  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      serviceCategory: "",
      estimatedHours: 1,
      status: "pending",
      priority: "medium",
    }
  });
  
  // Define service categories for job selection
  const serviceCategories = [
    "Maintenance",
    "Repair",
    "Diagnostic",
    "Installation",
    "Inspection",
    "Tune-Up",
    "Other"
  ];

  // Handle customer selection
  const handleSelectCustomer = (customer: Customer | null) => {
    setSelectedCustomer(customer);
  };
  
  return (
    <WorkOrderPageLayout
      title="Create Work Order"
      description="Create a new work order for your customer"
      backLink="/work-orders"
      backLinkText="Back to Work Orders"
      actions={
        <Button 
          type="submit"
          form="work-order-form"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {isSubmitting ? "Creating..." : "Create Work Order"}
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Customer Selection Section */}
        <Card className="shadow-md border border-gray-100 rounded-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
              <CustomerSearch 
                onSelectCustomer={handleSelectCustomer} 
                selectedCustomer={selectedCustomer} 
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Work Order Details */}
        <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow">
          <WorkOrderFormHeader 
            isSubmitting={isSubmitting}
            error={error}
          />
          
          <div className="p-6 border-t">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="details" className="rounded-full">Details</TabsTrigger>
                <TabsTrigger value="status" className="rounded-full">Status & Priority</TabsTrigger>
                <TabsTrigger value="assignment" className="rounded-full">Assignment</TabsTrigger>
              </TabsList>
              
              <Form {...form}>
                <TabsContent value="details" className="space-y-4">
                  <WorkOrderInfoSection 
                    form={form}
                    serviceCategories={serviceCategories}
                  />
                </TabsContent>
                
                <TabsContent value="status" className="space-y-4">
                  <WorkOrderStatusSection form={form} /> 
                </TabsContent>
                
                <TabsContent value="assignment" className="space-y-4">
                  <p className="text-sm text-muted-foreground">Assign technician on the form below</p>
                </TabsContent>
              </Form>
            </Tabs>
          </div>
          
          <WorkOrderForm 
            technicians={technicians.map(tech => tech.name)} 
            isLoadingTechnicians={isLoadingTechnicians}
            setIsSubmitting={setIsSubmitting}
            setError={setError}
            id="work-order-form"
            selectedCustomer={selectedCustomer}
          />
        </div>
      </div>
    </WorkOrderPageLayout>
  );
}
