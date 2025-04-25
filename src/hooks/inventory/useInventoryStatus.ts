
import { useState, useEffect } from 'react';

interface UseInventoryStatusProps {
  shopId?: string;
}

interface InventoryStatusData {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  isLoading: boolean;
}

export function useInventoryStatus({ shopId }: UseInventoryStatusProps): InventoryStatusData {
  const [statusData, setStatusData] = useState<InventoryStatusData>({
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    isLoading: true
  });

  useEffect(() => {
    const fetchInventoryStatus = async () => {
      try {
        // In a real implementation, this would fetch data from an API
        // For now, we'll simulate some data
        setTimeout(() => {
          setStatusData({
            totalItems: 156,
            lowStockItems: 12,
            outOfStockItems: 5,
            isLoading: false
          });
        }, 500);
      } catch (error) {
        console.error("Error fetching inventory status:", error);
        setStatusData(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchInventoryStatus();
  }, [shopId]);

  return statusData;
}
