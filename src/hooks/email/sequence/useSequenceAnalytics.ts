
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
      const data = await emailService.getSequenceAnalytics(sequenceId);
      if (data) {
        let transformedData: EmailSequenceAnalytics;
        
        if ('id' in data) {
          transformedData = {
            id: data.id,
            sequenceId: data.sequence_id,
            totalEnrollments: data.total_enrollments,
            activeEnrollments: data.active_enrollments,
            completedEnrollments: data.completed_enrollments,
            conversionRate: data.conversion_rate || 0,
            averageTimeToComplete: data.average_time_to_complete || 0,
            updatedAt: data.updated_at
          };
        } else {
          transformedData = {
            id: sequenceId,
            sequenceId: data.sequence_id,
            totalEnrollments: data.total_enrollments,
            activeEnrollments: data.active_enrollments,
            completedEnrollments: data.completed_enrollments,
            conversionRate: 0,
            averageTimeToComplete: data.average_time_to_complete || 0,
            updatedAt: data.updated_at
          };
        }
        
        setAnalytics(transformedData);
        return transformedData;
      }
      
      const defaultAnalytics: EmailSequenceAnalytics = {
        id: sequenceId,
        sequenceId: sequenceId,
        totalEnrollments: 0,
        activeEnrollments: 0,
        completedEnrollments: 0,
        conversionRate: 0,
        averageTimeToComplete: 0,
        updatedAt: new Date().toISOString()
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
