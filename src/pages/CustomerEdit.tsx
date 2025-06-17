import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CustomerForm } from "@/components/customers/form/CustomerForm";
import { useToast } from "@/hooks/use-toast";
import { useCustomerEdit } from "@/hooks/useCustomerEdit";
import { DeleteCustomerButton } from "@/components/customers/form/DeleteCustomerButton";
import { Customer } from "@/types/customer";
import { CustomerFormValues } from "@/components/customers/form/CustomerFormSchema";
import { formatVehicleYear } from "@/types/customer/vehicle";

// Transform Customer to CustomerFormValues
const transformCustomerToFormValues = (customer: Customer): CustomerFormValues => {
  const transformedVehicles = customer.vehicles?.map(vehicle => ({
    id: vehicle.id,
    make: vehicle.make || '',
    model: vehicle.model || '',
    year: formatVehicleYear(vehicle.year), // Ensure year is always a string
    vin: vehicle.vin || '',
    license_plate: vehicle.license_plate || '',
    trim: vehicle.trim || '',
    transmission: vehicle.transmission || '',
    transmission_type: vehicle.transmission_type || '',
    drive_type: vehicle.drive_type || '',
    fuel_type: vehicle.fuel_type || '',
    engine: vehicle.engine || '',
    body_style: vehicle.body_style || '',
    country: vehicle.country || '',
    gvwr: vehicle.gvwr || '',
    color: vehicle.color || '',
    // Decoded fields for VIN decoder
    decoded_make: '',
    decoded_model: '',
    decoded_year: '',
    decoded_transmission: '',
    decoded_fuel_type: '',
    decoded_engine: '',
    decoded_body_style: '',
    decoded_country: '',
    decoded_trim: '',
    decoded_gvwr: ''
  })) || [];

  return {
    // Personal Information
    first_name: customer.first_name || '',
    last_name: customer.last_name || '',
    email: customer.email || '',
    phone: customer.phone || '',
    
    // Address
    address: customer.address || '',
    city: customer.city || '',
    state: customer.state || '',
    postal_code: customer.postal_code || '',
    country: customer.country || '',
    
    // Business Information
    company_name: customer.company_name || '',
    business_type: customer.business_type || '',
    industry: customer.industry || '',
    
    // Contact Preferences
    preferred_contact_method: customer.preferred_contact_method || '',
    communication_preferences: Array.isArray(customer.communication_preferences) ? customer.communication_preferences : [],
    
    // Additional Information
    date_of_birth: customer.date_of_birth || '',
    gender: customer.gender || '',
    occupation: customer.occupation || '',
    
    // Customer Relationship
    customer_since: customer.customer_since || '',
    customer_type: customer.customer_type || 'individual',
    referral_source: customer.referral_source || '',
    
    // Marketing
    marketing_consent: customer.marketing_consent || false,
    newsletter_subscription: customer.newsletter_subscription || false,
    
    // Tags and Segments
    tags: Array.isArray(customer.tags) ? customer.tags : [],
    segments: Array.isArray(customer.segments) ? customer.segments : [],
    
    // Internal Notes
    notes: customer.notes || '',
    internal_notes: customer.internal_notes || '',
    
    // Vehicles
    vehicles: transformedVehicles,
    
    // Shop Association
    shop_id: customer.shop_id || '',
    
    // Emergency Contact
    emergency_contact_name: customer.emergency_contact_name || '',
    emergency_contact_phone: customer.emergency_contact_phone || '',
    emergency_contact_relationship: customer.emergency_contact_relationship || '',
    
    // Billing Information
    billing_address: customer.billing_address || '',
    billing_city: customer.billing_city || '',
    billing_state: customer.billing_state || '',
    billing_postal_code: customer.billing_postal_code || '',
    billing_country: customer.billing_country || '',
    
    // Payment Information
    preferred_payment_method: customer.preferred_payment_method || '',
    credit_limit: customer.credit_limit || 0,
    
    // Account Status
    is_active: customer.is_active !== undefined ? customer.is_active : true,
    account_status: customer.account_status || 'active',
    
    // Household Information (form-specific, not from database)
    household_size: 1,
    household_income_range: '',
    household_relationship: '',
  } as CustomerFormValues;
};

export default function CustomerEdit() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const {
    formValues,
    isLoading,
    isSubmitting,
    availableShops,
    handleSubmit,
    error
  } = useCustomerEdit(id);

  if (!id) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link to="/customers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customers
            </Button>
          </Link>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            No customer ID provided. Please select a customer to edit.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link to="/customers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customers
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading customer details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link to="/customers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customers
            </Button>
          </Link>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!formValues) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link to="/customers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customers
            </Button>
          </Link>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Customer not found or unable to load customer data.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const customerName = `${formValues.first_name} ${formValues.last_name}`;
  
  // Transform the customer data to match form expectations
  const transformedFormValues = transformCustomerToFormValues(formValues);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/customers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customers
            </Button>
          </Link>
          <Link to={`/customers/${id}`}>
            <Button variant="ghost" size="sm">
              View Customer
            </Button>
          </Link>
        </div>
        <DeleteCustomerButton 
          customerId={id}
          customerName={customerName}
        />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Edit Customer</h1>
      <CustomerForm 
        defaultValues={transformedFormValues}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        availableShops={availableShops}
      />
    </div>
  );
}
