import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getCustomerById, updateCustomer } from '@/services/customer';
import { CustomerFormValues } from '@/components/customers/form/CustomerFormSchema';
import { shops } from '@/components/customers/form/CustomerFormSchema';
import { convertFormVehicleToCustomerVehicle } from '@/types/customer/vehicle';

export function useCustomerEdit(customerId: string | undefined) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formValues, setFormValues] = useState<CustomerFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load customer data
  useEffect(() => {
    const loadCustomer = async () => {
      if (!customerId || customerId === "undefined") {
        setError("Invalid customer ID");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const customer = await getCustomerById(customerId);
        if (!customer) {
          setError("Customer not found");
          return;
        }

        // Convert customer data to form values
        const formData: CustomerFormValues = {
          first_name: customer.first_name || '',
          last_name: customer.last_name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || '',
          city: customer.city || '',
          state: customer.state || '',
          postal_code: customer.postal_code || '',
          country: customer.country || '',
          shop_id: customer.shop_id || '',
          
          // Business info
          company: customer.company || '',
          business_type: customer.business_type || '',
          business_industry: customer.business_industry || '',
          other_business_industry: customer.other_business_industry || '',
          tax_id: customer.tax_id || '',
          business_email: customer.business_email || '',
          business_phone: customer.business_phone || '',
          
          // Payment
          preferred_payment_method: customer.preferred_payment_method || '',
          auto_billing: customer.auto_billing || false,
          credit_terms: customer.credit_terms || '',
          terms_agreed: customer.terms_agreed || false,
          
          // Fleet
          is_fleet: customer.is_fleet || false,
          fleet_company: customer.fleet_company || '',
          fleet_manager: customer.fleet_manager || '',
          fleet_contact: customer.fleet_contact || '',
          preferred_service_type: customer.preferred_service_type || '',
          
          // Preferences
          preferred_technician_id: customer.preferred_technician_id || '',
          communication_preference: customer.communication_preference || '',
          
          // Referral
          referral_source: customer.referral_source || '',
          referral_person_id: customer.referral_person_id || '',
          other_referral_details: customer.other_referral_details || '',
          
          // Household
          household_id: customer.household_id || '',
          create_new_household: false,
          new_household_name: '',
          household_relationship: customer.household_relationship || '',
          
          // Other
          notes: customer.notes || '',
          tags: customer.tags || [],
          segments: customer.segments || [],
          vehicles: customer.vehicles || []
        };

        setFormValues(formData);
      } catch (err: any) {
        console.error('Error loading customer:', err);
        setError(err.message || 'Failed to load customer');
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomer();
  }, [customerId]);

  const handleSubmit = async (data: CustomerFormValues) => {
    if (!customerId || customerId === "undefined") {
      toast({
        title: "Error",
        description: "Invalid customer ID",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Convert form data to customer update format
      const updateData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        postal_code: data.postal_code,
        country: data.country,
        shop_id: data.shop_id,
        
        // Business info
        company: data.company,
        business_type: data.business_type,
        business_industry: data.business_industry,
        other_business_industry: data.other_business_industry,
        tax_id: data.tax_id,
        business_email: data.business_email,
        business_phone: data.business_phone,
        
        // Payment
        preferred_payment_method: data.preferred_payment_method,
        auto_billing: data.auto_billing,
        credit_terms: data.credit_terms,
        terms_agreed: data.terms_agreed,
        
        // Fleet
        is_fleet: data.is_fleet,
        fleet_company: data.fleet_company,
        fleet_manager: data.fleet_manager,
        fleet_contact: data.fleet_contact,
        preferred_service_type: data.preferred_service_type,
        
        // Preferences
        preferred_technician_id: data.preferred_technician_id,
        communication_preference: data.communication_preference,
        
        // Referral
        referral_source: data.referral_source,
        referral_person_id: data.referral_person_id,
        other_referral_details: data.other_referral_details,
        
        // Household
        household_id: data.household_id,
        household_relationship: data.household_relationship,
        
        // Other
        notes: data.notes,
        tags: data.tags,
        segments: data.segments,
        
        // Convert vehicles properly using the conversion function
        vehicles: data.vehicles?.map(vehicle => convertFormVehicleToCustomerVehicle(vehicle)) || []
      };

      await updateCustomer(customerId, updateData);
      
      toast({
        title: "Success",
        description: "Customer updated successfully"
      });
      
      navigate(`/customers/${customerId}`);
    } catch (err: any) {
      console.error('Error updating customer:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to update customer",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formValues,
    isLoading,
    isSubmitting,
    availableShops: shops,
    handleSubmit,
    error
  };
}
