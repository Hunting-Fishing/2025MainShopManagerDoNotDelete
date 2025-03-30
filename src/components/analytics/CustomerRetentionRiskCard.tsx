
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

interface CustomerRetentionRiskCardProps {
  customerId: string;
  riskScore?: number;
  loading?: boolean;
  className?: string;
}

export const CustomerRetentionRiskCard: React.FC<CustomerRetentionRiskCardProps> = ({
  customerId,
  riskScore = 0,
  loading = false,
  className
}) => {
  // Function to get risk level information based on the score
  const getRiskInfo = (score: number) => {
    if (score < 30) {
      return {
        level: 'Low Risk',
        description: 'This customer has a low risk of leaving.',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        progressColor: 'bg-green-600',
        icon: <CheckCircle className="h-5 w-5 text-green-600" />
      };
    } else if (score < 70) {
      return {
        level: 'Medium Risk',
        description: 'This customer has a moderate risk of leaving.',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        progressColor: 'bg-yellow-600',
        icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />
      };
    } else {
      return {
        level: 'High Risk',
        description: 'This customer has a high risk of leaving.',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        progressColor: 'bg-red-600',
        icon: <AlertCircle className="h-5 w-5 text-red-600" />
      };
    }
  };

  const riskInfo = getRiskInfo(riskScore);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Retention Risk</CardTitle>
        <CardDescription>Customer retention risk assessment</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {riskInfo.icon}
                <span className={`font-medium ${riskInfo.color}`}>{riskInfo.level}</span>
              </div>
              <span className="text-sm font-medium">{riskScore}/100</span>
            </div>
            
            <Progress 
              value={riskScore} 
              max={100}
              className="h-2"
            />
            
            <p className="text-sm text-muted-foreground">
              {riskInfo.description} 
              {riskScore > 50 && (
                <span className="block mt-1 text-xs">
                  Consider proactive outreach to address potential concerns.
                </span>
              )}
            </p>
            
            {riskScore > 70 && (
              <div className={`text-xs mt-2 p-2 rounded ${riskInfo.bgColor} ${riskInfo.color}`}>
                <span className="font-semibold">Action recommended:</span> Schedule a follow-up call to discuss customer satisfaction and address any issues.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
