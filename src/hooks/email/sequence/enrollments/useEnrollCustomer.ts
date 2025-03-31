
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { sequenceProcessingService } from '@/services/email/sequenceProcessingService';

export interface EnrollCustomerParams {
  customerId: string;
  sequenceId: string;
  personalizations?: Record<string, string>;
  segmentData?: Record<string, string>;
  metadata?: Record<string, any>;
}

export const useEnrollCustomer = (onEnrollmentComplete?: (customerId: string) => void) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const enrollCustomer = async ({
    customerId,
    sequenceId,
    personalizations = {},
    segmentData = {},
    metadata = {}
  }: EnrollCustomerParams) => {
    setLoading(true);
    
    try {
      // Create the enrollment record
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .insert({
          sequence_id: sequenceId,
          customer_id: customerId,
          status: 'active',
          next_send_time: new Date().toISOString(),
          metadata: {
            personalizations,
            segmentData,
            ...metadata
          }
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Show success message
      toast({
        title: 'Customer Enrolled',
        description: 'The customer has been enrolled in the sequence successfully.',
      });
      
      // Trigger immediate processing of the sequence
      try {
        // Pass the sequenceId as an object with the correct shape
        await sequenceProcessingService.triggerSequenceProcessing({ 
          sequenceId: sequenceId 
        });
      } catch (processError) {
        console.error('Error triggering sequence processing:', processError);
        // Non-critical error, don't throw
      }
      
      // Call the success callback if provided
      if (onEnrollmentComplete) {
        onEnrollmentComplete(customerId);
      }
      
      return data;
    } catch (error) {
      console.error('Error enrolling customer:', error);
      toast({
        title: 'Error',
        description: 'Failed to enroll customer in sequence',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    enrollCustomer,
    loading
  };
};
