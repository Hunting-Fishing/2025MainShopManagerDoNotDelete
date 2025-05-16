
import { TimeEntry } from "@/types/workOrder";

export const formatTimeInHoursAndMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  return `${hours}h ${mins.toString().padStart(2, '0')}m`;
};

export const calculateTotalTime = (entries: TimeEntry[]): number => {
  return entries.reduce((total, entry) => total + entry.duration, 0);
};

export const calculateBillableTime = (entries: TimeEntry[]): number => {
  return entries
    .filter(entry => entry.billable)
    .reduce((total, entry) => total + entry.duration, 0);
};
