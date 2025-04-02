
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerFormValues } from '@/components/customers/form/CustomerFormSchema';
import { useToast } from '@/hooks/use-toast';
import { getCustomerById, updateCustomer } from '@/services/customerService';
import { getAllShops } from '@/services/shops/shopService';
import { Customer } from '@/types/customer';
import { handleApiError } from '@/utils/errorHandling';

export const useCustomerEdit = (customerId?: string) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
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
    isLoading,
    isSubmitting,
    availableShops,
    handleSubmit,
    error
  };
};
