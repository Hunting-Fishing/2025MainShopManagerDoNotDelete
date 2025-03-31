
import { useState } from 'react';
import { EmailSequenceAnalytics } from '@/types/email';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useSequenceAnalytics = () => {
  const [analytics, setAnalytics] = useState<EmailSequenceAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const { toast } = useToast();

  const fetchSequenceAnalytics = async (sequenceId: string) => {
    setAnalyticsLoading(true);
    try {
      // First try to get from the analytics table
      const { data, error } = await supabase
        .from('email_sequence_analytics')
        .select('*')
        .eq('sequence_id', sequenceId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setAnalytics({
          id: data.id,
          sequenceId: data.sequence_id,
          sequence_id: data.sequence_id,
          totalEnrollments: data.total_enrollments,
          total_enrollments: data.total_enrollments,
          activeEnrollments: data.active_enrollments,
          active_enrollments: data.active_enrollments,
          completedEnrollments: data.completed_enrollments,
          completed_enrollments: data.completed_enrollments,
          conversionRate: data.conversion_rate,
          conversion_rate: data.conversion_rate,
          averageTimeToComplete: data.average_time_to_complete,
          average_time_to_complete: data.average_time_to_complete,
          updatedAt: data.updated_at,
          updated_at: data.updated_at
        });
      } else {
        // If no analytics exist yet, request an analytics update via the edge function
        try {
          const response = await supabase.functions.invoke('process-email-sequences', {
            body: { sequenceId, action: 'updateAnalytics' }
          });
          
          if (response.error) {
            console.error("Error updating analytics:", response.error);
          } else if (response.data?.analytics) {
            // The function returns the analytics it created
            const newAnalytics = response.data.analytics;
            setAnalytics({
              id: newAnalytics.id,
              sequenceId: newAnalytics.sequence_id,
              sequence_id: newAnalytics.sequence_id,
              totalEnrollments: newAnalytics.total_enrollments,
              total_enrollments: newAnalytics.total_enrollments,
              activeEnrollments: newAnalytics.active_enrollments,
              active_enrollments: newAnalytics.active_enrollments,
              completedEnrollments: newAnalytics.completed_enrollments,
              completed_enrollments: newAnalytics.completed_enrollments,
              conversionRate: newAnalytics.conversion_rate,
              conversion_rate: newAnalytics.conversion_rate,
              averageTimeToComplete: newAnalytics.average_time_to_complete,
              average_time_to_complete: newAnalytics.average_time_to_complete,
              updatedAt: newAnalytics.updated_at,
              updated_at: newAnalytics.updated_at
            });
          }
        } catch (funcError) {
          console.error("Error invoking analytics update function:", funcError);
        }
      }
    } catch (error) {
      console.error('Error fetching sequence analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sequence analytics',
        variant: 'destructive',
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  return {
    analytics,
    analyticsLoading,
    fetchSequenceAnalytics,
    setAnalytics
  };
};
