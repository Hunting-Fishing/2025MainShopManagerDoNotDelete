import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Edit, Save, Gift, Star, Award } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LoyaltySettings {
  pointsPerDollar: number;
  signupBonus: number;
  referralBonus: number;
  birthdayBonus: number;
  enableNotifications: boolean;
  termsAndConditions: string;
}

const defaultSettings: LoyaltySettings = {
  pointsPerDollar: 1,
  signupBonus: 50,
  referralBonus: 100,
  birthdayBonus: 75,
  enableNotifications: true,
  termsAndConditions: "These are the default terms and conditions for our loyalty program."
};

export function LoyaltyTab() {
  const [settings, setSettings] = useState<LoyaltySettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    // Load settings from database or local storage
    const loadSettings = async () => {
      setLoading(true);
      try {
        // Simulate fetching settings from a database
        // Replace this with your actual data fetching logic
        await new Promise(resolve => setTimeout(resolve, 500));
        setSettings(defaultSettings);
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast({
          title: "Error",
          description: "Failed to load loyalty settings",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate saving settings to a database
      // Replace this with your actual data saving logic
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({
        title: "Success",
        description: "Loyalty settings saved successfully"
      });
      setEditing(false);
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error",
        description: "Failed to save loyalty settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      enableNotifications: checked
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Loyalty Program Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading settings...</p>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">General Settings</h4>
              {!editing ? (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div>
                  <Button variant="secondary" size="sm" onClick={() => setEditing(false)} className="mr-2">
                    Cancel
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSave} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pointsPerDollar">Points per Dollar</Label>
                <Input 
                  type="number" 
                  id="pointsPerDollar" 
                  name="pointsPerDollar"
                  value={settings.pointsPerDollar}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </div>
              <div>
                <Label htmlFor="signupBonus">Signup Bonus</Label>
                <Input 
                  type="number" 
                  id="signupBonus" 
                  name="signupBonus"
                  value={settings.signupBonus}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </div>
              <div>
                <Label htmlFor="referralBonus">Referral Bonus</Label>
                <Input 
                  type="number" 
                  id="referralBonus" 
                  name="referralBonus"
                  value={settings.referralBonus}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </div>
              <div>
                <Label htmlFor="birthdayBonus">Birthday Bonus</Label>
                <Input 
                  type="number" 
                  id="birthdayBonus"
                  name="birthdayBonus"
                  value={settings.birthdayBonus}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="termsAndConditions">Terms and Conditions</Label>
              <Textarea
                id="termsAndConditions"
                name="termsAndConditions"
                value={settings.termsAndConditions}
                onChange={handleInputChange}
                disabled={!editing}
                className="resize-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="enableNotifications">Enable Notifications</Label>
              <Switch
                id="enableNotifications"
                checked={settings.enableNotifications}
                onCheckedChange={handleSwitchChange}
                disabled={!editing}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
