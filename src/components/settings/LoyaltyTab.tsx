
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit2, Award, ChevronDown, ChevronUp } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoyaltySettings, LoyaltyTier } from "@/types/loyalty";
import { supabase } from "@/lib/supabase";
import { useShopId } from "@/hooks/useShopId";
import { LoyaltyTierForm } from "./loyalty/LoyaltyTierForm";
import { LoyaltyTierCard } from "./loyalty/LoyaltyTierCard";

export function LoyaltyTab() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTier, setSelectedTier] = useState<LoyaltyTier | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("settings");
  const { toast } = useToast();
  const { shopId } = useShopId();

  useEffect(() => {
    if (shopId) {
      loadLoyaltySettings();
    }
  }, [shopId]);

  const loadLoyaltySettings = async () => {
    if (!shopId) return;
    
    setLoading(true);
    try {
      // Get loyalty settings
      const { data, error } = await supabase
        .from('loyalty_settings')
        .select('*')
        .eq('shop_id', shopId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      let settingsData = data;
      
      if (!settingsData) {
        // Create default settings
        const defaultSettings = {
          shop_id: shopId,
          is_enabled: false,
          points_per_dollar: 1,
          points_expiration_days: 365
        };
        
        const { data: newSettings, error: createError } = await supabase
          .from('loyalty_settings')
          .insert(defaultSettings)
          .select();
          
        if (createError) throw createError;
        
        settingsData = newSettings[0];
      }
      
      setSettings(settingsData);
      
      // Get loyalty tiers
      const { data: tierData, error: tierError } = await supabase
        .from('loyalty_tiers')
        .select('*')
        .eq('shop_id', shopId)
        .order('threshold', { ascending: true });
        
      if (tierError) throw tierError;
      
      if (tierData && tierData.length > 0) {
        setTiers(tierData);
      } else {
        // Create default tiers if none exist
        const defaultTiers = [
          {
            name: "Standard",
            threshold: 0,
            benefits: "Basic loyalty program benefits",
            multiplier: 1,
            color: "green",
            shop_id: shopId,
            settings_id: settingsData.id
          },
          {
            name: "Silver",
            threshold: 1000,
            benefits: "5% additional points on all purchases, priority scheduling",
            multiplier: 1.05,
            color: "blue",
            shop_id: shopId,
            settings_id: settingsData.id
          },
          {
            name: "Gold",
            threshold: 5000,
            benefits: "10% additional points on all purchases, priority scheduling, free courtesy vehicles",
            multiplier: 1.1, 
            color: "purple",
            shop_id: shopId,
            settings_id: settingsData.id
          },
          {
            name: "Platinum",
            threshold: 10000,
            benefits: "15% additional points on all purchases, VIP service, free courtesy vehicles, complimentary inspections",
            multiplier: 1.15,
            color: "amber",
            shop_id: shopId,
            settings_id: settingsData.id
          }
        ];
        
        const { data: newTiers, error: createTierError } = await supabase
          .from('loyalty_tiers')
          .insert(defaultTiers)
          .select();
          
        if (createTierError) throw createTierError;
        
        setTiers(newTiers);
      }
    } catch (error) {
      console.error("Error loading loyalty settings:", error);
      toast({
        title: "Error",
        description: "Failed to load loyalty program settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnableToggle = (checked: boolean) => {
    setSettings(prev => prev ? { ...prev, is_enabled: checked } : null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => prev ? { ...prev, [name]: Number(value) } : null);
  };

  const handleSave = async () => {
    if (!settings || !shopId) return;
    
    setIsSaving(true);
    try {
      // Update or insert loyalty settings
      let query;
      if (settings.id) {
        query = supabase
          .from('loyalty_settings')
          .update({
            is_enabled: settings.is_enabled,
            points_per_dollar: settings.points_per_dollar,
            points_expiration_days: settings.points_expiration_days
          })
          .eq('id', settings.id);
      } else {
        query = supabase
          .from('loyalty_settings')
          .insert([settings]);
      }
      
      const { error } = await query;
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Loyalty program settings have been saved",
      });
      
      // Reload settings to ensure we have the latest data
      loadLoyaltySettings();
    } catch (error) {
      console.error("Error saving loyalty settings:", error);
      toast({
        title: "Error",
        description: "Failed to save loyalty program settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTier = async (tier: LoyaltyTier) => {
    if (!shopId || !settings) return;
    
    try {
      const tierData = {
        ...tier,
        shop_id: shopId,
        settings_id: settings.id
      };
      
      if (tier.id) {
        // Update existing tier
        const { error } = await supabase
          .from('loyalty_tiers')
          .update(tierData)
          .eq('id', tier.id);
        
        if (error) throw error;
        
        setTiers(prev => prev.map(t => t.id === tier.id ? tierData : t));
        
        toast({
          title: "Success",
          description: `${tier.name} tier has been updated`,
        });
      } else {
        // Create new tier
        const { data, error } = await supabase
          .from('loyalty_tiers')
          .insert(tierData)
          .select();
        
        if (error) throw error;
        
        setTiers(prev => [...prev, data[0]]);
        
        toast({
          title: "Success",
          description: `${tier.name} tier has been created`,
        });
      }
      
      setSelectedTier(null);
    } catch (error) {
      console.error("Error saving loyalty tier:", error);
      toast({
        title: "Error",
        description: "Failed to save loyalty tier",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTier = async () => {
    if (!selectedTier) return;
    
    try {
      const { error } = await supabase
        .from('loyalty_tiers')
        .delete()
        .eq('id', selectedTier.id);
      
      if (error) throw error;
      
      setTiers(prev => prev.filter(t => t.id !== selectedTier.id));
      
      toast({
        title: "Success",
        description: `${selectedTier.name} tier has been deleted`,
      });
      
      setSelectedTier(null);
      setIsDeleteAlertOpen(false);
    } catch (error) {
      console.error("Error deleting loyalty tier:", error);
      toast({
        title: "Error",
        description: "Failed to delete loyalty tier",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="settings">Program Settings</TabsTrigger>
          <TabsTrigger value="tiers">Loyalty Tiers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Loyalty Program Settings</CardTitle>
              <CardDescription>Configure your shop's loyalty program</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="loyalty-enabled">Enable Loyalty Program</Label>
                  <p className="text-sm text-muted-foreground">
                    Turn on the loyalty program for your customers
                  </p>
                </div>
                <Switch 
                  id="loyalty-enabled" 
                  checked={settings?.is_enabled || false}
                  onCheckedChange={handleEnableToggle}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Points Configuration</h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="points-per-dollar">Points Per Dollar</Label>
                    <Input 
                      id="points-per-dollar"
                      name="points_per_dollar"
                      type="number"
                      min="0"
                      step="0.1"
                      value={settings?.points_per_dollar || 0}
                      onChange={handleInputChange}
                      disabled={!settings?.is_enabled}
                    />
                    <p className="text-xs text-muted-foreground">
                      How many points customers earn for each dollar spent
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expiration-days">Points Expiration (Days)</Label>
                    <Input 
                      id="expiration-days"
                      name="points_expiration_days"
                      type="number"
                      min="0"
                      value={settings?.points_expiration_days || 365}
                      onChange={handleInputChange}
                      disabled={!settings?.is_enabled}
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of days before earned points expire
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button 
                  className="bg-esm-blue-600 hover:bg-esm-blue-700" 
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tiers" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Loyalty Tiers</CardTitle>
                  <CardDescription>Manage the loyalty tiers for your program</CardDescription>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-esm-blue-600 hover:bg-esm-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Tier
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Loyalty Tier</DialogTitle>
                    </DialogHeader>
                    <LoyaltyTierForm onSave={handleSaveTier} onCancel={() => setSelectedTier(null)} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tiers.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-lg font-medium">No loyalty tiers defined</p>
                  <p className="text-sm text-muted-foreground">
                    Create your first loyalty tier to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tiers.sort((a, b) => a.threshold - b.threshold).map((tier) => (
                    <LoyaltyTierCard 
                      key={tier.id}
                      tier={tier}
                      onEdit={() => setSelectedTier(tier)}
                      onDelete={() => {
                        setSelectedTier(tier);
                        setIsDeleteAlertOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Edit Tier Dialog */}
          <Dialog open={!!selectedTier && !isDeleteAlertOpen} onOpenChange={(open) => !open && setSelectedTier(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit {selectedTier?.name} Tier</DialogTitle>
              </DialogHeader>
              {selectedTier && (
                <LoyaltyTierForm 
                  tier={selectedTier} 
                  onSave={handleSaveTier} 
                  onCancel={() => setSelectedTier(null)} 
                />
              )}
            </DialogContent>
          </Dialog>
          
          {/* Delete Confirmation */}
          <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Loyalty Tier</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the {selectedTier?.name} tier? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsDeleteAlertOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteTier} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
