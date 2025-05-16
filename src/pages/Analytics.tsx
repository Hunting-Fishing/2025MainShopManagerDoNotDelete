import { useState } from "react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { ChartContainer } from "@/components/analytics/ChartContainer";
import { DateRange } from "react-day-picker";

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  
  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-none max-w-xs w-full">
          <DateRangePicker 
            value={dateRange}
            onChange={handleDateRangeChange}
          />
        </div>
        
        {/* Filter components would go here */}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer
          title="Revenue"
          description="Monthly revenue breakdown"
        >
          {/* Revenue chart component */}
          <div className="h-80 w-full flex items-center justify-center bg-slate-50 rounded-md">
            <p className="text-muted-foreground">Revenue chart placeholder</p>
          </div>
        </ChartContainer>
        
        <ChartContainer
          title="Service Completion Rate"
          description="Jobs completed on time vs delayed"
        >
          {/* Service rate chart component */}
          <div className="h-80 w-full flex items-center justify-center bg-slate-50 rounded-md">
            <p className="text-muted-foreground">Service rate chart placeholder</p>
          </div>
        </ChartContainer>
        
        {/* Additional charts */}
      </div>
    </div>
  );
}
