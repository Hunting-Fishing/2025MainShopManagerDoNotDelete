
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Customer } from '@/types/customer';
import { CustomerFormValues } from '@/components/customers/form/CustomerFormSchema';
import { getCustomerById, updateCustomer } from '@/services/customer/customerQueryService';
import { getAllShops } from '@/services/shops';
import { useToast } from '@/hooks/use-toast';
import { formatVehicleYear } from '@/types/customer/vehicle';

export const useCustomerEdit = (customerId?: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formValues, setFormValues] = useState<CustomerFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableShops, setAvailableShops] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch customer data and shops
  useEffect(() => {
    const fetchData = async () => {
      if (!customerId || customerId === "undefined") {
        setError("Invalid customer ID");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const [customerData, shopsData] = await Promise.all([
          getCustomerById(customerId),
          getAllShops()
        ]);

        if (!customerData) {
          setError("Customer not found");
          return;
        }

        setAvailableShops(shopsData || []);

        // Convert customer data to form values
        const formData: CustomerFormValues = {
          first_name: customerData.first_name || '',
          last_name: customerData.last_name || '',
          email: customerData.email || '',
          phone: customerData.phone || '',
          address: customerData.address || '',
          city: customerData.city || '',
          state: customerData.state || '',
          postal_code: customerData.postal_code || '',
          country: customerData.country || '',
          shop_id: customerData.shop_id || '',
          preferred_technician_id: customerData.preferred_technician_id || '',
          communication_preference: customerData.communication_preference || '',
          referral_source: customerData.referral_source || '',
          referral_person_id: customerData.referral_person_id || '',
          other_referral_details: customerData.other_referral_details || '',
          household_id: customerData.household_id || '',
          is_fleet: customerData.is_fleet || false,
          fleet_company: customerData.fleet_company || '',
          fleet_manager: customerData.fleet_manager || '',
          fleet_contact: customerData.fleet_contact || '',
          preferred_service_type: customerData.preferred_service_type || '',
          notes: customerData.notes || '',
          company: customerData.company || '',
          business_type: customerData.business_type || '',
          business_industry: customerData.business_industry || '',
          other_business_industry: customerData.other_business_industry || '',
          tax_id: customerData.tax_id || '',
          business_email: customerData.business_email || '',
          business_phone: customerData.business_phone || '',
          preferred_payment_method: customerData.preferred_payment_method || '',
          auto_billing: customerData.auto_billing || false,
          credit_terms: customerData.credit_terms || '',
          terms_agreed: customerData.terms_agreed || false,
          create_new_household: false,
          new_household_name: '',
          household_relationship: '', // This is form-only, not from customer data
          tags: Array.isArray(customerData.tags) ? customerData.tags : [],
          segments: Array.isArray(customerData.segments) ? customerData.segments : [],
          vehicles: (customerData.vehicles || []).map(vehicle => ({
            id: vehicle.id,
            make: vehicle.make || '',
            model: vehicle.model || '',
            year: formatVehicleYear(vehicle.year), // Convert to string
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
          }))
        };

        setFormValues(formData);

      } catch (err) {
        console.error('Error fetching customer data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load customer data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [customerId]);

  const handleSubmit = async (formData: CustomerFormValues) => {
    if (!customerId) return;

    try {
      setIsSubmitting(true);

      // Convert form data to customer update format, excluding form-only fields
      const updateData: Partial<Customer> = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        country: formData.country,
        shop_id: formData.shop_id,
        preferred_technician_id: formData.preferred_technician_id,
        communication_preference: formData.communication_preference,
        referral_source: formData.referral_source,
        referral_person_id: formData.referral_person_id,
        other_referral_details: formData.other_referral_details,
        household_id: formData.household_id,
        is_fleet: formData.is_fleet,
        fleet_company: formData.fleet_company,
        fleet_manager: formData.fleet_manager,
        fleet_contact: formData.fleet_contact,
        preferred_service_type: formData.preferred_service_type,
        notes: formData.notes,
        company: formData.company,
        business_type: formData.business_type,
        business_industry: formData.business_industry,
        other_business_industry: formData.other_business_industry,
        tax_id: formData.tax_id,
        business_email: formData.business_email,
        business_phone: formData.business_phone,
        preferred_payment_method: formData.preferred_payment_method,
        auto_billing: formData.auto_billing,
        credit_terms: formData.credit_terms,
        terms_agreed: formData.terms_agreed,
        tags: formData.tags,
        segments: formData.segments,
        // Note: vehicles are excluded here as they should be handled separately
        // through the vehicle service if needed
      };

      await updateCustomer(customerId, updateData);

      toast({
        title: "Customer Updated",
        description: "Customer information has been successfully updated.",
      });

      navigate(`/customers/${customerId}`);

    } catch (err) {
      console.error('Error updating customer:', err);
      toast({
        title: "Update Failed",
        description: err instanceof Error ? err.message : "Failed to update customer information.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formValues,
    isLoading,
    isSubmitting,
    availableShops,
    handleSubmit,
    error
  };
};
