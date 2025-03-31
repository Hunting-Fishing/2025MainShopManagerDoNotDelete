
import { useState } from 'react';
import { EmailSequenceAnalytics } from '@/types/email';
import { emailSequenceService } from '@/services/email';

export const useSequenceAnalytics = (sequenceId: string) => {
  const [analytics, setAnalytics] = useState<EmailSequenceAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = async () => {
    if (!sequenceId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await emailSequenceService.getSequenceAnalytics(sequenceId);
      
      if (error) throw error;
      
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching sequence analytics:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch analytics'));
    } finally {
      setLoading(false);
    }
  };

  return {
    analytics,
    loading,
    error,
    fetchAnalytics
  };
};
