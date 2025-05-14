
import { RateSettings } from "@/services/diybay/diybayService";
import { 
  calculateDailyRate, 
  calculateWeeklyRate, 
  calculateMonthlyRate 
} from "@/utils/rateCalculations";

export function useRateCalculation() {
  const calculateRate = (type: 'daily' | 'weekly' | 'monthly', hourlyRate: number, settings: RateSettings) => {
    // Get base rate from settings if available, otherwise use the provided hourlyRate
    const baseRate = typeof settings.hourly_base_rate === 'number' && settings.hourly_base_rate > 0 
      ? settings.hourly_base_rate 
      : hourlyRate;
    
    switch (type) {
      case 'daily':
        return calculateDailyRate(baseRate, settings);
      case 'weekly':
        return calculateWeeklyRate(baseRate, settings);
      case 'monthly':
        return calculateMonthlyRate(baseRate, settings);
      default:
        return 0;
    }
  };

  return { calculateRate };
}
