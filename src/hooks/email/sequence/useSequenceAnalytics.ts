
import { useState } from "react";
import { emailService } from "@/services/email/emailService";
import { EmailSequenceAnalytics } from "@/types/email";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export const useSequenceAnalytics = () => {
  const [analytics, setAnalytics] = useState<EmailSequenceAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const { toast } = useToast();

  const fetchSequenceAnalytics = async (sequenceId: string) => {
    setAnalyticsLoading(true);
    try {
      // Query the sequence analytics directly from Supabase
      const { data, error } = await supabase
        .from('email_sequence_analytics')
        .select('*')
        .eq('sequence_id', sequenceId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        const transformedData: EmailSequenceAnalytics = {
          id: data.id,
          sequenceId: data.sequence_id,
          sequence_id: data.sequence_id,
          totalEnrollments: data.total_enrollments || 0,
          total_enrollments: data.total_enrollments || 0,
          activeEnrollments: data.active_enrollments || 0,
          active_enrollments: data.active_enrollments || 0,
          completedEnrollments: data.completed_enrollments || 0,
          completed_enrollments: data.completed_enrollments || 0,
          conversionRate: data.conversion_rate || 0,
          conversion_rate: data.conversion_rate || 0,
          averageTimeToComplete: data.average_time_to_complete || 0,
          average_time_to_complete: data.average_time_to_complete || 0,
          updatedAt: data.updated_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString()
        };
        
        setAnalytics(transformedData);
        return transformedData;
      }
      
      // Create default analytics if none exist
      const defaultAnalytics: EmailSequenceAnalytics = {
        id: sequenceId,
        sequenceId: sequenceId,
        sequence_id: sequenceId,
        totalEnrollments: 0,
        total_enrollments: 0,
        activeEnrollments: 0,
        active_enrollments: 0,
        completedEnrollments: 0,
        completed_enrollments: 0,
        conversionRate: 0,
        conversion_rate: 0,
        averageTimeToComplete: 0,
        average_time_to_complete: 0,
        updatedAt: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setAnalytics(defaultAnalytics);
      return defaultAnalytics;
    } catch (error) {
      console.error("Error fetching sequence analytics:", error);
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
