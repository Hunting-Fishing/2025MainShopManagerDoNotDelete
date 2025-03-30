
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Gift, Clock, HistoryIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { CustomerLoyalty, LoyaltyTransaction, LoyaltyReward, LoyaltyRedemption } from "@/types/loyalty";
import { 
  getCustomerLoyalty,
  getCustomerTransactions,
  getAvailableRewards,
  redeemPoints,
  addCustomerPoints,
  getCustomerRedemptions,
  updateRedemptionStatus,
  getTierByName,
  getLoyaltySettings
} from "@/services/loyaltyService";

interface CustomerLoyaltyCardProps {
  customerId: string;
}

export function CustomerLoyaltyCard({ customerId }: CustomerLoyaltyCardProps) {
  const [loyalty, setLoyalty] = useState<CustomerLoyalty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<'points' | 'rewards' | 'history'>('points');

  useEffect(() => {
    loadCustomerLoyalty();
  }, [customerId]);

  const loadCustomerLoyalty = async () => {
    setIsLoading(true);
    try {
      // First check if loyalty program is enabled
      const shopId = "DEFAULT-SHOP-ID"; // Placeholder - would come from user context
      const settings = await getLoyaltySettings(shopId);
      setLoyaltyEnabled(settings?.is_enabled || false);
      
      if (settings?.is_enabled) {
        const data = await getCustomerLoyalty(customerId);
        setLoyalty(data);
      }
    } catch (error) {
      console.error("Error loading customer loyalty:", error);
      toast.error("Failed to load loyalty information");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Program</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading loyalty information...</div>
        </CardContent>
      </Card>
    );
  }

  if (!loyaltyEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Program</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            The loyalty program is not enabled for your shop.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!loyalty) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Program</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Failed to load loyalty information
            <Button 
              variant="link" 
              onClick={loadCustomerLoyalty}
              className="block mx-auto mt-2"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tier = getTierByName(loyalty.tier);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loyalty Program</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Loyalty summary */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{loyalty.current_points.toLocaleString()}</span>
                <span className="text-muted-foreground">available points</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={tier.color}>{loyalty.tier}</Badge>
                <span className="text-xs text-muted-foreground">
                  Lifetime: {loyalty.lifetime_points.toLocaleString()} points
                </span>
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Points
                </Button>
              </DialogTrigger>
              <DialogContent>
                <AddPointsForm 
                  customerId={customerId} 
                  onSuccess={(updatedLoyalty) => {
                    setLoyalty(updatedLoyalty);
                    toast.success("Points added successfully");
                  }} 
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Tab navigation */}
          <div className="flex border-b">
            <button
              className={`px-4 py-2 ${activeTab === 'points' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('points')}
            >
              Rewards
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'rewards' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('rewards')}
            >
              Redemptions
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'history' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('history')}
            >
              History
            </button>
          </div>

          {/* Tab content */}
          <div className="min-h-[250px]">
            {activeTab === 'points' && (
              <RewardsTab 
                customerId={customerId} 
                currentPoints={loyalty.current_points}
                onRedemption={(updatedLoyalty) => {
                  setLoyalty(updatedLoyalty);
                }} 
              />
            )}
            {activeTab === 'rewards' && (
              <RedemptionsTab 
                customerId={customerId}
                onStatusUpdate={(updatedLoyalty) => {
                  if (updatedLoyalty) {
                    setLoyalty(updatedLoyalty);
                  }
                }}
              />
            )}
            {activeTab === 'history' && (
              <HistoryTab customerId={customerId} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Add Points Form
interface AddPointsFormProps {
  customerId: string;
  onSuccess: (updatedLoyalty: CustomerLoyalty) => void;
}

function AddPointsForm({ customerId, onSuccess }: AddPointsFormProps) {
  const [points, setPoints] = useState<number>(100);
  const [reason, setReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await addCustomerPoints(
        customerId,
        points,
        'adjust',
        reason || 'Manual adjustment'
      );
      
      onSuccess(result.loyalty);
    } catch (error) {
      console.error("Error adding points:", error);
      toast.error("Failed to add points");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add Loyalty Points</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Points</label>
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(parseInt(e.target.value))}
            className="w-full rounded-md border border-input p-2"
            min="1"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Reason (optional)</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-md border border-input p-2"
            placeholder="e.g., Service discount, Adjustment, etc."
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Add Points'}
          </Button>
        </div>
      </form>
    </>
  );
}

// Rewards Tab
interface RewardsTabProps {
  customerId: string;
  currentPoints: number;
  onRedemption: (updatedLoyalty: CustomerLoyalty) => void;
}

function RewardsTab({ customerId, currentPoints, onRedemption }: RewardsTabProps) {
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRedeeming, setIsRedeeming] = useState<boolean>(false);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    setIsLoading(true);
    try {
      const shopId = "DEFAULT-SHOP-ID"; // Placeholder
      const rewardsData = await getAvailableRewards(shopId);
      setRewards(rewardsData);
    } catch (error) {
      console.error("Error loading rewards:", error);
      toast.error("Failed to load available rewards");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeem = async (rewardId: string, pointsCost: number) => {
    if (pointsCost > currentPoints) {
      toast.error("Not enough points to redeem this reward");
      return;
    }
    
    setIsRedeeming(true);
    try {
      const result = await redeemPoints(customerId, rewardId, pointsCost);
      onRedemption(result.updatedLoyalty);
      toast.success("Reward redeemed successfully");
    } catch (error) {
      console.error("Error redeeming reward:", error);
      toast.error("Failed to redeem reward");
    } finally {
      setIsRedeeming(false);
    }
  };

  if (isLoading) {
    return <div className="py-4 text-center">Loading available rewards...</div>;
  }

  if (rewards.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <Gift className="mx-auto h-12 w-12 mb-3 opacity-30" />
        <p>No rewards are currently available.</p>
        <p className="text-sm">Check back later or contact your administrator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Available rewards that can be redeemed with loyalty points
      </p>
      <div className="space-y-3">
        {rewards.map((reward) => (
          <div 
            key={reward.id} 
            className="flex justify-between items-center p-3 border rounded-lg"
          >
            <div>
              <div className="font-medium">{reward.name}</div>
              {reward.description && (
                <div className="text-sm text-muted-foreground">
                  {reward.description}
                </div>
              )}
              <div className="text-sm mt-1 font-semibold">
                {reward.points_cost.toLocaleString()} points
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPoints < reward.points_cost || isRedeeming}
              onClick={() => handleRedeem(reward.id, reward.points_cost)}
            >
              Redeem
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Redemptions Tab
interface RedemptionsTabProps {
  customerId: string;
  onStatusUpdate: (updatedLoyalty: CustomerLoyalty | null) => void;
}

function RedemptionsTab({ customerId, onStatusUpdate }: RedemptionsTabProps) {
  const [redemptions, setRedemptions] = useState<LoyaltyRedemption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    loadRedemptions();
  }, [customerId]);

  const loadRedemptions = async () => {
    setIsLoading(true);
    try {
      const data = await getCustomerRedemptions(customerId);
      setRedemptions(data);
    } catch (error) {
      console.error("Error loading redemptions:", error);
      toast.error("Failed to load redemption history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (redemptionId: string, status: 'completed' | 'cancelled') => {
    setIsUpdating(true);
    try {
      const updatedRedemption = await updateRedemptionStatus(
        redemptionId,
        status
      );
      
      // Update the redemptions list
      setRedemptions(redemptions.map(r => 
        r.id === redemptionId ? updatedRedemption : r
      ));
      
      // If cancelled, the customer loyalty will have been updated
      if (status === 'cancelled') {
        // Reload customer loyalty to get updated points
        const updatedLoyalty = await getCustomerLoyalty(customerId);
        onStatusUpdate(updatedLoyalty);
      } else {
        onStatusUpdate(null);
      }
      
      toast.success(`Redemption marked as ${status}`);
    } catch (error) {
      console.error(`Error updating redemption status to ${status}:`, error);
      toast.error("Failed to update redemption status");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className="py-4 text-center">Loading redemption history...</div>;
  }

  if (redemptions.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <Gift className="mx-auto h-12 w-12 mb-3 opacity-30" />
        <p>No rewards have been redeemed yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Recent reward redemptions
      </p>
      <div className="space-y-3">
        {redemptions.map((redemption) => (
          <div 
            key={redemption.id} 
            className="p-3 border rounded-lg"
          >
            <div className="flex justify-between">
              <div>
                <div className="font-medium">
                  {redemption.reward?.name || 'Unknown Reward'}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm">
                    {redemption.points_used.toLocaleString()} points
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(redemption.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Badge
                variant={
                  redemption.status === 'completed' ? 'default' :
                  redemption.status === 'cancelled' ? 'destructive' : 'outline'
                }
              >
                {redemption.status}
              </Badge>
            </div>
            
            {/* Action buttons for pending redemptions */}
            {redemption.status === 'pending' && (
              <div className="flex justify-end gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus(redemption.id, 'completed')}
                >
                  Mark Complete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus(redemption.id, 'cancelled')}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Transaction History Tab
interface HistoryTabProps {
  customerId: string;
}

function HistoryTab({ customerId }: HistoryTabProps) {
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadTransactions();
  }, [customerId]);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await getCustomerTransactions(customerId);
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
      toast.error("Failed to load transaction history");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="py-4 text-center">Loading transaction history...</div>;
  }

  if (transactions.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <HistoryIcon className="mx-auto h-12 w-12 mb-3 opacity-30" />
        <p>No transaction history available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Recent points transactions
      </p>
      <div className="space-y-2">
        {transactions.map((transaction) => (
          <div 
            key={transaction.id} 
            className="flex justify-between items-center p-2 border-b"
          >
            <div>
              <div className="text-sm">
                {transaction.description || getTransactionTypeLabel(transaction.transaction_type)}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(transaction.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className={`font-medium ${transaction.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {transaction.points >= 0 ? '+' : ''}{transaction.points}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function to get user-friendly transaction type labels
function getTransactionTypeLabel(type: string): string {
  switch (type) {
    case 'earn':
      return 'Points earned';
    case 'redeem':
      return 'Reward redemption';
    case 'expire':
      return 'Points expired';
    case 'adjust':
      return 'Manual adjustment';
    default:
      return type;
  }
}
