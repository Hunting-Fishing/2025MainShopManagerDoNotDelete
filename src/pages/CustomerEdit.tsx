
import React from 'react';
import { useParams } from 'react-router-dom';
import { CustomerForm } from '@/components/customers/form/CustomerForm';
import { useCustomerEdit } from '@/hooks/useCustomerEdit';
import { CustomerFormValues } from '@/components/customers/form/CustomerFormSchema';
import { Customer } from '@/types/customer';

// Transform Customer data to CustomerFormValues format
const transformCustomerToFormValues = (customer: Customer): CustomerFormValues => {
  return {
    // Personal Info
    first_name: customer.first_name || "",
    last_name: customer.last_name || "",
    email: customer.email || "",
    phone: customer.phone || "",
    
    // Address
    address: customer.address || "",
    city: customer.city || "",
    state: customer.state || "",
    postal_code: customer.postal_code || "",
    country: customer.country || "",
    
    // Business Info
    company: customer.company || "",
    business_type: customer.business_type || "",
    business_industry: customer.business_industry || "",
    other_business_industry: customer.other_business_industry || "",
    tax_id: customer.tax_id || "",
    business_email: customer.business_email || "",
    business_phone: customer.business_phone || "",
    
    // Payment & Billing
    preferred_payment_method: customer.preferred_payment_method || "",
    auto_billing: customer.auto_billing || false,
    credit_terms: customer.credit_terms || "",
    terms_agreed: customer.terms_agreed || false,
    
    // Fleet Management
    is_fleet: customer.is_fleet || false,
    fleet_company: customer.fleet_company || "",
    fleet_manager: customer.fleet_manager || "",
    fleet_contact: customer.fleet_contact || "",
    preferred_service_type: customer.preferred_service_type || "",
    
    // Notes
    notes: customer.notes || "",
    
    // Shop assignment
    shop_id: customer.shop_id || "",
    
    // Preferences
    preferred_technician_id: customer.preferred_technician_id || "",
    communication_preference: customer.communication_preference || "",
    
    // Referral
    referral_source: customer.referral_source || "",
    referral_person_id: customer.referral_person_id || "",
    other_referral_details: customer.other_referral_details || "",
    
    // Household
    household_id: customer.household_id || "",
    create_new_household: false,
    new_household_name: "",
    household_relationship: "",
    
    // Arrays - ensure they're properly formatted
    vehicles: customer.vehicles ? customer.vehicles.map(vehicle => ({
      ...vehicle,
      year: vehicle.year ? vehicle.year.toString() : "" // Ensure year is string
    })) : [],
    tags: Array.isArray(customer.tags) ? customer.tags : [],
    segments: Array.isArray(customer.segments) ? customer.segments : []
  };
};

const CustomerEdit = () => {
  const { id } = useParams();
  const { formValues, isLoading, isSubmitting, availableShops, handleSubmit, error } = useCustomerEdit(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!formValues) {
    return (
      <div className="p-4 text-gray-600">
        Customer not found.
      </div>
    );
  }

  const defaultValues = transformCustomerToFormValues(formValues);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Edit Customer</h1>
      <CustomerForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        availableShops={availableShops}
        isEditMode={true}
        customerId={id}
      />
    </div>
  );
};

export default CustomerEdit;
