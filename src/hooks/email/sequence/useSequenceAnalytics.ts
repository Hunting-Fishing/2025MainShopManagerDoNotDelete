
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { EmailSequenceAnalytics } from '@/types/email';
import { useToast } from '@/hooks/use-toast';

export const useSequenceAnalytics = () => {
  const [analytics, setAnalytics] = useState<EmailSequenceAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const { toast } = useToast();

  const fetchSequenceAnalytics = async (sequenceId: string) => {
    setAnalyticsLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_sequence_analytics')
        .select('*')
        .eq('sequence_id', sequenceId)
        .single();

      if (error) {
        console.error("Error fetching sequence analytics:", error);
        setAnalytics(null);
        toast({
          title: "Error",
          description: "Failed to load sequence analytics",
          variant: "destructive",
        });
        return null;
      }

      const analyticsData: EmailSequenceAnalytics = {
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

      setAnalytics(analyticsData);
      return analyticsData;
    } catch (error) {
      console.error("Error in fetchSequenceAnalytics:", error);
      setAnalytics(null);
      toast({
        title: "Error",
        description: "Failed to load sequence analytics",
        variant: "destructive",
      });
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
