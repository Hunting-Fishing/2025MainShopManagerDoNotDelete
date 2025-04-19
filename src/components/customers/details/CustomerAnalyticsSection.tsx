
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Customer } from '@/types/customer';
import { calculateCustomerLifetimeValue, getCustomerLifetimeValuePercentile, predictFutureCustomerValue } from '@/utils/analytics/customerLifetimeValue';
import { analyzeCustomerSegments, calculateRetentionRiskScore } from '@/utils/analytics/customerSegmentation';
import { getRecommendedNextServices, getOptimalContactTime } from '@/utils/analytics/customerValuePrediction';
import { Progress } from '@/components/ui/progress';
import { Loader2, TrendingUp, AlertCircle, BadgeCheck, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface CustomerAnalyticsSectionProps {
  customer: Customer;
}

export function CustomerAnalyticsSection({ customer }: CustomerAnalyticsSectionProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [clv, setClv] = useState<number | null>(null);
  const [clvPercentile, setClvPercentile] = useState<number | null>(null);
  const [retentionRisk, setRetentionRisk] = useState<number | null>(null);
  const [predictedValue, setPredictedValue] = useState<number | null>(null);
  const [recommendedServices, setRecommendedServices] = useState<string[]>([]);
  const [optimalContactTime, setOptimalContactTime] = useState<string>('');
  const [segments, setSegments] = useState<string[]>([]);

  useEffect(() => {
    const loadCustomerAnalytics = async () => {
      setLoading(true);
      try {
        // Get customer lifetime value
        const customerClv = await calculateCustomerLifetimeValue(customer.id);
        setClv(customerClv);
        
        // Get CLV percentile
        const percentile = await getCustomerLifetimeValuePercentile(customer.id);
        setClvPercentile(percentile);
        
        // Get retention risk score
        const riskScore = await calculateRetentionRiskScore(customer.id);
        setRetentionRisk(riskScore);
        
        // Get predicted future value
        const futureValue = await predictFutureCustomerValue(customer.id);
        setPredictedValue(futureValue);
        
        // Get recommended services
        const services = await getRecommendedNextServices(customer.id);
        setRecommendedServices(services);
        
        // Get optimal contact time
        const contactTime = await getOptimalContactTime(customer.id);
        setOptimalContactTime(contactTime);
        
        // Get customer segments
        const customerSegments = await analyzeCustomerSegments(customer.id);
        setSegments(customerSegments);
      } catch (error) {
        console.error("Error loading customer analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (customer?.id) {
      loadCustomerAnalytics();
    }
  }, [customer]);

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getRiskColor = (score: number | null) => {
    if (score === null) return 'bg-gray-200';
    if (score < 30) return 'bg-green-500';
    if (score < 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSegmentBadgeColor = (segment: string) => {
    switch(segment) {
      case 'high_value': return 'bg-purple-100 text-purple-800 border border-purple-300';
      case 'loyal': return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'at_risk': return 'bg-amber-100 text-amber-800 border border-amber-300';
      case 'inactive': return 'bg-red-100 text-red-800 border border-red-300';
      case 'new': return 'bg-green-100 text-green-800 border border-green-300';
      default: return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const getSegmentDisplayName = (segment: string) => {
    switch(segment) {
      case 'high_value': return 'High Value';
      case 'medium_value': return 'Medium Value';
      case 'low_value': return 'Low Value';
      case 'loyal': return 'Loyal Customer';
      case 'at_risk': return 'At Risk';
      case 'inactive': return 'Inactive';
      case 'new': return 'New Customer';
      default: return segment.replace('_', ' ');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
        <p className="mt-4 text-sm text-slate-500">Loading customer analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Customer Value Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-slate-500">
              <TrendingUp className="mr-2 h-4 w-4" />
              Customer Lifetime Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(clv)}</div>
            {clvPercentile !== null && (
              <p className="text-sm text-slate-500">
                Top {100 - clvPercentile}% of all customers
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-slate-500">
              <AlertCircle className="mr-2 h-4 w-4" />
              Retention Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{retentionRisk !== null ? `${retentionRisk}%` : 'N/A'}</span>
                <span className="text-slate-500">
                  {retentionRisk !== null 
                    ? (retentionRisk < 30 
                        ? 'Low Risk' 
                        : (retentionRisk < 60 ? 'Medium Risk' : 'High Risk')) 
                    : ''}
                </span>
              </div>
              <Progress value={retentionRisk || 0} className={`h-2 ${getRiskColor(retentionRisk)}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-slate-500">
              <TrendingUp className="mr-2 h-4 w-4" />
              Projected 12mo Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(predictedValue)}</div>
            {clv !== null && predictedValue !== null && (
              <p className="text-sm text-slate-500">
                {predictedValue > clv 
                  ? `+${formatCurrency(predictedValue - clv)} growth expected` 
                  : `${formatCurrency(predictedValue - clv)} decline projected`}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Customer Segments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Customer Segments</CardTitle>
        </CardHeader>
        <CardContent>
          {segments && segments.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {segments.map((segment, index) => (
                <Badge key={index} className={getSegmentBadgeColor(segment)}>
                  {getSegmentDisplayName(segment)}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No segments assigned yet</p>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center">
              <BadgeCheck className="mr-2 h-5 w-5 text-blue-500" />
              Recommended Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendedServices.map((service, index) => (
                <li key={index} className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm mr-2">
                    {index + 1}
                  </div>
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-green-500" />
              Optimal Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Best Time to Contact</p>
              <p className="text-slate-500">{optimalContactTime}</p>
            </div>
            <Separator />
            <div>
              <p className="font-medium">Engagement Tips</p>
              <ul className="text-sm space-y-1 mt-1">
                {retentionRisk !== null && retentionRisk > 50 ? (
                  <>
                    <li>• Offer a maintenance checkup discount</li>
                    <li>• Highlight new services relevant to their vehicle</li>
                  </>
                ) : (
                  <>
                    <li>• Follow up on recent service satisfaction</li>
                    <li>• Recommend complementary services</li>
                  </>
                )}
                <li>• Schedule their next service appointment</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
