
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface BusinessHour {
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
  [key: string]: any;
}

interface BusinessHoursSectionProps {
  businessHours: BusinessHour[];
  onBusinessHoursChange: (index: number, field: string, value: any) => void;
}

export function BusinessHoursSection({ businessHours, onBusinessHoursChange }: BusinessHoursSectionProps) {
  const getDayName = (dayIndex: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex] || '';
  };

  // Sort business hours by day_of_week to ensure consistent display
  const sortedHours = [...businessHours].sort((a, b) => a.day_of_week - b.day_of_week);

  return (
    <div className="space-y-4 p-1">
      {sortedHours.map((hours, index) => (
        <div key={`${hours.day_of_week}-${index}`} className="flex items-center space-x-4 p-2 rounded-md bg-muted/30">
          <div className="w-1/4">
            <p className="font-medium">{getDayName(hours.day_of_week)}</p>
          </div>
          <div className="flex-1 flex items-center space-x-3">
            <Label htmlFor={`closed-${index}`} className="flex items-center space-x-2 cursor-pointer">
              <input
                id={`closed-${index}`}
                type="checkbox"
                checked={hours.is_closed}
                onChange={(e) => onBusinessHoursChange(index, 'is_closed', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span>Closed</span>
            </Label>
            
            {!hours.is_closed && (
              <>
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`open-time-${index}`} className="text-sm">Open</Label>
                  <Input
                    id={`open-time-${index}`}
                    type="time"
                    value={hours.open_time.slice(0, 5)}
                    onChange={(e) => onBusinessHoursChange(index, 'open_time', e.target.value + ':00')}
                    disabled={hours.is_closed}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`close-time-${index}`} className="text-sm">Close</Label>
                  <Input
                    id={`close-time-${index}`}
                    type="time"
                    value={hours.close_time.slice(0, 5)}
                    onChange={(e) => onBusinessHoursChange(index, 'close_time', e.target.value + ':00')}
                    disabled={hours.is_closed}
                    className="w-24"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
