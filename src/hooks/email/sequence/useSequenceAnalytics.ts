
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { EmailSequenceAnalytics } from '@/types/email';
import { useToast } from '@/hooks/use-toast';

export const useSequenceAnalytics = () => {
  const [analytics, setAnalytics] = useState<EmailSequenceAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const { toast } = useToast();

  const fetchSequenceAnalytics = useCallback(async (sequenceId: string) => {
    setAnalyticsLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_sequence_analytics')
        .select('*')
        .eq('sequence_id', sequenceId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        // Create an analytics object with both snake_case and camelCase properties
        const formattedAnalytics: EmailSequenceAnalytics = {
          id: data.id,
          sequence_id: data.sequence_id,
          total_enrollments: data.total_enrollments,
          active_enrollments: data.active_enrollments,
          completed_enrollments: data.completed_enrollments,
          cancelled_enrollments: data.cancelled_enrollments || 0,
          total_emails_sent: data.total_emails_sent || 0,
          open_rate: data.open_rate || 0,
          click_rate: data.click_rate || 0,
          conversion_rate: data.conversion_rate || 0,
          average_time_to_complete: data.average_time_to_complete || 0,
          created_at: data.created_at,
          updated_at: data.updated_at,
          
          // Add camelCase aliases for component compatibility
          sequenceId: data.sequence_id,
          totalEnrollments: data.total_enrollments,
          activeEnrollments: data.active_enrollments,
          completedEnrollments: data.completed_enrollments,
          averageTimeToComplete: data.average_time_to_complete || 0,
          conversionRate: data.conversion_rate || 0
        };

        setAnalytics(formattedAnalytics);
      } else {
        setAnalytics(null);
      }
    } catch (error) {
      console.error('Error fetching sequence analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sequence analytics',
        variant: 'destructive',
      });
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [toast]);

  return {
    analytics,
    analyticsLoading,
    fetchSequenceAnalytics,
    setAnalytics
  };
};
