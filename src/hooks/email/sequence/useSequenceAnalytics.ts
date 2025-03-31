
import { useState } from 'react';
import { EmailSequenceAnalytics } from '@/types/email';
import { emailService } from '@/services/email/emailService';

export const useSequenceAnalytics = () => {
  const [analytics, setAnalytics] = useState<EmailSequenceAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  /**
   * Fetch analytics data for a sequence
   */
  const fetchSequenceAnalytics = async (sequenceId: string) => {
    setAnalyticsLoading(true);
    try {
      const analyticsData = await emailService.getSequenceAnalytics(sequenceId);
      
      if (analyticsData) {
        const formattedAnalytics: EmailSequenceAnalytics = {
          id: analyticsData.id,
          sequence_id: analyticsData.sequence_id,
          sequenceId: analyticsData.sequence_id,
          total_enrollments: analyticsData.total_enrollments,
          totalEnrollments: analyticsData.total_enrollments,
          active_enrollments: analyticsData.active_enrollments,
          activeEnrollments: analyticsData.active_enrollments,
          completed_enrollments: analyticsData.completed_enrollments,
          completedEnrollments: analyticsData.completed_enrollments,
          cancelled_enrollments: analyticsData.cancelled_enrollments || 0,
          total_emails_sent: analyticsData.total_emails_sent || 0,
          totalEmailsSent: analyticsData.total_emails_sent || 0,
          open_rate: analyticsData.open_rate || 0,
          openRate: analyticsData.open_rate || 0,
          click_rate: analyticsData.click_rate || 0,
          clickRate: analyticsData.click_rate || 0,
          conversion_rate: analyticsData.conversion_rate,
          conversionRate: analyticsData.conversion_rate,
          average_time_to_complete: analyticsData.average_time_to_complete,
          averageTimeToComplete: analyticsData.average_time_to_complete,
          updated_at: analyticsData.updated_at,
          updatedAt: analyticsData.updated_at,
          created_at: analyticsData.created_at || analyticsData.updated_at,
          createdAt: analyticsData.created_at || analyticsData.updated_at
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
