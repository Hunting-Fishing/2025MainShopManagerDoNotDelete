
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
          defaultValues={formValues}
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
