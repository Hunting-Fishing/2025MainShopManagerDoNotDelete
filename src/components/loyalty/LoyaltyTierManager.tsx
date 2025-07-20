import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoyaltyTier } from '@/types/loyalty';

interface LoyaltyTierManagerProps {
  tiers: LoyaltyTier[];
  onTiersChange: (tiers: LoyaltyTier[]) => void;
}

export function LoyaltyTierManager({ tiers, onTiersChange }: LoyaltyTierManagerProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Tiers</CardTitle>
          <CardDescription>
            Configure loyalty program tiers and rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Loyalty tier management coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}