
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { EmailSequenceEnrollment } from '@/types/email';
import { useToast } from '@/hooks/use-toast';

export const useSequenceEnrollments = () => {
  const [enrollments, setEnrollments] = useState<EmailSequenceEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch enrollments for a customer
  const fetchCustomerEnrollments = useCallback(async (customerId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .select('*, sequence:email_sequences(name, description)')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedEnrollments = data.map((enrollment): EmailSequenceEnrollment => {
        // Create the base enrollment object with properties defined in the type
        const enrollmentData: EmailSequenceEnrollment = {
          id: enrollment.id,
          sequence_id: enrollment.sequence_id,
          sequenceId: enrollment.sequence_id,
          customer_id: enrollment.customer_id,
          customerId: enrollment.customer_id,
          status: enrollment.status as 'active' | 'paused' | 'completed' | 'cancelled',
          current_step_id: enrollment.current_step_id,
          currentStepId: enrollment.current_step_id,
          created_at: enrollment.created_at,
          updated_at: enrollment.updated_at,
          completed_at: enrollment.completed_at,
          startedAt: enrollment.created_at,
          completedAt: enrollment.completed_at,
          nextSendTime: enrollment.next_send_time,
          metadata: enrollment.metadata ? (enrollment.metadata as Record<string, any>) : {},
        };

        // Add sequence info to metadata instead of as a direct property
        if (enrollment.sequence?.name) {
          enrollmentData.metadata = {
            ...enrollmentData.metadata,
            sequenceName: enrollment.sequence.name
          };
        }

        return enrollmentData;
      });

      setEnrollments(formattedEnrollments);
      return formattedEnrollments;
    } catch (error) {
      console.error('Error fetching customer enrollments:', error);
      toast({
        title: 'Error fetching enrollments',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Pause an enrollment
  const pauseEnrollment = useCallback(async (enrollmentId: string) => {
    try {
      const { error } = await supabase
        .from('email_sequence_enrollments')
        .update({ status: 'paused' })
        .eq('id', enrollmentId);

      if (error) throw error;

      // Update local state
      setEnrollments(prev => 
        prev.map(enrollment => 
          enrollment.id === enrollmentId 
            ? { ...enrollment, status: 'paused' } 
            : enrollment
        )
      );

      toast({
        title: 'Enrollment paused',
        description: 'The email sequence has been paused.',
      });

      return true;
    } catch (error) {
      console.error('Error pausing enrollment:', error);
      toast({
        title: 'Error pausing enrollment',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  // Resume an enrollment
  const resumeEnrollment = useCallback(async (enrollmentId: string) => {
    try {
      const { error } = await supabase
        .from('email_sequence_enrollments')
        .update({ 
          status: 'active',
          next_send_time: new Date().toISOString()
        })
        .eq('id', enrollmentId);

      if (error) throw error;

      // Update local state
      setEnrollments(prev => 
        prev.map(enrollment => 
          enrollment.id === enrollmentId 
            ? { ...enrollment, status: 'active', nextSendTime: new Date().toISOString() } 
            : enrollment
        )
      );

      toast({
        title: 'Enrollment resumed',
        description: 'The email sequence has been resumed.',
      });

      return true;
    } catch (error) {
      console.error('Error resuming enrollment:', error);
      toast({
        title: 'Error resuming enrollment',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  // Cancel an enrollment
  const cancelEnrollment = useCallback(async (enrollmentId: string) => {
    try {
      const { error } = await supabase
        .from('email_sequence_enrollments')
        .update({ 
          status: 'cancelled',
          next_send_time: null
        })
        .eq('id', enrollmentId);

      if (error) throw error;

      // Update local state
      setEnrollments(prev => 
        prev.map(enrollment => 
          enrollment.id === enrollmentId 
            ? { ...enrollment, status: 'cancelled', nextSendTime: null } 
            : enrollment
        )
      );

      toast({
        title: 'Enrollment cancelled',
        description: 'The email sequence has been cancelled.',
      });

      return true;
    } catch (error) {
      console.error('Error cancelling enrollment:', error);
      toast({
        title: 'Error cancelling enrollment',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

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

  return {
    enrollments,
    loading,
    fetchCustomerEnrollments,
    pauseEnrollment,
    resumeEnrollment,
    cancelEnrollment,
    enrollCustomer
  };
};
