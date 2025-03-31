
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { EmailSequenceEnrollment } from '@/types/email';

export const useFetchEnrollments = (
  setEnrollments: React.Dispatch<React.SetStateAction<EmailSequenceEnrollment[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const fetchCustomerEnrollments = async (customerId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .select(`
          *,
          sequence:email_sequences(id, name, description),
          current_step:email_sequence_steps(id, name, template_id, position)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match the EmailSequenceEnrollment type
      const transformedData = data?.map(item => ({
        id: item.id,
        sequence_id: item.sequence_id,
        customer_id: item.customer_id,
        status: item.status as 'active' | 'paused' | 'completed' | 'cancelled',
        current_step_id: item.current_step_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        completed_at: item.completed_at,
        sequence: item.sequence,
        current_step: item.current_step,
        nextSendTime: item.next_send_time,
        metadata: item.metadata
      })) || [];
      
      setEnrollments(transformedData);
      return transformedData;
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setEnrollments([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchCustomerEnrollments
  };
};
