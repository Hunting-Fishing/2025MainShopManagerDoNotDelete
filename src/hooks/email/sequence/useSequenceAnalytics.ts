
import { useState } from "react";
import { emailService } from "@/services/email/emailService";
import { EmailSequenceAnalytics } from "@/types/email";
import { useToast } from "@/hooks/use-toast";

export const useSequenceAnalytics = () => {
  const [analytics, setAnalytics] = useState<EmailSequenceAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const { toast } = useToast();

  const fetchSequenceAnalytics = async (sequenceId: string) => {
    setAnalyticsLoading(true);
    try {
      // Use the emailService method properly
      const data = await emailService.getSequenceAnalytics(sequenceId);
      
      if (data) {
        let transformedData: EmailSequenceAnalytics;
        
        if ('id' in data) {
          transformedData = {
            id: data.id,
            sequenceId: data.sequence_id,
            sequence_id: data.sequence_id,
            totalEnrollments: data.total_enrollments,
            total_enrollments: data.total_enrollments,
            activeEnrollments: data.active_enrollments,
            active_enrollments: data.active_enrollments,
            completedEnrollments: data.completed_enrollments,
            completed_enrollments: data.completed_enrollments,
            conversionRate: data.conversion_rate || 0,
            conversion_rate: data.conversion_rate || 0,
            averageTimeToComplete: data.average_time_to_complete || 0,
            average_time_to_complete: data.average_time_to_complete || 0,
            updatedAt: data.updated_at,
            updated_at: data.updated_at
          };
        } else {
          transformedData = {
            id: sequenceId,
            sequenceId: sequenceId,
            sequence_id: sequenceId,
            totalEnrollments: data.total_enrollments,
            total_enrollments: data.total_enrollments,
            activeEnrollments: data.active_enrollments,
            active_enrollments: data.active_enrollments,
            completedEnrollments: data.completed_enrollments,
            completed_enrollments: data.completed_enrollments,
            conversionRate: 0,
            conversion_rate: 0,
            averageTimeToComplete: data.average_time_to_complete || 0,
            average_time_to_complete: data.average_time_to_complete || 0,
            updatedAt: data.updated_at,
            updated_at: data.updated_at
          };
        }
        
        setAnalytics(transformedData);
        return transformedData;
      }
      
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
