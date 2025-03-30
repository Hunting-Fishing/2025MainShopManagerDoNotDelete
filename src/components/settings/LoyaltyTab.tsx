import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PlusCircle, Edit, Trash, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { 
  getLoyaltySettings, 
  updateLoyaltySettings, 
  toggleLoyaltyProgramEnabled,
  getAvailableRewards,
  createReward,
  updateReward,
  deleteReward,
} from "@/services/loyalty";
import { LoyaltySettings, LoyaltyReward, DEFAULT_LOYALTY_TIERS } from "@/types/loyalty";

export function LoyaltyTab() {
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [isAddRewardOpen, setIsAddRewardOpen] = useState<boolean>(false);
  const [editingReward, setEditingReward] = useState<LoyaltyReward | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const shopId = "DEFAULT-SHOP-ID"; // Placeholder
      const settingsData = await getLoyaltySettings(shopId);
      setSettings(settingsData);
      
      if (settingsData) {
        const rewardsData = await getAvailableRewards(settingsData.shop_id);
        setRewards(rewardsData);
      }
    } catch (error) {
      console.error("Error loading loyalty settings:", error);
      toast.error("Failed to load loyalty program settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleProgram = async (enabled: boolean) => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      const updated = await toggleLoyaltyProgramEnabled(settings.id, enabled);
      setSettings(updated);
      toast.success(`Loyalty program ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error("Error toggling loyalty program:", error);
      toast.error("Failed to update loyalty program status");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async (formData: Partial<LoyaltySettings>) => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      const updated = await updateLoyaltySettings({
        ...formData,
        id: settings.id
      });
      setSettings(updated);
      toast.success("Loyalty program settings saved");
    } catch (error) {
      console.error("Error saving loyalty settings:", error);
      toast.error("Failed to save loyalty program settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading loyalty program settings...</div>;
  }

  if (!settings) {
    return <div className="p-6">Error loading loyalty program settings</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Loyalty Program</CardTitle>
            <Switch 
              checked={settings.is_enabled}
              onCheckedChange={handleToggleProgram}
              disabled={isSaving}
            />
          </div>
          <CardDescription>
            Enable or disable the customer loyalty program for your shop
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleSaveSettings({
              points_per_dollar: parseFloat(formData.get('pointsPerDollar') as string),
              points_expiration_days: parseInt(formData.get('expirationDays') as string)
            });
          }}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pointsPerDollar">Points per Dollar Spent</Label>
                <Input 
                  id="pointsPerDollar" 
                  name="pointsPerDollar"
                  type="number" 
                  defaultValue={settings.points_per_dollar}
                  step="0.1"
                  min="0.1"
                  disabled={!settings.is_enabled || isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expirationDays">Points Expiration (Days)</Label>
                <Input 
                  id="expirationDays" 
                  name="expirationDays"
                  type="number" 
                  defaultValue={settings.points_expiration_days}
                  min="1"
                  disabled={!settings.is_enabled || isSaving}
                />
              </div>
            </div>
            <div className="mt-4">
              <Button 
                type="submit" 
                disabled={!settings.is_enabled || isSaving}
                className="bg-esm-blue-600 hover:bg-esm-blue-700"
              >
                Save Settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Loyalty Tiers</CardTitle>
          </div>
          <CardDescription>
            Tier thresholds and benefits for your loyalty program
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DEFAULT_LOYALTY_TIERS.map((tier) => (
              <div key={tier.name} className="flex items-start">
                <div className={`w-4 h-4 mt-1 rounded-full ${tier.color} mr-2`}></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{tier.name}</h4>
                    <span className="text-sm text-muted-foreground">
                      {tier.threshold.toLocaleString()} points
                    </span>
                  </div>
                  <ul className="text-sm text-muted-foreground mt-1">
                    {tier.perks.map((perk, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Rewards</CardTitle>
            <Dialog open={isAddRewardOpen} onOpenChange={setIsAddRewardOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  disabled={!settings.is_enabled}
                  onClick={() => {
                    setEditingReward(null);
                    setIsAddRewardOpen(true);
                  }}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Reward
                </Button>
              </DialogTrigger>
              <DialogContent>
                <RewardForm 
                  onSave={async (reward) => {
                    try {
                      if (editingReward) {
                        const updated = await updateReward({
                          ...reward,
                          id: editingReward.id,
                          shop_id: settings.shop_id
                        });
                        setRewards(rewards.map(r => r.id === updated.id ? updated : r));
                        toast.success("Reward updated successfully");
                      } else {
                        const newReward = await createReward({
                          ...reward,
                          shop_id: settings.shop_id,
                          name: reward.name || '',
                          points_cost: reward.points_cost || 0,
                          is_active: reward.is_active ?? true,
                          reward_type: reward.reward_type || 'discount'
                        });
                        setRewards([...rewards, newReward]);
                        toast.success("Reward created successfully");
                      }
                      setIsAddRewardOpen(false);
                    } catch (error) {
                      console.error("Error saving reward:", error);
                      toast.error("Failed to save reward");
                    }
                  }}
                  reward={editingReward}
                />
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>
            Manage rewards that customers can redeem with their loyalty points
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rewards.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No rewards have been created yet. 
              {settings.is_enabled && "Click the Add Reward button to create your first reward."}
            </div>
          ) : (
            <div className="space-y-4">
              {rewards.map((reward) => (
                <div key={reward.id} className="flex items-start justify-between border p-4 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{reward.name}</h4>
                      <Badge variant={reward.is_active ? "default" : "outline"}>
                        {reward.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {reward.description && (
                      <p className="text-sm text-muted-foreground mt-1">{reward.description}</p>
                    )}
                    <div className="mt-2 text-sm font-medium">{reward.points_cost.toLocaleString()} points</div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setEditingReward(reward);
                        setIsAddRewardOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={async () => {
                        if (window.confirm("Are you sure you want to delete this reward?")) {
                          try {
                            await deleteReward(reward.id);
                            setRewards(rewards.filter(r => r.id !== reward.id));
                            toast.success("Reward deleted successfully");
                          } catch (error) {
                            console.error("Error deleting reward:", error);
                            toast.error("Failed to delete reward");
                          }
                        }
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface RewardFormProps {
  onSave: (reward: Partial<LoyaltyReward>) => Promise<void>;
  reward?: LoyaltyReward | null;
}

function RewardForm({ onSave, reward }: RewardFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: reward?.name || '',
      description: reward?.description || '',
      points_cost: reward?.points_cost || 100,
      is_active: reward?.is_active ?? true,
      reward_type: reward?.reward_type || 'discount',
      reward_value: reward?.reward_value || 0
    }
  });

  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      await onSave(data);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{reward ? 'Edit Reward' : 'Add New Reward'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Reward Name</Label>
          <Input 
            id="name"
            {...register('name', { required: 'Reward name is required' })}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            {...register('description')}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="points_cost">Points Cost</Label>
          <Input
            id="points_cost"
            type="number"
            min="1"
            {...register('points_cost', { 
              required: 'Points cost is required',
              min: { value: 1, message: 'Points must be at least 1' } 
            })}
          />
          {errors.points_cost && <p className="text-sm text-red-500">{errors.points_cost.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reward_type">Reward Type</Label>
          <select
            id="reward_type"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            {...register('reward_type', { required: 'Reward type is required' })}
          >
            <option value="discount">Discount</option>
            <option value="service">Service</option>
            <option value="product">Product</option>
            <option value="other">Other</option>
          </select>
          {errors.reward_type && <p className="text-sm text-red-500">{errors.reward_type.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reward_value">Value ($ for discounts, 0 for other rewards)</Label>
          <Input
            id="reward_value"
            type="number"
            min="0"
            step="0.01"
            {...register('reward_value', { 
              min: { value: 0, message: 'Value cannot be negative' } 
            })}
          />
          {errors.reward_value && <p className="text-sm text-red-500">{errors.reward_value.message}</p>}
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            {...register('is_active')}
            defaultChecked={reward?.is_active ?? true}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
        
        <DialogFooter>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Reward'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
