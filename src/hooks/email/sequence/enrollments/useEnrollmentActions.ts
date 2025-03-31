
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { EmailSequenceEnrollment } from '@/types/email';

export const useEnrollmentActions = (
  setEnrollments: (updater: (prev: EmailSequenceEnrollment[]) => EmailSequenceEnrollment[]) => void
) => {
  const { toast } = useToast();

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
  }, [setEnrollments, toast]);

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
  }, [setEnrollments, toast]);

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
  }, [setEnrollments, toast]);

  return {
    pauseEnrollment,
    resumeEnrollment,
    cancelEnrollment
  };
};
