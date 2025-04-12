
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { LoyaltySettings, LoyaltyTier, DEFAULT_LOYALTY_TIERS } from "@/types/loyalty";
import { supabase } from "@/lib/supabase";

export function LoyaltyTab() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);
  const [tiers, setTiers] = useState<LoyaltyTier[]>(DEFAULT_LOYALTY_TIERS);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadLoyaltySettings();
  }, []);

  const loadLoyaltySettings = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Get user's shop ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .single();
      
      if (!profile?.shop_id) {
        throw new Error("No shop associated with user");
      }

      // Get loyalty settings
      const { data } = await supabase
        .from('loyalty_settings')
        .select('*')
        .eq('shop_id', profile.shop_id)
        .single();
      
      if (data) {
        setSettings(data);
        
        // Get loyalty tiers if they exist
        const { data: tierData } = await supabase
          .from('loyalty_tiers')
          .select('*')
          .eq('shop_id', profile.shop_id)
          .order('threshold', { ascending: true });
          
        if (tierData && tierData.length > 0) {
          setTiers(tierData);
        }
      } else {
        // Create default settings
        const defaultSettings = {
          shop_id: profile.shop_id,
          is_enabled: false,
          points_per_dollar: 1,
          points_expiration_days: 365
        };
        
        setSettings(defaultSettings as LoyaltySettings);
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
    if (!settings) return;
    
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
    </div>
  );
}
