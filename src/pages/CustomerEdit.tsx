
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { CustomerForm } from '@/components/customers/form/CustomerForm';
import { useCustomerEdit } from '@/hooks/useCustomerEdit';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Customer } from '@/types/customer';
import { CustomerFormValues } from '@/components/customers/form/schemas/customerSchema';

// Convert Customer to CustomerFormValues with proper type conversion
const convertCustomerToFormValues = (customer: Customer): CustomerFormValues => {
  return {
    first_name: customer.first_name || '',
    last_name: customer.last_name || '',
    email: customer.email || '',
    phone: customer.phone || '',
    address: customer.address || '',
    city: customer.city || '',
    state: customer.state || '',
    postal_code: customer.postal_code || '',
    country: customer.country || '',
    company: customer.company || '',
    business_type: customer.business_type || '',
    business_industry: customer.business_industry || '',
    other_business_industry: customer.other_business_industry || '',
    tax_id: customer.tax_id || '',
    business_email: customer.business_email || '',
    business_phone: customer.business_phone || '',
    preferred_payment_method: customer.preferred_payment_method || '',
    auto_billing: customer.auto_billing || false,
    credit_terms: customer.credit_terms || '',
    terms_agreed: customer.terms_agreed || false,
    is_fleet: customer.is_fleet || false,
    fleet_company: customer.fleet_company || '',
    fleet_manager: customer.fleet_manager || '',
    fleet_contact: customer.fleet_contact || '',
    preferred_service_type: customer.preferred_service_type || '',
    notes: customer.notes || '',
    shop_id: customer.shop_id || '',
    preferred_technician_id: customer.preferred_technician_id || '',
    communication_preference: customer.communication_preference || '',
    referral_source: customer.referral_source || '',
    referral_person_id: customer.referral_person_id || '',
    other_referral_details: customer.other_referral_details || '',
    household_id: customer.household_id || '',
    create_new_household: false,
    new_household_name: '',
    household_relationship: '',
    vehicles: (customer.vehicles || []).map(vehicle => ({
      id: vehicle.id,
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: typeof vehicle.year === 'number' ? vehicle.year.toString() : (vehicle.year || ''),
      vin: vehicle.vin || '',
      license_plate: vehicle.license_plate || '',
      trim: vehicle.trim || '',
      transmission: vehicle.transmission || '',
      drive_type: vehicle.drive_type || '',
      fuel_type: vehicle.fuel_type || '',
      engine: vehicle.engine || '',
      body_style: vehicle.body_style || '',
      country: vehicle.country || '',
      transmission_type: vehicle.transmission_type || '',
      gvwr: vehicle.gvwr || '',
      color: vehicle.color || ''
    })),
    tags: Array.isArray(customer.tags) ? customer.tags : [],
    segments: Array.isArray(customer.segments) ? customer.segments : []
  };
};

export default function CustomerEdit() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  
  const {
    formValues,
    isLoading,
    isSubmitting,
    availableShops,
    handleSubmit,
    error
  } = useCustomerEdit(customerId);

  if (!customerId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Invalid customer ID. Please check the URL and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading customer: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!formValues) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Customer not found. The customer may have been deleted or you may not have permission to edit it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const customerName = `${formValues.first_name} ${formValues.last_name}`.trim();
  const convertedFormValues = convertCustomerToFormValues(formValues);

  return (
    <>
      <Helmet>
        <title>Edit {customerName} | ServicePro</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/customers/${customerId}`)} 
            className="mb-4"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Customer Details
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Customer</h1>
            <p className="text-muted-foreground">
              Update {customerName}'s information
            </p>
          </div>
        </div>

        {/* Form */}
        <CustomerForm
          defaultValues={convertedFormValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          availableShops={availableShops}
          singleShopMode={availableShops.length === 1}
          isEditMode={true}
          customerId={customerId}
          initialTab="personal"
          formId="customer-edit-form"
        />
      </div>
    </>
  );
}
