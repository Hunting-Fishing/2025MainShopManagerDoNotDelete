
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { EmailSequenceEnrollment } from '@/types/email';
import { useToast } from '@/hooks/use-toast';
import { emailService } from '@/services/email';

/**
 * Hook for enrolling customers in email sequences
 */
export const useEnrollCustomer = (
  refreshEnrollments: (customerId: string) => Promise<EmailSequenceEnrollment[]>
) => {
  const [enrolling, setEnrolling] = useState(false);
  const { toast } = useToast();
  
  /**
   * Enrolls a customer in a sequence
   * @param sequenceId The sequence ID to enroll in
   * @param customerId The customer ID to enroll
   * @returns Promise<boolean> indicating success or failure
   */
  const enrollCustomer = async (sequenceId: string, customerId: string): Promise<boolean> => {
    setEnrolling(true);
    
    try {
      // Create enrollment record in the database
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .insert({
          sequence_id: sequenceId,
          customer_id: customerId,
          status: 'active',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Refresh the enrollments list
      await refreshEnrollments(customerId);
      
      // Trigger the sequence processing to start sending emails
      await emailService.triggerSequenceProcessing(sequenceId);
      
      toast({
        title: "Success",
        description: "Customer successfully enrolled in the sequence",
      });
      
      return true;
    } catch (error) {
      console.error("Error enrolling customer:", error);
      toast({
        title: "Error",
        description: "Failed to enroll customer in sequence",
        variant: "destructive",
      });
      return false;
    } finally {
      setEnrolling(false);
    }
  };
  
  return {
    enrollCustomer,
    enrolling
  };
};
