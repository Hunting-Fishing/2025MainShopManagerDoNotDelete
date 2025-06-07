import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { EmailSequence } from '@/types/email';
import { CustomerData } from '@/components/developer/CustomerSelector';
import { useCustomerLoyalty } from '@/hooks/useCustomerLoyalty';
import { supabase } from '@/integrations/supabase/client';

interface UseEnrollCustomerFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useEnrollCustomerForm = ({ onSuccess, onError }: UseEnrollCustomerFormProps = {}) => {
  const [selectedSequence, setSelectedSequence] = useState<EmailSequence | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(false);
  const { customerLoyalty, refreshLoyalty } = useCustomerLoyalty(selectedCustomer?.id);

  const handleSequenceSelect = (sequence: EmailSequence) => {
    setSelectedSequence(sequence);
  };

  const handleCustomerSelect = (customer: CustomerData) => {
    setSelectedCustomer(customer);
  };

  const enrollCustomerInSequence = async () => {
    if (!selectedSequence) {
      toast({
        title: "Error",
        description: "Please select a sequence to enroll the customer in.",
        variant: "destructive",
      });
      onError?.("No sequence selected");
      return;
    }

    if (!selectedCustomer) {
      toast({
        title: "Error",
        description: "Please select a customer to enroll.",
        variant: "destructive",
      });
      onError?.("No customer selected");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .insert({
          sequence_id: selectedSequence.id,
          customer_id: selectedCustomer.id,
          status: 'active',
          started_at: new Date().toISOString(),
          next_send_time: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Customer Enrolled",
        description: "The customer has been enrolled in the sequence successfully.",
      });
      onSuccess?.();
      
      // Refresh customer loyalty data
      await refreshLoyalty();
    } catch (error: any) {
      console.error("Error enrolling customer:", error);
      toast({
        title: "Error",
        description: "Failed to enroll customer in sequence",
        variant: "destructive",
      });
      onError?.(error.message || "Failed to enroll customer");
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedSequence,
    selectedCustomer,
    loading,
    handleSequenceSelect,
    handleCustomerSelect,
    enrollCustomerInSequence,
    setSelectedSequence,
    setSelectedCustomer
  };
};

