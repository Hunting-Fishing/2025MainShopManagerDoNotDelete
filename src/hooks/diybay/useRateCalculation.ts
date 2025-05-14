
import { calculateRates, RateSettings } from '@/services/diybay/diybayService';

/**
 * Hook for calculating rates based on settings
 */
export function useRateCalculation() {
  const calculateRate = (type: 'daily' | 'weekly' | 'monthly', hourlyRate: number, settings: RateSettings) => {
    const rates = calculateRates(hourlyRate, settings);
    return rates[type];
  };

  return {
    calculateRate
  };
}
