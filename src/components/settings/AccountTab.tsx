
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { useAuthUser } from "@/hooks/useAuthUser";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export function AccountTab() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { toast } = useToast();
  const { userId } = useAuthUser();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobTitle: ""
  });

  const isDarkModeEnabled = resolvedTheme === 'dark';

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, phone, job_title')
        .eq('id', userId)
        .single();
        
      if (error) {
        throw error;
      }
      
      setUserProfile({
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        jobTitle: data.job_title || ''
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Failed to load profile",
        description: "We couldn't load your profile information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDarkModeToggle = () => {
    const newTheme = isDarkModeEnabled ? 'light' : 'dark';
    setTheme(newTheme);
    
    toast({
      title: `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode enabled`,
      description: `The application theme has been switched to ${newTheme} mode.`,
      duration: 3000,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [id === 'name' ? 'firstName' : id === 'title' ? 'jobTitle' : id]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      
      // Map the form values back to the database column names
      const updateData = {
        first_name: userProfile.firstName,
        last_name: userProfile.lastName,
        email: userProfile.email,
        phone: userProfile.phone,
        job_title: userProfile.jobTitle
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Settings updated",
        description: "Your account settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "Failed to update your profile information.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={userProfile.firstName} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={userProfile.email} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={userProfile.phone || ''} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input 
                    id="title" 
                    value={userProfile.jobTitle || ''} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  className="bg-esm-blue-600 hover:bg-esm-blue-700"
                  onClick={handleSaveChanges}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : "Save Changes"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable dark mode for the application
              </p>
            </div>
            <Switch 
              id="dark-mode" 
              checked={isDarkModeEnabled}
              onCheckedChange={handleDarkModeToggle}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for important events
              </p>
            </div>
            <Switch id="notifications" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
