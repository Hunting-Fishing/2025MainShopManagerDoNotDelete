import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EstimateTemplatesTab } from '@/components/power-washing/EstimateTemplatesTab';
import { 
  Settings, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Beaker, 
  Bell,
  Save,
  Building,
  Clock,
  Droplets
} from 'lucide-react';
import { toast } from 'sonner';
import { MobilePageContainer } from '@/components/mobile/MobilePageContainer';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';

export default function PowerWashingSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <MobilePageContainer>
      <MobilePageHeader
        title="Settings"
        subtitle="Configure your power washing module"
        icon={<Settings className="h-6 w-6 md:h-8 md:w-8 text-cyan-600" />}
        onBack={() => navigate('/power-washing')}
        actions={
          <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-7 gap-1 h-auto p-1">
          <TabsTrigger value="general" className="text-xs md:text-sm">General</TabsTrigger>
          <TabsTrigger value="service-areas" className="text-xs md:text-sm">Areas</TabsTrigger>
          <TabsTrigger value="scheduling" className="text-xs md:text-sm">Schedule</TabsTrigger>
          <TabsTrigger value="billing" className="text-xs md:text-sm">Billing</TabsTrigger>
          <TabsTrigger value="chemicals" className="text-xs md:text-sm">Chemicals</TabsTrigger>
          <TabsTrigger value="templates" className="text-xs md:text-sm">Templates</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs md:text-sm">Alerts</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Business Information
              </CardTitle>
              <CardDescription>Basic settings for your power washing business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input id="business-name" placeholder="Your Power Washing Co." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-phone">Business Phone</Label>
                  <Input id="business-phone" placeholder="(555) 123-4567" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-address">Business Address</Label>
                <Textarea id="business-address" placeholder="123 Main St, City, State ZIP" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license-number">License Number</Label>
                <Input id="license-number" placeholder="PWL-12345" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                Default Service Types
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">House Washing</p>
                  <p className="text-sm text-muted-foreground">Exterior soft washing</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Driveway Cleaning</p>
                  <p className="text-sm text-muted-foreground">Concrete & asphalt</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Deck & Patio</p>
                  <p className="text-sm text-muted-foreground">Wood & composite</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Roof Cleaning</p>
                  <p className="text-sm text-muted-foreground">Soft wash treatment</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Gutter Cleaning</p>
                  <p className="text-sm text-muted-foreground">Brightening & cleaning</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service Areas */}
        <TabsContent value="service-areas" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Service Area Configuration
              </CardTitle>
              <CardDescription>Define where you provide services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primary-zip">Primary ZIP Codes (comma separated)</Label>
                <Input id="primary-zip" placeholder="12345, 12346, 12347" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="service-radius">Service Radius (miles)</Label>
                  <Input id="service-radius" type="number" placeholder="25" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="travel-fee">Travel Fee (per mile beyond radius)</Label>
                  <Input id="travel-fee" type="number" placeholder="2.50" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Zone-Based Pricing</p>
                  <p className="text-sm text-muted-foreground">Different rates by area</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduling */}
        <TabsContent value="scheduling" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Scheduling Rules
              </CardTitle>
              <CardDescription>Configure job scheduling preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="default-duration">Default Job Duration (hours)</Label>
                  <Select defaultValue="2">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="2">2 hours</SelectItem>
                      <SelectItem value="3">3 hours</SelectItem>
                      <SelectItem value="4">4 hours</SelectItem>
                      <SelectItem value="6">6 hours</SelectItem>
                      <SelectItem value="8">Full day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-time">Minimum Lead Time (hours)</Label>
                  <Input id="lead-time" type="number" placeholder="24" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Default Start Time</Label>
                  <Input id="start-time" type="time" defaultValue="08:00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">Default End Time</Label>
                  <Input id="end-time" type="time" defaultValue="17:00" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weather-Based Scheduling</p>
                  <p className="text-sm text-muted-foreground">Auto-suggest reschedules for rain</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekend Jobs</p>
                  <p className="text-sm text-muted-foreground">Allow weekend scheduling</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing & Billing
              </CardTitle>
              <CardDescription>Configure rates and billing preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="labor-rate">Default Labor Rate ($/hour)</Label>
                  <Input id="labor-rate" type="number" placeholder="75.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Sales Tax Rate (%)</Label>
                  <Input id="tax-rate" type="number" placeholder="8.25" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="min-charge">Minimum Service Charge ($)</Label>
                  <Input id="min-charge" type="number" placeholder="150.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="env-fee">Environmental Fee ($)</Label>
                  <Input id="env-fee" type="number" placeholder="25.00" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-Generate Invoices</p>
                  <p className="text-sm text-muted-foreground">Create invoice on job completion</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Water Hookup Credit</p>
                  <p className="text-sm text-muted-foreground">Discount when customer provides water</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chemicals */}
        <TabsContent value="chemicals" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="h-5 w-5" />
                Chemical Management
              </CardTitle>
              <CardDescription>Default chemical settings and safety</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bleach-ratio">Default Bleach Ratio (%)</Label>
                  <Input id="bleach-ratio" type="number" placeholder="3" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surfactant-ratio">Default Surfactant (oz/gal)</Label>
                  <Input id="surfactant-ratio" type="number" placeholder="2" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorder-threshold">Low Stock Alert Threshold (%)</Label>
                <Input id="reorder-threshold" type="number" placeholder="20" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Require SDS Documentation</p>
                  <p className="text-sm text-muted-foreground">Enforce safety data sheets for all chemicals</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Track Chemical Usage</p>
                  <p className="text-sm text-muted-foreground">Log chemicals used per job</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="mt-4">
          <EstimateTemplatesTab />
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure alerts and reminders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <p className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Customer Notifications</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Appointment Reminders</p>
                    <p className="text-sm text-muted-foreground">Send 24hr before service</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">On-My-Way Notifications</p>
                    <p className="text-sm text-muted-foreground">Alert when crew departs</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Job Complete Notifications</p>
                    <p className="text-sm text-muted-foreground">Send with before/after photos</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              
              <div className="border-t pt-4 space-y-4">
                <p className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Team Alerts</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Quote Alerts</p>
                    <p className="text-sm text-muted-foreground">Notify on new quote requests</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weather Warnings</p>
                    <p className="text-sm text-muted-foreground">Alert for rain in scheduled areas</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Low Chemical Stock</p>
                    <p className="text-sm text-muted-foreground">Alert when inventory is low</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MobilePageContainer>
  );
}
