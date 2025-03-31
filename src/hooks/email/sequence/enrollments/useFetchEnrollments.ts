
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
      
      setEnrollments(data || []);
      return data;
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
