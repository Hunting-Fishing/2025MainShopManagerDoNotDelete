
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CustomerFormValues } from '@/components/customers/form/schemas/customerSchema';
import { useToast } from '@/hooks/use-toast';
import { getCustomerById, updateCustomer } from '@/services/customer';
import { getAllShops } from '@/services/shops/shopService';
import { Customer } from '@/types/customer';
import { handleApiError } from '@/utils/errorHandling';
import { logCustomerEdit } from '@/services/auditTrail';
import { startPerformanceTimer } from '@/utils/performanceTracking';
import { useAuth } from '@/hooks/useAuth';

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
    other_business_industry: customer.other_business_industry || '',
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
    // Include vehicle ID for proper updates and ensure conversion from number to string for year
    vehicles: (customer.vehicles || []).map(vehicle => ({
      id: vehicle.id || '',
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year ? String(vehicle.year) : '',
      vin: vehicle.vin || '',
      license_plate: vehicle.license_plate || '',
      color: vehicle.color || '',
      
      // Support for additional vehicle details
      transmission: vehicle.transmission || '',
      drive_type: vehicle.drive_type || '',
      fuel_type: vehicle.fuel_type || '',
      engine: vehicle.engine || '',
      body_style: vehicle.body_style || '',
      country: vehicle.country || ''
    })),
    segments: customer.segments || [],
  };
};

export const useCustomerEdit = (customerId?: string) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [formValues, setFormValues] = useState<CustomerFormValues | null>(null);
  const [originalFormValues, setOriginalFormValues] = useState<CustomerFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableShops, setAvailableShops] = useState<Array<{id: string, name: string}>>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const loadAttempts = useRef(0);
  const maxRetries = 3;
  
  // Track if form has been modified
  const [isDirty, setIsDirty] = useState(false);
  
  // Retry loading mechanism
  const retryFetchWithDelay = async (fn: () => Promise<any>, delay: number = 2000) => {
    try {
      return await fn();
    } catch (err) {
      if (loadAttempts.current < maxRetries) {
        loadAttempts.current += 1;
        console.log(`Retrying data fetch attempt ${loadAttempts.current}/${maxRetries}...`);
        return new Promise(resolve => {
          setTimeout(() => resolve(retryFetchWithDelay(fn)), delay);
        });
      }
      throw err;
    }
  };
  
  // Fetch customer and shops data on load
  useEffect(() => {
    const fetchData = async () => {
      if (!customerId) {
        setError("No customer ID provided");
        setIsLoading(false);
        return;
      }
      
      const perfTimer = startPerformanceTimer("customer_data_fetch");
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Load customer data with vehicles included
        const customerData = await retryFetchWithDelay(() => getCustomerById(customerId));
        if (!customerData) {
          setError("Customer not found");
          return;
        }
        
        console.log("Loaded customer data:", customerData);
        
        setCustomer(customerData);
        // Convert to form values
        const formData = customerToFormValues(customerData);
        setFormValues(formData);
        setOriginalFormValues(JSON.parse(JSON.stringify(formData))); // Deep copy for comparison
        console.log("Converted to form values:", formData);
        
        // Load available shops
        const shops = await getAllShops();
        setAvailableShops(shops.map(shop => ({ id: shop.id, name: shop.name })));
      } catch (err) {
        console.error('Error loading customer:', err);
        setError("Failed to load customer information");
      } finally {
        perfTimer.end();
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [customerId]);
  
  // Track form changes
  const trackFormChanges = (formData: CustomerFormValues) => {
    if (!originalFormValues) return false;
    
    // Simple deep comparison to detect changes
    return JSON.stringify(formData) !== JSON.stringify(originalFormValues);
  };
  
  // Handle form submission
  const handleSubmit = async (formData: CustomerFormValues) => {
    if (!customerId || !user) return;
    
    const submitTimer = startPerformanceTimer("customer_form_submit");
    
    try {
      setIsSubmitting(true);
      console.log("Submitting form data with vehicles:", formData.vehicles);
      
      // Record changes for audit log
      const formChanged = trackFormChanges(formData);
      if (formChanged) {
        setIsDirty(true);
      }
      
      // Update customer
      const updatedCustomer = await updateCustomer(customerId, formData);
      
      // Log the edit action to audit trail
      if (formChanged) {
        await logCustomerEdit(customerId, user.id, {
          previous: originalFormValues,
          new: formData
        });
      }
      
      toast({
        title: "Success",
        description: "Customer information updated successfully.",
      });
      
      // Check if we should return to a specific tab
      const tab = searchParams.get('tab');
      
      // Reset dirty state
      setIsDirty(false);
      
      // Navigate back to customer details page
      navigate(`/customers/${customerId}${tab ? `?tab=${tab}` : ''}`);
    } catch (err) {
      handleApiError(err, "Failed to update customer");
    } finally {
      submitTimer.end();
      setIsSubmitting(false);
    }
  };
  
  return {
    customer,
    formValues,
    isLoading,
    isSubmitting,
    isDirty,
    availableShops,
    handleSubmit,
    error,
    setIsDirty
  };
};
