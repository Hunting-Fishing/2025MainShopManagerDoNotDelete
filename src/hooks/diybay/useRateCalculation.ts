
import { calculateRates, RateSettings } from '@/services/diybay/diybayService';

/**
 * Hook for calculating rates based on settings
 */
export function useRateCalculation() {
  /**
   * Calculate a specific rate type (daily, weekly, monthly) based on hourly rate and settings
   */
  const calculateRate = (type: 'daily' | 'weekly' | 'monthly', hourlyRate: number, settings: RateSettings) => {
    const rates = calculateRates(hourlyRate, settings);
    return rates[type];
  };

  return {
    calculateRate
  };
}
