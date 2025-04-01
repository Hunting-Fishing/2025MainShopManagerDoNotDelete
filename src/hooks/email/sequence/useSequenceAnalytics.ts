
import { useState } from 'react';
import { EmailSequenceAnalytics } from '@/types/email';
import { emailSequenceService } from '@/services/email';

export const useSequenceAnalytics = (sequenceId?: string) => {
  const [analytics, setAnalytics] = useState<EmailSequenceAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = async () => {
    if (!sequenceId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await emailSequenceService.getSequenceAnalytics(sequenceId);
      
      if (error) throw error;
      
      // Add timeline data if it doesn't exist
      const enhancedData = {
        ...data,
        emailsSent: data?.total_emails_sent || data?.totalEmailsSent || 0,
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
