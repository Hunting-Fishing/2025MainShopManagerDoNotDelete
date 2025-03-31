
import { useState } from 'react';
import { emailService } from '@/services/email/emailService';
import { EmailSequenceEnrollment } from '@/types/email';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export const useSequenceEnrollments = () => {
  const [enrollments, setEnrollments] = useState<EmailSequenceEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCustomerEnrollments = async (sequenceId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .select('*')
        .eq('sequence_id', sequenceId);

      if (error) throw error;

      // Transform data to match our type and ensure status is correctly typed
      const formattedEnrollments: EmailSequenceEnrollment[] = data.map(enrollment => {
        // Validate that status is one of the allowed values
        let status: 'active' | 'paused' | 'completed' | 'cancelled' = 'active';
        if (enrollment.status === 'paused' || 
            enrollment.status === 'completed' || 
            enrollment.status === 'cancelled') {
          status = enrollment.status;
        }

        return {
          id: enrollment.id,
          sequence_id: enrollment.sequence_id,
          sequenceId: enrollment.sequence_id,
          customer_id: enrollment.customer_id,
          customerId: enrollment.customer_id,
          status: status,
          current_step_id: enrollment.current_step_id,
          currentStepId: enrollment.current_step_id,
          created_at: enrollment.created_at,
          updated_at: enrollment.updated_at,
          completed_at: enrollment.completed_at,
          completedAt: enrollment.completed_at,
          startedAt: enrollment.created_at,
          nextSendTime: enrollment.next_send_time
        };
      });

      setEnrollments(formattedEnrollments);
      return formattedEnrollments;
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch enrollments',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const pauseEnrollment = async (enrollmentId: string) => {
    try {
      const success = await emailService.pauseSequenceEnrollment(enrollmentId);
      if (success) {
        // Update enrollment status in local state
        setEnrollments(prev => 
          prev.map(enrollment => 
            enrollment.id === enrollmentId 
              ? { ...enrollment, status: 'paused' as const } 
              : enrollment
          )
        );
        
        toast({
          title: 'Success',
          description: 'Enrollment paused',
        });
        return true;
      } else {
        toast({
          title: 'Error',
          description: 'Failed to pause enrollment',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Error pausing enrollment:', error);
      toast({
        title: 'Error',
        description: 'Failed to pause enrollment',
        variant: 'destructive',
      });
      return false;
    }
  };

  const resumeEnrollment = async (enrollmentId: string) => {
    try {
      const success = await emailService.resumeSequenceEnrollment(enrollmentId);
      if (success) {
        // Update enrollment status in local state
        setEnrollments(prev => 
          prev.map(enrollment => 
            enrollment.id === enrollmentId 
              ? { ...enrollment, status: 'active' as const } 
              : enrollment
          )
        );
        
        toast({
          title: 'Success',
          description: 'Enrollment resumed',
        });
        return true;
      } else {
        toast({
          title: 'Error',
          description: 'Failed to resume enrollment',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Error resuming enrollment:', error);
      toast({
        title: 'Error',
        description: 'Failed to resume enrollment',
        variant: 'destructive',
      });
      return false;
    }
  };

  const cancelEnrollment = async (enrollmentId: string) => {
    try {
      const success = await emailService.cancelSequenceEnrollment(enrollmentId);
      if (success) {
        // Update enrollment status in local state
        setEnrollments(prev => 
          prev.map(enrollment => 
            enrollment.id === enrollmentId 
              ? { ...enrollment, status: 'cancelled' as const } 
              : enrollment
          )
        );
        
        toast({
          title: 'Success',
          description: 'Enrollment cancelled',
        });
        return true;
      } else {
        toast({
          title: 'Error',
          description: 'Failed to cancel enrollment',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Error cancelling enrollment:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel enrollment',
        variant: 'destructive',
      });
      return false;
    }
  };

  const enrollCustomer = async (sequenceId: string, customerId: string) => {
    try {
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .insert({
          sequence_id: sequenceId,
          customer_id: customerId,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      const newEnrollment: EmailSequenceEnrollment = {
        id: data.id,
        sequence_id: data.sequence_id,
        sequenceId: data.sequence_id,
        customer_id: data.customer_id,
        customerId: data.customer_id,
        status: 'active',
        current_step_id: data.current_step_id,
        currentStepId: data.current_step_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        completed_at: data.completed_at,
        completedAt: data.completed_at,
        startedAt: data.created_at
      };

      setEnrollments(prev => [...prev, newEnrollment]);
      
      toast({
        title: 'Success',
        description: 'Customer enrolled successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error enrolling customer:', error);
      toast({
        title: 'Error',
        description: 'Failed to enroll customer',
        variant: 'destructive',
      });
      return false;
    }
  };

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
