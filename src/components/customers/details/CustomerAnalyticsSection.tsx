import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Customer } from '@/types/customer';
import { CustomerSegmentBadges } from '@/components/analytics/CustomerSegmentBadges';
import { calculateCustomerLifetimeValue, getCustomerLifetimeValuePercentile, predictFutureCustomerValue } from '@/utils/analytics/customerLifetimeValue';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { calculateRetentionRiskScore } from '@/utils/analytics/customerSegmentation';

interface CustomerAnalyticsSectionProps {
  customer: Customer;
}

export function CustomerAnalyticsSection({ customer }: CustomerAnalyticsSectionProps) {
  const [clv, setClv] = useState<number | null>(null);
  const [clvPercentile, setClvPercentile] = useState<number | null>(null);
  const [predictedValue, setPredictedValue] = useState<number | null>(null);
  const [retentionRisk, setRetentionRisk] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const lifetimeValue = await calculateCustomerLifetimeValue(customer.id);
        setClv(lifetimeValue);

        const lifetimeValuePercentile = await getCustomerLifetimeValuePercentile(customer.id);
        setClvPercentile(lifetimeValuePercentile);
        
        const futureValue = await predictFutureCustomerValue(customer.id);
        setPredictedValue(futureValue);

        const riskScore = await calculateRetentionRiskScore(customer.id);
        setRetentionRisk(riskScore);
      } catch (error) {
        console.error("Error loading customer analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [customer.id]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Customer Segments</CardTitle>
        </CardHeader>
        <CardContent>
          {customer.id ? (
            <CustomerSegmentBadges customerId={customer.id} showDetailedView={true} />
          ) : (
            <p>No customer ID provided.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Lifetime Value</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-5 w-20" />
            ) : (
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span>${clv?.toFixed(2) || '0.00'}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CLV Percentile</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-5 w-20" />
            ) : (
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                <span>{clvPercentile}%</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Predicted Future Value</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-5 w-20" />
            ) : (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>${predictedValue?.toFixed(2) || '0.00'}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Retention Risk</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-5 w-20" />
            ) : (
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-gray-500" />
                <span>{retentionRisk}%</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
