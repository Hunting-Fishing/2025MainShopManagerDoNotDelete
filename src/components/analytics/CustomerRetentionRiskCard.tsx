
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { calculateRetentionRiskScore } from '@/utils/analytics/customerSegmentation';

interface CustomerRetentionRiskCardProps {
  customerId: string;
  className?: string;
}

export const CustomerRetentionRiskCard: React.FC<CustomerRetentionRiskCardProps> = ({ 
  customerId,
  className 
}) => {
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiskScore = async () => {
      setLoading(true);
      try {
        const score = await calculateRetentionRiskScore(customerId);
        setRiskScore(score);
      } catch (error) {
        console.error("Error fetching retention risk score:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRiskScore();
  }, [customerId]);

  const getRiskLevel = () => {
    if (riskScore === null) return { text: "Unknown", color: "text-gray-500", icon: null };
    
    if (riskScore >= 70) {
      return { text: "High Risk", color: "text-red-600", icon: <AlertTriangle className="h-5 w-5" /> };
    } else if (riskScore >= 40) {
      return { text: "Medium Risk", color: "text-amber-600", icon: <AlertCircle className="h-5 w-5" /> };
    } else {
      return { text: "Low Risk", color: "text-green-600", icon: <CheckCircle2 className="h-5 w-5" /> };
    }
  };

  const riskLevel = getRiskLevel();
  
  const getProgressColor = () => {
    if (riskScore === null) return "bg-gray-200";
    if (riskScore >= 70) return "bg-red-600";
    if (riskScore >= 40) return "bg-amber-600";
    return "bg-green-600";
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Retention Risk</CardTitle>
        <CardDescription>
          Likelihood of customer churn
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <span className={`font-semibold ${riskLevel.color}`}>
                {riskLevel.text}
              </span>
              {riskLevel.icon}
            </div>
            
            <Progress 
              value={riskScore || 0} 
              max={100}
              className="h-2"
              indicatorClassName={getProgressColor()}
            />
            
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
