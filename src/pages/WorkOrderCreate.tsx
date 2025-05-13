
import React, { useState } from "react";
import { WorkOrderPageLayout } from "@/components/work-orders/WorkOrderPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerSearch } from "@/components/work-orders/customer-select/CustomerSearch";
import { Customer } from "@/types/customer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkOrderForm } from "@/hooks/useWorkOrderForm";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { AssignmentSection } from "@/components/work-orders/AssignmentSection";
import { CustomerInfoSection } from "@/components/work-orders/CustomerInfoSection";
import { NotesField } from "@/components/work-orders/form-fields/NotesField";
import { useNavigate } from "react-router-dom";
import { useTechnicians } from "@/hooks/useTechnicians";
import { ServiceMainCategory } from "@/types/serviceHierarchy";

// Sample service categories for selection
const serviceCategories: ServiceMainCategory[] = [
  {
    id: "maintenance",
    name: "Maintenance",
    description: "Regular maintenance services",
    subcategories: [
      {
        id: "regular",
        name: "Regular Services",
        jobs: [
          { id: "oil", name: "Oil Change" },
          { id: "filter", name: "Filter Replacement" },
          { id: "inspection", name: "General Inspection" }
        ]
      }
    ]
  },
  {
    id: "repair",
    name: "Repair",
    description: "Vehicle repair services",
    subcategories: [
      {
        id: "engine",
        name: "Engine Repairs",
        jobs: [
          { id: "tune", name: "Engine Tune-up" },
          { id: "diagnostic", name: "Engine Diagnostic" }
        ]
      }
    ]
  }
];

export default function WorkOrderCreate() {
  const navigate = useNavigate();
  const { technicians, isLoading: isLoadingTechnicians } = useTechnicians();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Initialize the form with useWorkOrderForm hook
  const { form, onSubmit, isSubmitting, error } = useWorkOrderForm();
  
  // Handle customer selection
  const handleSelectCustomer = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    
    if (customer) {
      // Update form values with customer information
      form.setValue("customer", `${customer.first_name} ${customer.last_name}`);
      form.setValue("customer_id", customer.id);
      
      // If customer has an address, use it as the location
      if (customer.address) {
        form.setValue("location", customer.address);
      }
    }
  };
  
  // Handle cancel button click
  const handleCancel = () => {
    navigate("/work-orders");
  };
  
  return (
    <WorkOrderPageLayout
      title="Create Work Order"
      description="Create a new work order for your customer"
      backLink="/work-orders"
      backLinkText="Back to Work Orders"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Work Order Details</h2>
              <p className="text-sm text-muted-foreground mt-1">Fill in the details of the work order</p>
            </div>
            
            <div className="p-6">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="details" className="rounded-full">Details</TabsTrigger>
                  <TabsTrigger value="assignment" className="rounded-full">Assignment</TabsTrigger>
                  <TabsTrigger value="notes" className="rounded-full">Notes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <CustomerInfoSection 
                    form={form} 
                    customers={selectedCustomer ? [selectedCustomer] : []} 
                    isLoading={false}
                  />
                </TabsContent>
                
                <TabsContent value="assignment" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AssignmentSection 
                      form={form} 
                      technicians={technicians.map(tech => ({ id: tech.id || '_unassigned', name: tech.name }))}
                      isLoading={isLoadingTechnicians}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="notes" className="space-y-4">
                  <div className="grid gap-6">
                    <NotesField form={form} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Form Actions */}
            <div className="p-6 border-t flex justify-end space-x-4">
              <Button 
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="rounded-full px-6 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? "Creating..." : "Create Work Order"}
              </Button>
            </div>
          </div>
          
          {/* Error message display */}
          {error && (
            <div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
              {error}
            </div>
          )}
        </form>
      </Form>
    </WorkOrderPageLayout>
  );
}
