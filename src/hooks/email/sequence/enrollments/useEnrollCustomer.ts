
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useEnrollCustomer = (fetchCustomerEnrollments: (customerId: string) => Promise<any>) => {
  const { toast } = useToast();

  // Enroll a customer with advanced personalization and segmentation
  const enrollCustomer = useCallback(async (
    sequenceId: string, 
    customerId: string, 
    personalizations?: Record<string, any>,
    segmentData?: Record<string, any>,
    metadata?: Record<string, any>
  ) => {
    try {
      // Check if customer is already enrolled in the sequence
      const { data: existingEnrollments, error: checkError } = await supabase
        .from('email_sequence_enrollments')
        .select('id, status')
        .eq('sequence_id', sequenceId)
        .eq('customer_id', customerId)
        .in('status', ['active', 'paused']);

      if (checkError) throw checkError;

      // If customer is already enrolled, return existing enrollment
      if (existingEnrollments && existingEnrollments.length > 0) {
        toast({
          title: 'Already enrolled',
          description: 'Customer is already enrolled in this sequence.',
          variant: 'default',
        });
        return existingEnrollments[0].id;
      }

      // Get sequence info to determine first step
      const { data: sequence, error: sequenceError } = await supabase
        .from('email_sequences')
        .select('*, steps:email_sequence_steps(*)')
        .eq('id', sequenceId)
        .single();

      if (sequenceError) throw sequenceError;

      if (!sequence.steps || sequence.steps.length === 0) {
        throw new Error('Sequence has no steps defined');
      }

      // Sort steps by position to ensure order
      const sortedSteps = [...sequence.steps].sort((a, b) => a.position - b.position);
      const firstStep = sortedSteps[0];

      // Calculate next send time based on the first step's delay
      let nextSendTime = new Date();
      if (firstStep.delay_hours && firstStep.delay_hours > 0) {
        nextSendTime.setHours(nextSendTime.getHours() + firstStep.delay_hours);
        
        // If business days only, adjust for weekends
        if (firstStep.delay_type === 'business_days') {
          while (nextSendTime.getDay() === 0 || nextSendTime.getDay() === 6) {
            nextSendTime.setDate(nextSendTime.getDate() + 1);
          }
        }
      }

      // Prepare combined metadata with personalization and segment data
      const combinedMetadata = {
        ...metadata || {},
        personalizations: personalizations || {},
        segmentData: segmentData || {},
        enrolledAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
      };

      // Create enrollment
      const { data: enrollment, error: enrollError } = await supabase
        .from('email_sequence_enrollments')
        .insert({
          sequence_id: sequenceId,
          customer_id: customerId,
          status: 'active',
          current_step_id: null, // Will be set after first step is processed
          next_send_time: nextSendTime.toISOString(),
          metadata: combinedMetadata
        })
        .select()
        .single();

      if (enrollError) throw enrollError;

      // Process sequence immediately if configured to do so
      if (sequence.trigger_type === 'manual' && firstStep.delay_hours === 0) {
        // Trigger immediate processing
        try {
          await supabase.functions.invoke('process-email-sequences', {
            body: { 
              sequenceId: sequenceId, 
              action: 'process' 
            }
          });
        } catch (processError) {
          console.error('Error triggering sequence processing:', processError);
          // Continue despite error - the scheduled processing will handle it later
        }
      }

      toast({
        title: 'Customer enrolled',
        description: `Customer has been enrolled in "${sequence.name}" sequence.`,
      });

      // Update local state
      fetchCustomerEnrollments(customerId);

      return enrollment.id;
    } catch (error) {
      console.error('Error enrolling customer:', error);
      toast({
        title: 'Error enrolling customer',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  }, [fetchCustomerEnrollments, toast]);

  return { enrollCustomer };
};
