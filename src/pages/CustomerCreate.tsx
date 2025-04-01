
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCustomer, clearDraftCustomer } from "@/services/customerService";
import type { CustomerCreate as CustomerCreateType } from "@/services/customerService";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/utils/errorHandling";
import { CustomerForm } from "@/components/customers/form/CustomerForm";
import { CustomerFormValues } from "@/components/customers/form/CustomerFormSchema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check } from "lucide-react";
import { WorkOrderFormHeader } from "@/components/work-orders/WorkOrderFormHeader";
import { ImportCustomersDialog } from "@/components/customers/form/import/ImportCustomersDialog";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CustomerCreate() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newCustomerId, setNewCustomerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("personal");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Define default form values
  const defaultValues: CustomerFormValues = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    company: "",
    notes: "",
    shop_id: "DEFAULT-SHOP-ID",
    tags: [],
    preferred_technician_id: "",
    referral_source: "",
    referral_person_id: "",
    is_fleet: false,
    fleet_company: "",
    vehicles: [],
    // New fields for Phase 3
    segments: [],
    create_new_household: false,
    new_household_name: "",
    household_id: "_none", // Changed from empty string to "_none"
    household_relationship: "primary",
  };

  // Form submission handler
  const onSubmit = async (data: CustomerFormValues) => {
    setIsSubmitting(true);
    try {
      // Handle household creation if needed
      let householdId = data.household_id === "_none" ? "" : data.household_id; // Handle the placeholder value
      
      if (data.create_new_household && data.new_household_name) {
        // Create a new household
        const { data: newHousehold, error: householdError } = await supabase
          .from("households")
          .insert({
            name: data.new_household_name,
            address: data.address
          })
          .select("id")
          .single();
        
        if (householdError) {
          throw householdError;
        }
        
        if (newHousehold) {
          householdId = newHousehold.id;
        }
      }
      
      // Convert placeholder values to empty strings/nulls where needed
      const preferredTechnicianId = data.preferred_technician_id === "_none" ? "" : data.preferred_technician_id;
      const referralSource = data.referral_source === "_none" ? "" : data.referral_source;
      
      // Prepare customer data
      const customerData: CustomerCreateType = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || "",
        address: data.address || "",
        shop_id: data.shop_id,
        preferred_technician_id: preferredTechnicianId,
        referral_source: referralSource,
        referral_person_id: data.referral_person_id,
        is_fleet: data.is_fleet,
        fleet_company: data.fleet_company,
        notes: data.notes,
        tags: data.tags,
        household_id: householdId || null,
        segments: data.segments
      };
      
      // Create customer
      const newCustomer = await createCustomer(customerData);
      
      // Add customer to household if a household was selected or created
      if (householdId && data.household_relationship) {
        const { error: relationshipError } = await supabase
          .from("household_members")
          .insert({
            household_id: householdId,
            customer_id: newCustomer.id,
            relationship_type: data.household_relationship
          });
        
        if (relationshipError) {
          console.error("Failed to add customer to household:", relationshipError);
          // Continue despite this error, we'll just log it
        }
      }
      
      // Add customer to segments if any were selected
      if (data.segments && data.segments.length > 0) {
        const segmentAssignments = data.segments.map(segmentId => ({
          customer_id: newCustomer.id,
          segment_id: segmentId,
          is_automatic: false
        }));
        
        const { error: segmentError } = await supabase
          .from("customer_segment_assignments")
          .insert(segmentAssignments);
        
        if (segmentError) {
          console.error("Failed to assign segments to customer:", segmentError);
          // Continue despite this error, we'll just log it
        }
      }
      
      // Clear any draft data
      await clearDraftCustomer();
      
      // Set success state
      setIsSuccess(true);
      setNewCustomerId(newCustomer.id);
      
      // Show success message
      toast({
        title: "Customer Created Successfully",
        description: `${data.first_name} ${data.last_name} has been added to your customers.`,
        variant: "success",
      });
      
      // Redirect after a short delay to allow the user to see the success message
      setTimeout(() => {
        navigate(`/customers/${newCustomer.id}`);
      }, 2000);
    } catch (error) {
      handleApiError(error, "Failed to create customer");
      setIsSubmitting(false);
    }
  };

  const handleImportComplete = () => {
    toast({
      title: "Import Complete",
      description: "Navigate to the Customers page to see imported customers.",
      variant: "success",
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="flex justify-between items-center">
        <WorkOrderFormHeader
          title="Add New Customer"
          description="Create a new customer record in the system"
        />
        <ImportCustomersDialog onImportComplete={handleImportComplete} />
      </div>

      {isSuccess && newCustomerId ? (
        <Alert variant="success" className="bg-green-50 border-green-200">
          <Check className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800 text-lg">Customer Created Successfully</AlertTitle>
          <AlertDescription className="text-green-700">
            The new customer has been added to the system. You will be redirected to the customer details page shortly.
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="p-6">
          <CustomerForm 
            defaultValues={defaultValues} 
            onSubmit={onSubmit} 
            isSubmitting={isSubmitting}
          />
        </Card>
      )}
    </div>
  );
};
