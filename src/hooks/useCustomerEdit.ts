
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerFormValues } from '@/components/customers/form/CustomerFormSchema';
import { useToast } from '@/hooks/use-toast';
import { getCustomerById, updateCustomer } from '@/services/customer';
import { getAllShops } from '@/services/shops/shopService';
import { Customer } from '@/types/customer';
import { handleApiError } from '@/utils/errorHandling';

// Helper function to convert Customer to CustomerFormValues
const customerToFormValues = (customer: Customer): CustomerFormValues => {
  return {
    first_name: customer.first_name,
    last_name: customer.last_name,
    email: customer.email || '',
    phone: customer.phone || '',
    address: customer.address || '',
    city: customer.city || '',
    state: customer.state || '',
    postal_code: customer.postal_code || '',
    country: customer.country || '',
    company: customer.company || '',
    
    // Business details
    business_type: customer.business_type || '',
    business_industry: customer.business_industry || '',
    tax_id: customer.tax_id || '',
    business_email: customer.business_email || '',
    business_phone: customer.business_phone || '',
    
    // Payment & Billing
    preferred_payment_method: customer.preferred_payment_method || '',
    auto_billing: customer.auto_billing || false,
    credit_terms: customer.credit_terms || '',
    terms_agreed: customer.terms_agreed || false,
    
    // Notes
    notes: customer.notes || '',
    
    // Shop
    shop_id: customer.shop_id,
    
    // Tags and segments
    tags: customer.tags || [],
    
    // Preferences
    preferred_technician_id: customer.preferred_technician_id || '',
    communication_preference: customer.communication_preference || '',
    
    // Referral
    referral_source: customer.referral_source || '',
    referral_person_id: customer.referral_person_id || '',
    other_referral_details: customer.other_referral_details || '',
    
    // Household
    household_id: customer.household_id || '',
    
    // Fleet
    is_fleet: customer.is_fleet || false,
    fleet_company: customer.fleet_company || '',
    fleet_manager: customer.fleet_manager || '',
    fleet_contact: customer.fleet_contact || '',
    preferred_service_type: customer.preferred_service_type || '',
    
    // Form-specific fields
    create_new_household: false,
    new_household_name: '',
    household_relationship: '',
    
    // Convert customer vehicles to the expected form schema format
    // Key difference: year is converted from number to string
    vehicles: (customer.vehicles || []).map(vehicle => ({
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year ? String(vehicle.year) : '',
      vin: vehicle.vin || '',
      license_plate: vehicle.license_plate || ''
    })),
    segments: customer.segments || [],
  };
};

export const useCustomerEdit = (customerId?: string) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [formValues, setFormValues] = useState<CustomerFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableShops, setAvailableShops] = useState<Array<{id: string, name: string}>>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Fetch customer and shops data on load
  useEffect(() => {
    const fetchData = async () => {
      if (!customerId) {
        setError("No customer ID provided");
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Load customer data
        const customerData = await getCustomerById(customerId);
        if (!customerData) {
          setError("Customer not found");
          return;
        }
        
        setCustomer(customerData);
        // Convert to form values
        setFormValues(customerToFormValues(customerData));
        
        // Load available shops
        const shops = await getAllShops();
        setAvailableShops(shops.map(shop => ({ id: shop.id, name: shop.name })));
      } catch (err) {
        console.error('Error loading customer:', err);
        setError("Failed to load customer information");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [customerId]);
  
  // Handle form submission
  const handleSubmit = async (formData: CustomerFormValues) => {
    if (!customerId) return;
    
    try {
      setIsSubmitting(true);
      
      // Update customer
      await updateCustomer(customerId, formData);
      
      toast({
        title: "Success",
        description: "Customer information updated successfully.",
      });
      
      // Navigate back to customer details page
      navigate(`/customers/${customerId}`);
    } catch (err) {
      handleApiError(err, "Failed to update customer");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    customer,
    formValues,
    isLoading,
    isSubmitting,
    availableShops,
    handleSubmit,
    error
  };
};
