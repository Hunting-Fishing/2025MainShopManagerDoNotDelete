
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { EmailSequenceAnalytics } from '@/types/email';
import { useToast } from '@/hooks/use-toast';
import { emailService } from '@/services/email/emailService';

export const useSequenceAnalytics = () => {
  const [analytics, setAnalytics] = useState<EmailSequenceAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const { toast } = useToast();

  const fetchSequenceAnalytics = async (sequenceId: string) => {
    setAnalyticsLoading(true);
    try {
      // First, try to get the existing analytics
      const { data, error } = await supabase
        .from('email_sequence_analytics')
        .select('*')
        .eq('sequence_id', sequenceId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // Not found error
          throw error;
        }
        
        // If not found, trigger analytics update
        await emailService.updateSequenceAnalytics(sequenceId);
        
        // Now try to fetch the data again
        const { data: updatedData, error: updatedError } = await supabase
          .from('email_sequence_analytics')
          .select('*')
          .eq('sequence_id', sequenceId)
          .single();
          
        if (updatedError) {
          // Still no data, set analytics to null
          setAnalytics(null);
          return null;
        }
        
        const formattedAnalytics: EmailSequenceAnalytics = {
          id: updatedData.id,
          sequenceId: updatedData.sequence_id,
          sequence_id: updatedData.sequence_id,
          totalEnrollments: updatedData.total_enrollments,
          total_enrollments: updatedData.total_enrollments,
          activeEnrollments: updatedData.active_enrollments,
          active_enrollments: updatedData.active_enrollments,
          completedEnrollments: updatedData.completed_enrollments,
          completed_enrollments: updatedData.completed_enrollments,
          conversionRate: updatedData.conversion_rate,
          conversion_rate: updatedData.conversion_rate,
          averageTimeToComplete: updatedData.average_time_to_complete,
          average_time_to_complete: updatedData.average_time_to_complete,
          updatedAt: updatedData.updated_at,
          updated_at: updatedData.updated_at
        };
        
        setAnalytics(formattedAnalytics);
        return formattedAnalytics;
      }

      const formattedAnalytics: EmailSequenceAnalytics = {
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
      };
      
      setAnalytics(formattedAnalytics);
      return formattedAnalytics;
    } catch (error) {
      console.error('Error fetching sequence analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sequence analytics',
        variant: 'destructive',
      });
      setAnalytics(null);
      return null;
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
