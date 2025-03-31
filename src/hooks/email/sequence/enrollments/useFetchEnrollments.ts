
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { EmailSequenceEnrollment } from '@/types/email';
import { useToast } from '@/hooks/use-toast';

export const useFetchEnrollments = (
  setEnrollments: (enrollments: EmailSequenceEnrollment[]) => void,
  setLoading: (loading: boolean) => void
) => {
  const { toast } = useToast();

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
  }, [setEnrollments, setLoading, toast]);

  return { fetchCustomerEnrollments };
};
