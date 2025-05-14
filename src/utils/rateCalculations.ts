
import { RateSettings } from "@/services/diybay/diybayService";

/**
 * Calculate daily rate based on hourly rate and settings
 */
export function calculateDailyRate(hourlyRate: number, settings: RateSettings): number {
  const dailyRate = hourlyRate * settings.daily_hours;
  const discount = dailyRate * (settings.daily_discount_percent / 100);
  return parseFloat((dailyRate - discount).toFixed(2));
}

/**
 * Calculate weekly rate based on hourly rate and settings
 */
export function calculateWeeklyRate(hourlyRate: number, settings: RateSettings): number {
  return parseFloat((hourlyRate * settings.weekly_multiplier).toFixed(2));
}

/**
 * Calculate monthly rate based on hourly rate and settings
 */
export function calculateMonthlyRate(hourlyRate: number, settings: RateSettings): number {
  return parseFloat((hourlyRate * settings.monthly_multiplier).toFixed(2));
}

/**
 * Apply percentage adjustment to a rate
 */
export function applyPercentageAdjustment(rate: number, percentage: number): number {
  const adjustment = rate * (percentage / 100);
  return parseFloat((rate + adjustment).toFixed(2));
}

/**
 * Format currency value
 */
export function formatCurrency(value: number | null): string {
  if (value === null) return "$0.00";
  return `$${value.toFixed(2)}`;
}
