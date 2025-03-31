
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface CustomerCohortAnalysisCardProps {
  customerId: string;
  className?: string;
}

export const CustomerCohortAnalysisCard: React.FC<CustomerCohortAnalysisCardProps> = ({ 
  customerId,
  className
}) => {
  const [cohortMetric, setCohortMetric] = useState<string>('revenue');
  
  // Sample cohort data - in a real implementation, this would be fetched from an API
  const cohortData = {
    revenue: [
      { name: 'Q1', customer: 380, cohort: 320, difference: 60 },
      { name: 'Q2', customer: 420, cohort: 380, difference: 40 },
      { name: 'Q3', customer: 450, cohort: 410, difference: 40 },
      { name: 'Q4', customer: 520, cohort: 440, difference: 80 },
    ],
    frequency: [
      { name: 'Q1', customer: 3, cohort: 2, difference: 1 },
      { name: 'Q2', customer: 2, cohort: 2, difference: 0 },
      { name: 'Q3', customer: 4, cohort: 3, difference: 1 },
      { name: 'Q4', customer: 3, cohort: 2, difference: 1 },
    ],
    satisfaction: [
      { name: 'Q1', customer: 4.5, cohort: 4.2, difference: 0.3 },
      { name: 'Q2', customer: 4.7, cohort: 4.3, difference: 0.4 },
      { name: 'Q3', customer: 4.2, cohort: 4.4, difference: -0.2 },
      { name: 'Q4', customer: 4.8, cohort: 4.5, difference: 0.3 },
    ]
  };
  
  const metricLabel = {
    revenue: 'Revenue ($)',
    frequency: 'Visit Frequency',
    satisfaction: 'Satisfaction Rating'
  };
  
  const activeData = cohortData[cohortMetric as keyof typeof cohortData];
  
  // Calculate summary statistics
  const customerAvg = activeData.reduce((sum, item) => sum + item.customer, 0) / activeData.length;
  const cohortAvg = activeData.reduce((sum, item) => sum + item.cohort, 0) / activeData.length;
  const percentDiff = ((customerAvg - cohortAvg) / cohortAvg) * 100;
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-semibold">Cohort Comparison</CardTitle>
            <CardDescription>
              Compare against similar customers
            </CardDescription>
          </div>
          <Select value={cohortMetric} onValueChange={setCohortMetric}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="frequency">Visit Frequency</SelectItem>
              <SelectItem value="satisfaction">Satisfaction</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">Customer</div>
              <div className="text-lg font-bold">
                {cohortMetric === 'revenue' ? '$' : ''}{customerAvg.toFixed(cohortMetric === 'revenue' ? 0 : 1)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Cohort Avg</div>
              <div className="text-lg font-bold">
                {cohortMetric === 'revenue' ? '$' : ''}{cohortAvg.toFixed(cohortMetric === 'revenue' ? 0 : 1)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Difference</div>
              <div className={`text-lg font-bold ${percentDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {percentDiff >= 0 ? '+' : ''}{percentDiff.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={activeData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: metricLabel[cohortMetric as keyof typeof metricLabel], angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => {
              if (cohortMetric === 'revenue') return [`$${value}`, ''];
              return [value, ''];
            }} />
            <Legend />
            <Bar dataKey="customer" fill="#4f46e5" name="This Customer" />
            <Bar dataKey="cohort" fill="#94a3b8" name="Cohort Average" />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            This customer is performing <span className={percentDiff >= 0 ? 'text-green-600' : 'text-red-600'}>
              {percentDiff >= 0 ? 'above' : 'below'} average
            </span> compared to similar customers in the same cohort.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
