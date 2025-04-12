import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Award } from "lucide-react";
import { CustomerLoyalty, LoyaltyTier } from "@/types/loyalty";
import { calculateTier } from "@/services/loyalty/tierService";
import { useShopId } from "@/hooks/useShopId";
import { supabase } from "@/lib/supabase";

interface CustomerLoyaltyCardProps {
  customerLoyalty?: CustomerLoyalty | null;
  isLoading: boolean;
  onAddPoints?: () => void;
  onViewHistory?: () => void;
}

export function CustomerLoyaltyCard({ 
  customerLoyalty, 
  isLoading, 
  onAddPoints, 
  onViewHistory 
}: CustomerLoyaltyCardProps) {
  const [customerTier, setCustomerTier] = useState<LoyaltyTier | null>(null);
  const [nextTier, setNextTier] = useState<LoyaltyTier | null>(null);
  const [pointsToNextTier, setPointsToNextTier] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const { shopId } = useShopId();

  useEffect(() => {
    const loadTierDetails = async () => {
      if (customerLoyalty && shopId) {
        try {
          const tierDetails = await calculateTier(customerLoyalty.lifetime_points, shopId);
          setCustomerTier(tierDetails);
          
          const { data: tiers } = await supabase
            .from('loyalty_tiers')
            .select('*')
            .eq('shop_id', shopId)
            .order('threshold', { ascending: true });
          
          if (tiers && tiers.length > 0) {
            const currentTierIndex = tiers.findIndex(t => t.name === tierDetails.name);
            if (currentTierIndex < tiers.length - 1) {
              const next = tiers[currentTierIndex + 1];
              setNextTier(next);
              
              const pointsNeeded = next.threshold - customerLoyalty.lifetime_points;
              setPointsToNextTier(Math.max(0, pointsNeeded));
              
              const tierRange = next.threshold - tierDetails.threshold;
              const currentProgress = customerLoyalty.lifetime_points - tierDetails.threshold;
              const progressPercent = Math.min(100, Math.max(0, (currentProgress / tierRange) * 100));
              setProgress(progressPercent);
            }
          }
        } catch (error) {
          console.error('Error loading tier details:', error);
        }
      }
    };
    
    loadTierDetails();
  }, [customerLoyalty, shopId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!customerLoyalty) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Program</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No loyalty information available for this customer.</p>
        </CardContent>
      </Card>
    );
  }

  const getTierColor = () => {
    if (!customerTier) return "bg-gray-500";
    
    const colorMap: Record<string, string> = {
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      amber: 'bg-amber-500',
      red: 'bg-red-500',
      teal: 'bg-teal-500'
    };
    
    return colorMap[customerTier.color || ''] || 'bg-gray-500';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Loyalty Program</CardTitle>
          {customerTier && (
            <Badge className={`${getTierColor()} text-white`}>
              {customerTier.name}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold">{customerLoyalty.current_points.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Current Points</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{customerLoyalty.lifetime_points.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Lifetime Points</p>
            </div>
            <div>
              <div className="flex items-center">
                <Award className="h-5 w-5 mr-1 text-amber-500" />
                <span className="text-lg font-medium">{customerLoyalty.tier}</span>
              </div>
              <p className="text-sm text-muted-foreground">Loyalty Tier</p>
            </div>
          </div>
          
          {nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {nextTier.name}</span>
                <span>{pointsToNextTier.toLocaleString()} points needed</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="flex space-x-2 pt-2">
            {onAddPoints && (
              <Button variant="outline" onClick={onAddPoints} className="flex-1">
                Add Points
              </Button>
            )}
            {onViewHistory && (
              <Button variant="outline" onClick={onViewHistory} className="flex-1">
                View History
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
