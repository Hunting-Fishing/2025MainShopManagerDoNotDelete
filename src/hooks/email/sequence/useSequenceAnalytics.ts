
import { useState } from 'react';
import { EmailSequenceAnalytics } from '@/types/email';
import { emailSequenceService } from '@/services/email';

export const useSequenceAnalytics = (sequenceId?: string) => {
  const [analytics, setAnalytics] = useState<EmailSequenceAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = async (targetSequenceId?: string) => {
    // Use the provided targetSequenceId or fall back to the hook's sequenceId
    const idToUse = targetSequenceId || sequenceId;
    
    if (!idToUse) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await emailSequenceService.getSequenceAnalytics(idToUse);
      
      if (error) throw error;
      
      // Standardize property names to camelCase for frontend usage
      const enhancedData = {
        id: data?.id || '',
        sequenceId: data?.sequence_id || idToUse,
        sequence_id: data?.sequence_id || idToUse,
        totalEnrollments: data?.total_enrollments || 0,
        total_enrollments: data?.total_enrollments || 0,
        activeEnrollments: data?.active_enrollments || 0,
        active_enrollments: data?.active_enrollments || 0,
        completedEnrollments: data?.completed_enrollments || 0,
        completed_enrollments: data?.completed_enrollments || 0,
        cancelled_enrollments: data?.cancelled_enrollments || 0,
        cancelledEnrollments: data?.cancelled_enrollments || 0,
        conversionRate: data?.conversion_rate || 0,
        conversion_rate: data?.conversion_rate || 0,
        averageTimeToComplete: data?.average_time_to_complete || 0,
        average_time_to_complete: data?.average_time_to_complete || 0,
        totalEmailsSent: data?.total_emails_sent || 0,
        total_emails_sent: data?.total_emails_sent || 0,
        emailsSent: data?.total_emails_sent || 0, // For backward compatibility
        openRate: data?.open_rate || 0,
        open_rate: data?.open_rate || 0,
        clickRate: data?.click_rate || 0,
        click_rate: data?.click_rate || 0,
        updatedAt: data?.updated_at || new Date().toISOString(),
        updated_at: data?.updated_at || new Date().toISOString(),
        createdAt: data?.created_at || new Date().toISOString(),
        created_at: data?.created_at || new Date().toISOString(),
        // Include timeline data with consistent format
        timeline: data?.timeline || []
      };
      
      setAnalytics(enhancedData);
      return enhancedData;
    } catch (err) {
      console.error('Error fetching sequence analytics:', err);
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch analytics');
      setError(errorObj);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
    setAnalytics
  };
};
