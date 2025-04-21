
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export function useCustomerAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [customer, setCustomer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial auth state
    const getInitialUser = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        // If user is logged in, fetch their customer profile
        if (user) {
          const { data: customerData, error } = await supabase
            .from('customers')
            .select('*')
            .eq('auth_user_id', user.id)
            .single();
            
          if (error && error.code !== 'PGRST116') {
            console.error("Error fetching customer data:", error);
          }
          
          if (customerData) {
            setCustomer(customerData);
          }
        }
      } catch (error) {
        console.error("Error in customer auth:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialUser();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      
      if (session?.user) {
        const { data: customerData, error } = await supabase
          .from('customers')
          .select('*')
          .eq('auth_user_id', session.user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching customer data:", error);
        }
        
        if (customerData) {
          setCustomer(customerData);
        } else {
          setCustomer(null);
        }
      } else {
        setCustomer(null);
      }
    });
    
    // Return cleanup function
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Function to link customer to auth user
  const linkCustomerToUser = async (customerId: string) => {
    if (!user) {
      toast({
        title: "Authentication Error", 
        description: "You must be logged in to link a customer account",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Check if customer exists
      const { data: customerData, error: fetchError } = await supabase
        .from('customers')
        .select('id, auth_user_id')
        .eq('id', customerId)
        .single();
      
      if (fetchError) {
        toast({
          title: "Customer Not Found", 
          description: "The provided customer ID does not exist",
          variant: "destructive"
        });
        return false;
      }
      
      if (customerData.auth_user_id) {
        toast({
          title: "Already Linked", 
          description: "This customer account is already linked to another user",
          variant: "destructive"
        });
        return false;
      }
      
      // Link customer to auth user
      const { error: updateError } = await supabase
        .from('customers')
        .update({ auth_user_id: user.id })
        .eq('id', customerId);
        
      if (updateError) {
        toast({
          title: "Link Failed", 
          description: "Failed to link customer account",
          variant: "destructive"
        });
        return false;
      }
      
      // Refetch customer data
      const { data: updatedCustomer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();
        
      setCustomer(updatedCustomer);
      
      toast({
        title: "Success", 
        description: "Customer account linked successfully",
        variant: "default"
      });
      
      return true;
    } catch (error) {
      console.error("Error linking customer:", error);
      toast({
        title: "Error", 
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  // Function to unlink customer from auth user
  const unlinkCustomer = async () => {
    if (!user || !customer) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('customers')
        .update({ auth_user_id: null })
        .eq('id', customer.id);
        
      if (error) {
        toast({
          title: "Unlink Failed", 
          description: "Failed to unlink customer account",
          variant: "destructive"
        });
        return false;
      }
      
      setCustomer(null);
      
      toast({
        title: "Success", 
        description: "Customer account unlinked successfully",
        variant: "default"
      });
      
      return true;
    } catch (error) {
      console.error("Error unlinking customer:", error);
      toast({
        title: "Error", 
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    user,
    customer,
    loading,
    isAuthenticated: !!user,
    hasCustomerAccount: !!customer,
    linkCustomerToUser,
    unlinkCustomer,
  };
}
