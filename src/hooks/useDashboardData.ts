
import { useState, useEffect } from 'react';
import { PhaseProgressItem } from '@/types/dashboard';
import { getPhaseProgress, getRecentWorkOrders } from '@/services/dashboard/workOrderService';
import { getStats } from '@/services/dashboard/statsService';

export function useDashboardData() {
  const [phaseProgressData, setPhaseProgressData] = useState<PhaseProgressItem[]>([]);
  const [recentWorkOrders, setRecentWorkOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching all live dashboard data...");
        
        // Fetch all dashboard data in parallel
        const [phaseData, recentData, statsData] = await Promise.all([
          getPhaseProgress(),
          getRecentWorkOrders(),
          getStats()
        ]);
        
        setPhaseProgressData(phaseData);
        setRecentWorkOrders(recentData);
        setStats(statsData);
        setError(null);
        
        console.log("All live dashboard data loaded successfully");
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setPhaseProgressData([]);
        setRecentWorkOrders([]);
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return {
    phaseProgressData,
    recentWorkOrders,
    stats,
    isLoading,
    error
  };
}
