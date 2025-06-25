
import React from 'react';
import { useParams } from 'react-router-dom';
import { CustomerForm } from '@/components/customers/form/CustomerForm';
import { useCustomerEdit } from '@/hooks/useCustomerEdit';
import type { CustomerFormValues } from '@/components/customers/form/schemas/customerSchema';
import { formatVehicleYear } from '@/types/customer/vehicle';

export default function CustomerEdit() {
  const { customerId } = useParams<{ customerId: string }>();
  
  const {
    formValues,
    isLoading,
    isSubmitting,
    availableShops,
    handleSubmit,
    error
  } = useCustomerEdit(customerId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!formValues) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">Customer not found</p>
        </div>
      </div>
    );
  }

  // Transform customer data to match form expected format
  const transformedFormValues: CustomerFormValues = {
    ...formValues,
    // Ensure vehicles array is properly formatted for the form
    vehicles: formValues.vehicles?.map(vehicle => ({
      ...vehicle,
      year: formatVehicleYear(vehicle.year), // Convert number to string if needed
    })) || [],
    // Ensure tags and segments are arrays
    tags: Array.isArray(formValues.tags) ? formValues.tags : [],
    segments: Array.isArray(formValues.segments) ? formValues.segments : [],
    // Set default boolean values if undefined
    is_fleet: formValues.is_fleet || false,
    auto_billing: formValues.auto_billing || false,
    terms_agreed: formValues.terms_agreed || false,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Customer</h1>
        <p className="text-gray-600">Update customer information</p>
      </div>
      
      <CustomerForm
        defaultValues={transformedFormValues}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        availableShops={availableShops}
        isEditMode={true}
        customerId={customerId}
        formId="customer-edit-form"
      />
    </div>
  );
}
