
import { useState } from 'react';
import { EmailSequenceAnalytics } from '@/types/email';
import { emailService } from '@/services/email';

export const useSequenceAnalytics = () => {
  const [analytics, setAnalytics] = useState<EmailSequenceAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  /**
   * Fetch analytics data for a sequence
   */
  const fetchSequenceAnalytics = async (sequenceId: string) => {
    setAnalyticsLoading(true);
    try {
      const { data, error } = await emailService.getSequenceAnalytics(sequenceId);
      
      if (error) {
        console.error('Error fetching sequence analytics:', error);
        return null;
      }
      
      if (data) {
        const formattedAnalytics: EmailSequenceAnalytics = {
          id: data.id,
          sequence_id: data.sequence_id,
          sequenceId: data.sequence_id,
          total_enrollments: data.total_enrollments,
          totalEnrollments: data.total_enrollments,
          active_enrollments: data.active_enrollments,
          activeEnrollments: data.active_enrollments,
          completed_enrollments: data.completed_enrollments,
          completedEnrollments: data.completed_enrollments,
          cancelled_enrollments: data.cancelled_enrollments || 0,
          total_emails_sent: data.total_emails_sent || 0,
          totalEmailsSent: data.total_emails_sent || 0,
          open_rate: data.open_rate || 0,
          openRate: data.open_rate || 0,
          click_rate: data.click_rate || 0,
          clickRate: data.click_rate || 0,
          conversion_rate: data.conversion_rate,
          conversionRate: data.conversion_rate,
          average_time_to_complete: data.average_time_to_complete,
          averageTimeToComplete: data.average_time_to_complete,
          updated_at: data.updated_at,
          updatedAt: data.updated_at,
          created_at: data.created_at || data.updated_at,
          createdAt: data.created_at || data.updated_at
        };
        
        setAnalytics(formattedAnalytics);
        return formattedAnalytics;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching sequence analytics:', error);
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
