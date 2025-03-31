
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [riskFactors, setRiskFactors] = useState<{factor: string, impact: number}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const score = await calculateRetentionRiskScore(customerId);
        setRiskScore(score);
        
        // In a real implementation, these would be dynamically calculated
        // based on actual customer data and behavior patterns
        if (score !== null) {
          setRiskFactors([
            { 
              factor: "Time since last service", 
              impact: score > 50 ? 35 : 15 
            },
            { 
              factor: "Service satisfaction", 
              impact: score > 70 ? 25 : 10 
            },
            { 
              factor: "Competitor pricing", 
              impact: score > 40 ? 20 : 10 
            },
            { 
              factor: "Communication engagement", 
              impact: score > 60 ? 30 : 10 
            }
          ]);
        }
      } catch (error) {
        console.error("Error calculating retention risk:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId]);

  const getRiskCategory = () => {
    if (riskScore === null) return "Unknown";
    if (riskScore < 20) return "Very Low";
    if (riskScore < 40) return "Low";
    if (riskScore < 60) return "Medium";
    if (riskScore < 80) return "High";
    return "Very High";
  };

  const getRiskColor = () => {
    if (riskScore === null) return "text-gray-500";
    if (riskScore < 20) return "text-green-600";
    if (riskScore < 40) return "text-blue-600";
    if (riskScore < 60) return "text-amber-600";
    if (riskScore < 80) return "text-orange-600";
    return "text-red-600";
  };

  const getProgressColor = () => {
    if (riskScore === null) return "bg-gray-400";
    if (riskScore < 20) return "bg-green-500";
    if (riskScore < 40) return "bg-blue-500";
    if (riskScore < 60) return "bg-amber-500";
    if (riskScore < 80) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Retention Risk</CardTitle>
        <CardDescription>
          Customer churn prediction analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <div className={`text-3xl font-bold ${getRiskColor()}`}>
                {getRiskCategory()}
              </div>
              {riskScore !== null && (
                <div className={`text-xl font-medium ${getRiskColor()}`}>
                  {riskScore}%
                </div>
              )}
            </div>
            
            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
              <div 
                className={`h-2.5 rounded-full ${getProgressColor()}`} 
                style={{ width: `${riskScore || 0}%` }}
              ></div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Key Risk Factors</h4>
              <div className="space-y-3">
                {riskFactors.map((factor, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{factor.factor}</span>
                      <span className={factor.impact > 20 ? "text-amber-600" : "text-gray-600"}>
                        {factor.impact}% impact
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${factor.impact > 20 ? "bg-amber-500" : "bg-blue-500"}`}
                        style={{ width: `${factor.impact * 2}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {riskScore !== null && riskScore > 40 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <h4 className="text-sm font-medium text-amber-800 mb-1">Recommended Actions</h4>
                <ul className="text-xs text-amber-700 list-disc list-inside">
                  <li>Schedule follow-up call to discuss satisfaction</li>
                  <li>Offer seasonal maintenance discount</li>
                  <li>Send personalized service reminder</li>
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
