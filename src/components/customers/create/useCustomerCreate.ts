
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { createCustomer, clearDraftCustomer, addCustomerNote } from "@/services/customers";
import { CustomerFormValues } from "@/components/customers/form/CustomerFormSchema";
import { handleApiError } from "@/utils/errorHandling";
import { 
  processHouseholdData, 
  processSegmentAssignments, 
  processHouseholdMembership,
  recordTechnicianPreference,
  prepareCustomerData
} from "./utils/customerFormProcessor";
import {
  showSuccessNotification,
  showWarningNotification,
  showImportCompleteNotification
} from "./utils/customerNotificationHandler";
import { getAllShops, getDefaultShop } from "@/services/shops/shopService";
import { supabase } from "@/integrations/supabase/client";

export const useCustomerCreate = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newCustomerId, setNewCustomerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availableShops, setAvailableShops] = useState<Array<{id: string, name: string}>>([]);
  const [currentUserShopId, setCurrentUserShopId] = useState<string | null>(null);
  const [defaultValues, setDefaultValues] = useState<CustomerFormValues>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    company: "",
    notes: "",
    shop_id: "",
    tags: [],
    preferred_technician_id: "",
    communication_preference: "",
    referral_source: "",
    referral_person_id: "",
    other_referral_details: "",
    is_fleet: false,
    fleet_company: "",
    vehicles: [],
    segments: [],
    create_new_household: false,
    new_household_name: "",
    household_id: "", 
    household_relationship: "primary",
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    async function fetchUserAndShopData() {
      try {
        setIsLoading(true);
        
        // Get the current authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Authentication Error",
            description: "You must be logged in to create customers.",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }
        
        // Get the user's profile to find their shop_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('shop_id')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          toast({
            title: "Error",
            description: "Failed to load user profile. Using default shop.",
            variant: "destructive"
          });
          
          // Fall back to fetching all shops
          const shops = await getAllShops();
          setAvailableShops(shops.map(shop => ({ id: shop.id, name: shop.name })));
          
          // Get default shop for form initialization
          const defaultShop = await getDefaultShop();
          setDefaultValues(prev => ({
            ...prev,
            shop_id: defaultShop.id
          }));
          
          return;
        }
        
        // Set the current user's shop ID
        setCurrentUserShopId(profile.shop_id);
        
        // Get all shops for dropdown (may be limited by RLS)
        const shops = await getAllShops();
        setAvailableShops(shops.map(shop => ({ id: shop.id, name: shop.name })));
        
        // Set the shop_id to the user's shop in the form
        setDefaultValues(prev => ({
          ...prev,
          shop_id: profile.shop_id
        }));
      } catch (error) {
        console.error("Error fetching shop data:", error);
        toast({
          title: "Error",
          description: "Failed to load shop data. Using default values.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserAndShopData();
  }, [toast, navigate]);

  const onSubmit = async (data: CustomerFormValues) => {
    console.log("onSubmit called with data:", data);
    setIsSubmitting(true);
    
    try {
      // Ensure the shop_id is set to the current user's shop
      if (currentUserShopId && (!data.shop_id || data.shop_id === "")) {
        data.shop_id = currentUserShopId;
      }
      
      // Process household logic
      const householdId = await processHouseholdData(data);
      
      // Prepare customer data for creation
      const customerData = prepareCustomerData(data);
      customerData.household_id = householdId;
      
      // Create the customer
      const newCustomer = await createCustomer(customerData);
      
      // Handle post-creation tasks, treating each one independently to avoid cascading failures
      try {
        // Save customer notes if they exist
        if (data.notes && data.notes.trim()) {
          await addCustomerNote(
            newCustomer.id,
            data.notes,
            'general',
            'System'
          );
        }
      } catch (noteError) {
        console.error("Failed to save customer note:", noteError);
        showWarningNotification(toast, "note");
      }
      
      try {
        // Add customer to household if relevant
        if (householdId && data.household_relationship) {
          await processHouseholdMembership(
            newCustomer.id, 
            householdId, 
            data.household_relationship
          );
        }
      } catch (householdError) {
        console.error("Failed to add customer to household:", householdError);
        showWarningNotification(toast, "household");
      }
      
      try {
        // Assign customer segments if any were selected
        if (data.segments && data.segments.length > 0) {
          await processSegmentAssignments(newCustomer.id, data.segments);
        }
      } catch (segmentError) {
        console.error("Failed to assign segments to customer:", segmentError);
        showWarningNotification(toast, "segment");
      }
      
      try {
        // Record technician preference if selected
        if (data.preferred_technician_id && data.preferred_technician_id !== "_none") {
          await recordTechnicianPreference(data.preferred_technician_id);
        }
      } catch (techError) {
        console.error("Error recording technician preference:", techError);
        // Non-critical, no need for user notification
      }
      
      // Clear any draft data
      await clearDraftCustomer();
      
      // Update state
      setIsSuccess(true);
      setNewCustomerId(newCustomer.id);
      
      // Show success notification
      showSuccessNotification(toast, data.first_name, data.last_name);
      
      // Navigate to customer details page after a short delay
      setTimeout(() => {
        navigate(`/customers/${newCustomer.id}`);
      }, 2000);
    } catch (error) {
      handleApiError(error, "Failed to create customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportComplete = () => {
    showImportCompleteNotification(toast);
  };

  return {
    isSubmitting,
    isSuccess,
    isLoading,
    newCustomerId,
    defaultValues,
    availableShops,
    onSubmit,
    handleImportComplete,
  };
};
