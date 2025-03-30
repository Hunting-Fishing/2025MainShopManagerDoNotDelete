
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const clvValue = await calculateCustomerLifetimeValue(customerId);
        setClv(clvValue);
        
        if (clvValue !== null) {
          const percentileValue = await getCustomerLifetimeValuePercentile(customerId);
          setPercentile(percentileValue);
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
            <div className={`text-3xl font-bold ${getValueColor()}`}>
              {clv !== null ? `$${clv.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : "N/A"}
            </div>
            {percentile !== null && (
              <p className="text-sm text-muted-foreground mt-1">
                Higher than {percentile}% of customers
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
