
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, CalendarDays, Settings, UserCog } from "lucide-react";
import { useState } from "react";

export function SchedulerSettingsPanel() {
  const [scheduleSettings, setScheduleSettings] = useState({
    enableAutomaticScheduling: true,
    defaultReminderDays: 7,
    assignToPreferredTech: true,
    notificationsEnabled: true,
    defaultFrequency: "quarterly"
  });

  const handleSettingChange = (key: string, value: any) => {
    setScheduleSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // Would save settings to backend
    console.log("Saving settings:", scheduleSettings);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Settings className="h-5 w-5 mr-2 text-muted-foreground" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-schedule">Automatic Scheduling</Label>
              <p className="text-sm text-muted-foreground">
                Automatically create work orders for scheduled maintenance
              </p>
            </div>
            <Switch 
              id="auto-schedule" 
              checked={scheduleSettings.enableAutomaticScheduling}
              onCheckedChange={(checked) => handleSettingChange("enableAutomaticScheduling", checked)}
            />
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default-frequency">Default Maintenance Frequency</Label>
              <Select 
                value={scheduleSettings.defaultFrequency}
                onValueChange={(value) => handleSettingChange("defaultFrequency", value)}
              >
                <SelectTrigger id="default-frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="bi-annually">Bi-Annually</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                  <SelectItem value="as-needed">As Needed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reminder-days">Default Reminder (Days Before)</Label>
              <Input 
                id="reminder-days"
                type="number"
                min={1}
                max={60}
                value={scheduleSettings.defaultReminderDays}
                onChange={(e) => handleSettingChange("defaultReminderDays", parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Bell className="h-5 w-5 mr-2 text-muted-foreground" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-notifications">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send notifications for upcoming and overdue maintenance
              </p>
            </div>
            <Switch 
              id="enable-notifications" 
              checked={scheduleSettings.notificationsEnabled}
              onCheckedChange={(checked) => handleSettingChange("notificationsEnabled", checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="assign-tech">Assign to Preferred Technician</Label>
              <p className="text-sm text-muted-foreground">
                Automatically assign maintenance to customer's preferred technician
              </p>
            </div>
            <Switch 
              id="assign-tech" 
              checked={scheduleSettings.assignToPreferredTech}
              onCheckedChange={(checked) => handleSettingChange("assignToPreferredTech", checked)}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>Save Settings</Button>
      </div>
    </div>
  );
}
