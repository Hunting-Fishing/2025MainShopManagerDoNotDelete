
import { useState } from 'react';
import { useToast } from '../use-toast';
import { 
  RateHistory, 
  fetchRateHistory 
} from '@/services/diybay/diybayService';

/**
 * Hook to manage rate history for DIY bays
 */
export function useRateHistory() {
  const [rateHistory, setRateHistory] = useState<RateHistory[]>([]);
  const { toast } = useToast();

  const loadRateHistory = async (bayId: string) => {
    try {
      const history = await fetchRateHistory(bayId);
      console.log("Loaded rate history:", history);
      setRateHistory(history);
      return history;
    } catch (error) {
      console.error('Error fetching rate history:', error);
      toast({
        title: "Error",
        description: "Could not load rate history.",
        variant: "destructive",
      });
      return [];
    }
  };

  return {
    rateHistory,
    loadRateHistory
  };
}
