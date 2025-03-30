
import React from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerDateRangeFilterProps {
  dateRange?: DateRange;
  onDateRangeChange: (range?: DateRange) => void;
  label?: string;
}

export const CustomerDateRangeFilter: React.FC<CustomerDateRangeFilterProps> = ({
  dateRange,
  onDateRangeChange,
  label = "Service Date Range"
}) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange?.from && !dateRange?.to && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : dateRange?.to ? (
              format(dateRange.to, "LLL dd, y")
            ) : (
              <span>Service date range</span>
            )}
            {(dateRange?.from || dateRange?.to) && (
              <X 
                className="ml-auto h-4 w-4 hover:scale-110 transition-transform cursor-pointer" 
                onClick={(e) => {
                  e.stopPropagation();
                  onDateRangeChange(undefined);
                }}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={onDateRangeChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
