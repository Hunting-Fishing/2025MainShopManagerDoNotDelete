
import { useState, useEffect } from 'react';
import { PhaseProgressItem } from '@/types/dashboard';
import { getPhaseProgress } from '@/services/dashboard/workOrderService';

export function useDashboardData() {
  const [phaseProgressData, setPhaseProgressData] = useState<PhaseProgressItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getPhaseProgress();
        setPhaseProgressData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setPhaseProgressData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    phaseProgressData,
    isLoading,
    error
  };
}
