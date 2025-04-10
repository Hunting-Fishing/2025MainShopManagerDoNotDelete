
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/ui/date-range-picker";

// Using recharts instead of chart.js
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AreaChart, Area } from 'recharts';

// Dummy data for demonstration
const reportData = [
  { month: 'Jan', revenue: 4000, costs: 2400 },
  { month: 'Feb', revenue: 3000, costs: 1398 },
  { month: 'Mar', revenue: 2000, costs: 9800 },
  { month: 'Apr', revenue: 2780, costs: 3908 },
  { month: 'May', revenue: 1890, costs: 4800 },
  { month: 'Jun', revenue: 2390, costs: 3800 },
];

const customerData = [
  { month: 'Jan', newCustomers: 40, returningCustomers: 24 },
  { month: 'Feb', newCustomers: 30, returningCustomers: 13 },
  { month: 'Mar', newCustomers: 20, returningCustomers: 98 },
  { month: 'Apr', newCustomers: 27, returningCustomers: 39 },
  { month: 'May', newCustomers: 18, returningCustomers: 48 },
  { month: 'Jun', newCustomers: 23, returningCustomers: 38 },
];

type DateRange = {
  from: Date;
  to: Date;
};

interface DateRangePickerProps {
  onChange: (range: DateRange) => void;
}

// Simple DateRangePicker implementation as placeholder
function SimpleDateRangePicker({ onChange }: DateRangePickerProps) {
  const defaultRange = {
    from: new Date(2023, 0, 1),
    to: new Date()
  };

  const [range, setRange] = useState<DateRange>(defaultRange);

  const handleUpdate = (newRange: DateRange) => {
    setRange(newRange);
    onChange(newRange);
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="grid gap-2">
        <div className="flex items-center">
          <input 
            type="date" 
            className="border rounded p-1 mr-2"
            value={range.from.toISOString().split('T')[0]} 
            onChange={(e) => handleUpdate({ 
              ...range, 
              from: new Date(e.target.value) 
            })} 
          />
          <span>to</span>
          <input 
            type="date" 
            className="border rounded p-1 ml-2"
            value={range.to.toISOString().split('T')[0]} 
            onChange={(e) => handleUpdate({ 
              ...range, 
              to: new Date(e.target.value) 
            })} 
          />
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(2023, 0, 1),
    to: new Date()
  });

  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range);
    // In a real app, we would fetch new data for the selected range
    console.log("Fetching data for range:", range);
  }, []);

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Reports</h1>
        
        <SimpleDateRangePicker onChange={handleDateRangeChange} />
      </div>

      <Tabs defaultValue="financial">
        <TabsList className="mb-6">
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="financial">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs. Costs</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={reportData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                    <Bar dataKey="costs" fill="#ef4444" name="Costs" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Acquisition</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={customerData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="newCustomers" stackId="1" stroke="#8884d8" fill="#8884d8" name="New" />
                    <Area type="monotone" dataKey="returningCustomers" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Returning" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Operations Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Operation reports will be available soon. You'll be able to track technician efficiency, equipment utilization, and service completion times.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
