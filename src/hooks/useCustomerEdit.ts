
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerFormValues } from '@/components/customers/form/CustomerFormSchema';
import { useToast } from '@/hooks/use-toast';
import { getCustomerById, updateCustomer } from '@/services/customerService';
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
    notes: customer.notes || '',
    shop_id: customer.shop_id,
    tags: customer.tags || [],
    preferred_technician_id: customer.preferred_technician_id || '',
    communication_preference: customer.communication_preference || '',
    referral_source: customer.referral_source || '',
    referral_person_id: customer.referral_person_id || '',
    other_referral_details: customer.other_referral_details || '',
    household_id: customer.household_id || '',
    is_fleet: customer.is_fleet || false,
    fleet_company: customer.fleet_company || '',
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
    create_new_household: false,
    new_household_name: '',
    household_relationship: ''
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
