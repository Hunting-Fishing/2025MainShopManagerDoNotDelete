
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { EmailSequenceEnrollment } from '@/types/email';
import { useToast } from '@/hooks/use-toast';

export function useFetchEnrollments(sequenceId?: string) {
  const [enrollments, setEnrollments] = useState<EmailSequenceEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!sequenceId) return;
    
    async function fetchEnrollments() {
      setLoading(true);
      setError(null);
      
      try {
        // @ts-ignore - Using a table that exists in Supabase but not in the TypeScript definitions
        const { data, error } = await supabase
          .from('email_sequence_enrollments')
          .select(`
            *,
            sequence:email_sequences(*),
            current_step:email_sequence_steps(*)
          `)
          .eq('sequence_id', sequenceId);
        
        if (error) throw error;
        
        // Process data to match the expected format
        const processedEnrollments = data.map((item: any) => ({
          id: item.id,
          sequence_id: item.sequence_id,
          customer_id: item.customer_id,
          status: item.status,
          current_step_id: item.current_step_id,
          created_at: item.created_at,
          updated_at: item.updated_at,
          completed_at: item.completed_at,
          sequence: item.sequence.length > 0 ? item.sequence[0] : null,
          current_step: item.current_step.length > 0 ? item.current_step[0] : null,
          nextSendTime: item.next_send_time || null,
          metadata: item.metadata || {},
          // Adding current_step as a number for type compatibility
          current_step_object: item.current_step.length > 0 ? item.current_step[0] : null
        }));
        
        setEnrollments(processedEnrollments);
      } catch (err) {
        console.error('Error fetching enrollments:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch enrollments'));
        toast({
          title: 'Error',
          description: 'Failed to load sequence enrollments',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchEnrollments();
  }, [sequenceId, toast]);

  return { enrollments, loading, error };
}
