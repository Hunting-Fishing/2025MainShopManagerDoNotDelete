
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormField } from "@/components/ui/form-field";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Gift, Coins, Award, Trash2, PlusCircle, Settings, Users, History } from "lucide-react";
import { 
  getLoyaltySettings, 
  updateLoyaltySettings, 
  toggleLoyaltyProgramEnabled 
} from "@/services/loyalty/settingsService";
import { 
  getAvailableRewards, 
  createReward, 
  updateReward, 
  deleteReward 
} from "@/services/loyalty/rewardService";
import { LoyaltySettings, LoyaltyReward, DEFAULT_LOYALTY_TIERS } from "@/types/loyalty";

export function LoyaltyTab() {
  const [activeTab, setActiveTab] = useState<string>("general");
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [newReward, setNewReward] = useState<Partial<LoyaltyReward>>({
    name: "",
    description: "",
    points_cost: 100,
    reward_type: "discount",
    reward_value: 10,
    is_active: true
  });
  const [isAddingReward, setIsAddingReward] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    loadLoyaltyData();
  }, []);

  const loadLoyaltyData = async () => {
    try {
      setLoading(true);
      // Get the shop ID from the first shop we find in the database
      // This is a simplification - in a multi-shop environment, you'd get this from the user's context
      const shopSettings = await getLoyaltySettings("current");
      setSettings(shopSettings);

      if (shopSettings?.shop_id) {
        const rewardsList = await getAvailableRewards(shopSettings.shop_id);
        setRewards(rewardsList);
      }
    } catch (error) {
      console.error("Error loading loyalty data:", error);
      toast({
        variant: "destructive",
        title: "Failed to load loyalty program data",
        description: "There was a problem loading the loyalty program settings."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (field: string, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const handleToggleLoyaltyProgram = async () => {
    if (!settings?.id) return;
    
    try {
      setSaving(true);
      const updatedSettings = await toggleLoyaltyProgramEnabled(
        settings.id,
        !settings.is_enabled
      );
      setSettings(updatedSettings);
      
      toast({
        title: settings.is_enabled ? "Loyalty program disabled" : "Loyalty program enabled",
        description: settings.is_enabled 
          ? "The loyalty program has been disabled."
          : "The loyalty program has been enabled.",
      });
    } catch (error) {
      console.error("Error toggling loyalty program:", error);
      toast({
        variant: "destructive",
        title: "Failed to update loyalty program status",
        description: "There was a problem updating the loyalty program status."
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      const updatedSettings = await updateLoyaltySettings(settings);
      setSettings(updatedSettings);
      
      toast({
        title: "Settings saved",
        description: "Loyalty program settings have been updated."
      });
    } catch (error) {
      console.error("Error saving loyalty settings:", error);
      toast({
        variant: "destructive",
        title: "Failed to save settings",
        description: "There was a problem saving the loyalty program settings."
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddReward = async () => {
    if (!settings?.shop_id || !newReward.name || !newReward.points_cost) {
      toast({
        variant: "destructive",
        title: "Invalid reward data",
        description: "Please provide a name and points cost for the reward."
      });
      return;
    }
    
    try {
      setSaving(true);
      const rewardData = {
        ...newReward,
        shop_id: settings.shop_id,
        is_active: true
      } as LoyaltyReward;
      
      const createdReward = await createReward(rewardData);
      setRewards([...rewards, createdReward]);
      setNewReward({
        name: "",
        description: "",
        points_cost: 100,
        reward_type: "discount",
        reward_value: 10,
        is_active: true
      });
      setIsAddingReward(false);
      
      toast({
        title: "Reward added",
        description: "The new reward has been added to the loyalty program."
      });
    } catch (error) {
      console.error("Error adding reward:", error);
      toast({
        variant: "destructive",
        title: "Failed to add reward",
        description: "There was a problem adding the new reward."
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateReward = async (reward: LoyaltyReward) => {
    try {
      setSaving(true);
      const updatedReward = await updateReward(reward);
      setRewards(rewards.map(r => r.id === updatedReward.id ? updatedReward : r));
      setEditingRewardId(null);
      
      toast({
        title: "Reward updated",
        description: "The reward has been updated successfully."
      });
    } catch (error) {
      console.error("Error updating reward:", error);
      toast({
        variant: "destructive",
        title: "Failed to update reward",
        description: "There was a problem updating the reward."
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReward = async (rewardId: string) => {
    try {
      setSaving(true);
      await deleteReward(rewardId);
      setRewards(rewards.filter(r => r.id !== rewardId));
      
      toast({
        title: "Reward removed",
        description: "The reward has been removed from the loyalty program."
      });
    } catch (error) {
      console.error("Error deleting reward:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete reward",
        description: "There was a problem deleting the reward."
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Loyalty Program</h2>
          <p className="text-muted-foreground">
            Configure your customer loyalty program settings and rewards
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch 
            id="loyalty-enabled" 
            checked={settings?.is_enabled || false}
            onCheckedChange={handleToggleLoyaltyProgram}
            disabled={saving}
          />
          <Label htmlFor="loyalty-enabled">
            {settings?.is_enabled ? "Enabled" : "Disabled"}
          </Label>
        </div>
      </div>

      {!settings?.is_enabled && (
        <Alert className="bg-muted">
          <AlertTitle>Loyalty program is currently disabled</AlertTitle>
          <AlertDescription>
            Enable the loyalty program to start rewarding your customers for their purchases and visits.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            <span>Rewards</span>
          </TabsTrigger>
          <TabsTrigger value="tiers" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span>Tiers</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Program Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="Points per dollar spent"
                type="number"
                id="points-per-dollar"
                value={settings?.points_per_dollar || 1}
                onChange={(e) => handleSettingsChange('points_per_dollar', parseFloat(e.target.value))}
                description="How many loyalty points customers earn for every dollar spent"
              />
              
              <FormField
                label="Points expiration (days)"
                type="number"
                id="expiration-days"
                value={settings?.points_expiration_days || 365}
                onChange={(e) => handleSettingsChange('points_expiration_days', parseInt(e.target.value))}
                description="Number of days until earned points expire (0 = no expiration)"
              />
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSaveSettings} 
                disabled={saving || !settings?.is_enabled}
              >
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="rewards" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Available Rewards</CardTitle>
              <Button 
                onClick={() => setIsAddingReward(!isAddingReward)}
                variant="outline"
                size="sm"
                disabled={!settings?.is_enabled}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Reward
              </Button>
            </CardHeader>
            <CardContent>
              {isAddingReward && (
                <div className="bg-muted/50 p-4 rounded-md mb-4 border border-dashed">
                  <h3 className="text-lg font-medium mb-3">New Reward</h3>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        label="Reward Name"
                        id="reward-name"
                        value={newReward.name || ""}
                        onChange={(e) => setNewReward({...newReward, name: e.target.value})}
                        placeholder="e.g. Free Oil Change"
                      />
                      <FormField
                        label="Points Cost"
                        id="points-cost"
                        type="number"
                        value={newReward.points_cost || 100}
                        onChange={(e) => setNewReward({...newReward, points_cost: parseInt(e.target.value)})}
                      />
                    </div>
                    <FormField
                      label="Description"
                      id="description"
                      value={newReward.description || ""}
                      onChange={(e) => setNewReward({...newReward, description: e.target.value})}
                      placeholder="Describe the reward"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="reward-type">Type</Label>
                        <select 
                          id="reward-type"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={newReward.reward_type || "discount"}
                          onChange={(e) => setNewReward({...newReward, reward_type: e.target.value as 'discount' | 'service' | 'product' | 'other'})}
                        >
                          <option value="discount">Discount</option>
                          <option value="service">Free Service</option>
                          <option value="product">Free Product</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      {newReward.reward_type === 'discount' && (
                        <FormField
                          label="Discount Value (%)"
                          id="reward-value"
                          type="number"
                          value={newReward.reward_value || 10}
                          onChange={(e) => setNewReward({...newReward, reward_value: parseInt(e.target.value)})}
                        />
                      )}
                    </div>
                    <div className="flex justify-end space-x-2 mt-2">
                      <Button variant="outline" onClick={() => setIsAddingReward(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddReward} disabled={saving}>
                        Add Reward
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {rewards.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Gift className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <h3 className="font-medium mb-1">No rewards defined</h3>
                  <p className="text-sm">Add rewards to your loyalty program</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rewards.map((reward) => (
                    <div 
                      key={reward.id} 
                      className="flex items-center justify-between border-b pb-4 last:border-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{reward.name}</h3>
                          <Badge variant="outline">
                            <Coins className="h-3 w-3 mr-1" />
                            {reward.points_cost} points
                          </Badge>
                          {!reward.is_active && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        {reward.description && (
                          <p className="text-sm text-muted-foreground">{reward.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteReward(reward.id)}
                          disabled={saving}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tiers" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Loyalty Tiers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {DEFAULT_LOYALTY_TIERS.map((tier, index) => (
                  <div 
                    key={tier.name} 
                    className={`p-4 rounded-md ${
                      index === 0 ? 'border-green-200 bg-green-50' :
                      index === 1 ? 'border-blue-200 bg-blue-50' :
                      index === 2 ? 'border-purple-200 bg-purple-50' :
                      index === 3 ? 'border-amber-200 bg-amber-50' : ''
                    } border`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-lg flex items-center">
                        <Award className={`h-5 w-5 mr-2 ${
                          index === 0 ? 'text-green-600' :
                          index === 1 ? 'text-blue-600' :
                          index === 2 ? 'text-purple-600' :
                          index === 3 ? 'text-amber-600' : ''
                        }`} />
                        {tier.name}
                      </h3>
                      <Badge variant="outline">
                        {tier.threshold.toLocaleString()} points
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{tier.benefits}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
