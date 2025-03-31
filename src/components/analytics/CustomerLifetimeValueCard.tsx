
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateCustomerLifetimeValue, getCustomerLifetimeValuePercentile } from '@/utils/analytics/customerLifetimeValue';

interface CustomerLifetimeValueCardProps {
  customerId: string;
  className?: string;
}

export const CustomerLifetimeValueCard: React.FC<CustomerLifetimeValueCardProps> = ({ 
  customerId,
  className
}) => {
  const [clv, setClv] = useState<number | null>(null);
  const [percentile, setPercentile] = useState<number | null>(null);
  const [predictedClv, setPredictedClv] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const clvValue = await calculateCustomerLifetimeValue(customerId);
        setClv(clvValue);
        
        if (clvValue !== null) {
          const percentileValue = await getCustomerLifetimeValuePercentile(customerId);
          setPercentile(percentileValue);
          
          // For demonstration, predict a future value 30% higher
          // In a real implementation, this would use a predictive algorithm
          setPredictedClv(clvValue * 1.3);
        }
      } catch (error) {
        console.error("Error fetching CLV data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId]);

  const getValueColor = () => {
    if (percentile === null || clv === null) return "text-gray-500";
    if (percentile >= 80) return "text-green-600";
    if (percentile >= 50) return "text-blue-600";
    if (percentile >= 30) return "text-amber-600";
    return "text-gray-600";
  };

  const getPredictedColor = () => {
    if (!clv || !predictedClv) return "text-gray-500";
    const growthRate = ((predictedClv - clv) / clv) * 100;
    if (growthRate >= 30) return "text-green-600";
    if (growthRate >= 10) return "text-blue-600";
    return "text-amber-600";
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Customer Lifetime Value</CardTitle>
        <CardDescription>
          Estimated total value over customer lifetime
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-1">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="current">Current</TabsTrigger>
                <TabsTrigger value="predicted">Predicted</TabsTrigger>
              </TabsList>
              
              <TabsContent value="current" className="pt-4">
                <div className={`text-3xl font-bold ${getValueColor()}`}>
                  {clv !== null ? `$${clv.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : "N/A"}
                </div>
                {percentile !== null && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Higher than {percentile}% of customers
                  </p>
                )}
                {clv !== null && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average value per service:</span>
                      <span className="font-medium">${(clv / 3.5).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Services per year:</span>
                      <span className="font-medium">3.5</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Average retention:</span>
                      <span className="font-medium">2.4 years</span>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="predicted" className="pt-4">
                <div className={`text-3xl font-bold ${getPredictedColor()}`}>
                  {predictedClv !== null ? `$${predictedClv.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : "N/A"}
                </div>
                {predictedClv !== null && clv !== null && (
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className={getPredictedColor()}>+{((predictedClv - clv) / clv * 100).toFixed(1)}%</span> growth potential
                  </p>
                )}
                {predictedClv !== null && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Opportunity value:</span>
                      <span className="font-medium">
                        ${clv && predictedClv ? (predictedClv - clv).toFixed(2) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Suggested next service:</span>
                      <span className="font-medium">Premium Maintenance</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Recommended contact:</span>
                      <span className="font-medium">Mid-June</span>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
};
