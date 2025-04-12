
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

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
  const [bulkOpenTime, setBulkOpenTime] = useState("09:00");
  const [bulkCloseTime, setBulkCloseTime] = useState("17:00");
  const [bulkIsClosed, setBulkIsClosed] = useState(false);

  const getDayName = (dayIndex: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex] || '';
  };

  // Sort business hours by day_of_week to ensure consistent display
  const sortedHours = [...businessHours].sort((a, b) => a.day_of_week - b.day_of_week);

  const handleBulkApply = () => {
    sortedHours.forEach((_, index) => {
      onBusinessHoursChange(index, 'is_closed', bulkIsClosed);
      if (!bulkIsClosed) {
        onBusinessHoursChange(index, 'open_time', bulkOpenTime + ':00');
        onBusinessHoursChange(index, 'close_time', bulkCloseTime + ':00');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Bulk edit section */}
      <div className="p-3 border rounded-md bg-muted/20 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium flex items-center gap-1.5">
            Set all days to same hours
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Apply the same hours to all days at once</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h3>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Label htmlFor="bulk-closed" className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              id="bulk-closed"
              checked={bulkIsClosed}
              onCheckedChange={(checked) => setBulkIsClosed(checked === true)}
              className="rounded border-gray-300"
            />
            <span>Closed</span>
          </Label>
          
          {!bulkIsClosed && (
            <>
              <div className="flex items-center gap-2">
                <Label htmlFor="bulk-open-time" className="text-sm whitespace-nowrap">Open</Label>
                <Input
                  id="bulk-open-time"
                  type="time"
                  value={bulkOpenTime}
                  onChange={(e) => setBulkOpenTime(e.target.value)}
                  className="w-24"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="bulk-close-time" className="text-sm whitespace-nowrap">Close</Label>
                <Input
                  id="bulk-close-time"
                  type="time"
                  value={bulkCloseTime}
                  onChange={(e) => setBulkCloseTime(e.target.value)}
                  className="w-24"
                />
              </div>
            </>
          )}
          
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={handleBulkApply}
            className="mt-2 sm:mt-0 sm:ml-auto"
          >
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Apply to all days
          </Button>
        </div>
      </div>

      {/* Individual days section */}
      <div className="space-y-4">
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
    </div>
  );
}
