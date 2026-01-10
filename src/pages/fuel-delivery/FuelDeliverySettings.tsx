import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Settings, Bell, MapPin, Fuel, Truck, DollarSign, Save, Loader2, Ruler } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AddressAutocomplete } from '@/components/fuel-delivery/AddressAutocomplete';
import { useFuelUnits, UnitSystem } from '@/hooks/fuel-delivery/useFuelUnits';

export default function FuelDeliverySettings() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  
  // Unit Preferences
  const { unitSystem, volumeUnit, setUnitSystem, getUnitLabel } = useFuelUnits();
  
  // Business Location Settings
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessLatitude, setBusinessLatitude] = useState<number | null>(null);
  const [businessLongitude, setBusinessLongitude] = useState<number | null>(null);
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [lowFuelAlerts, setLowFuelAlerts] = useState(true);
  const [deliveryReminders, setDeliveryReminders] = useState(true);
  
  // Default Settings
  const [defaultFuelType, setDefaultFuelType] = useState('diesel');
  const [defaultTankCapacity, setDefaultTankCapacity] = useState('500');
  const [lowFuelThreshold, setLowFuelThreshold] = useState('25');
  const [defaultDeliveryWindow, setDefaultDeliveryWindow] = useState('morning');
  
  // Pricing Settings
  const [basePricePerUnit, setBasePricePerUnit] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [rushDeliveryFee, setRushDeliveryFee] = useState('');

  const handleAddressSelect = (result: any) => {
    setBusinessAddress(result.address);
    setBusinessLatitude(result.latitude);
    setBusinessLongitude(result.longitude);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // TODO: Save settings to database
      // For now, just show success message
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnitSystemChange = (value: string) => {
    setUnitSystem(value as UnitSystem);
    toast.success(`Switched to ${value === 'metric' ? 'Metric (Litres)' : 'Imperial (Gallons)'}`);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate('/fuel-delivery')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fuel Delivery Settings</h1>
          <p className="text-muted-foreground">Configure your fuel delivery module preferences</p>
        </div>
      </div>

      <Tabs defaultValue="units" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="notifications">Alerts</TabsTrigger>
          <TabsTrigger value="defaults">Defaults</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        {/* Units Tab */}
        <TabsContent value="units" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-orange-500" />
                <CardTitle>Unit Preferences</CardTitle>
              </div>
              <CardDescription>
                Choose between Metric (Litres) or Imperial (Gallons) measurements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup 
                value={unitSystem} 
                onValueChange={handleUnitSystemChange}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                  unitSystem === 'metric' 
                    ? 'border-orange-500 bg-orange-500/10' 
                    : 'border-border hover:border-muted-foreground'
                }`}>
                  <RadioGroupItem value="metric" id="metric" />
                  <Label htmlFor="metric" className="flex-1 cursor-pointer">
                    <div className="font-semibold text-lg">Metric</div>
                    <div className="text-sm text-muted-foreground">
                      Litres (L) - Used in Canada, Europe, and most of the world
                    </div>
                  </Label>
                </div>
                <div className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                  unitSystem === 'imperial' 
                    ? 'border-orange-500 bg-orange-500/10' 
                    : 'border-border hover:border-muted-foreground'
                }`}>
                  <RadioGroupItem value="imperial" id="imperial" />
                  <Label htmlFor="imperial" className="flex-1 cursor-pointer">
                    <div className="font-semibold text-lg">Imperial</div>
                    <div className="text-sm text-muted-foreground">
                      Gallons (gal) - Used in the United States
                    </div>
                  </Label>
                </div>
              </RadioGroup>
              
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Current setting:</span> All volumes will be displayed in{' '}
                  <span className="font-semibold text-orange-600">{getUnitLabel(false)}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  This affects tank capacities, delivery amounts, and pricing displays throughout the module.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Location Tab */}
        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-500" />
                <CardTitle>Business Location</CardTitle>
              </div>
              <CardDescription>
                Set your business location to center maps and calculate routes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Business Address</Label>
                <AddressAutocomplete
                  value={businessAddress}
                  onChange={setBusinessAddress}
                  onSelect={handleAddressSelect}
                  placeholder="Enter your business address"
                />
              </div>
              {businessLatitude && businessLongitude && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Coordinates: {businessLatitude.toFixed(6)}, {businessLongitude.toFixed(6)}
                  </p>
                </div>
              )}
              <Button onClick={handleSaveSettings} disabled={isSaving} className="bg-orange-500 hover:bg-orange-600">
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Location
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-500" />
                <CardTitle>Notification Preferences</CardTitle>
              </div>
              <CardDescription>Configure how you receive alerts and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive alerts via text message</p>
                </div>
                <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Low Fuel Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified when tanks are low</p>
                </div>
                <Switch checked={lowFuelAlerts} onCheckedChange={setLowFuelAlerts} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delivery Reminders</p>
                  <p className="text-sm text-muted-foreground">Reminders for upcoming deliveries</p>
                </div>
                <Switch checked={deliveryReminders} onCheckedChange={setDeliveryReminders} />
              </div>
              <Button onClick={handleSaveSettings} disabled={isSaving} className="bg-orange-500 hover:bg-orange-600">
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Defaults Tab */}
        <TabsContent value="defaults" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Fuel className="h-5 w-5 text-orange-500" />
                <CardTitle>Default Settings</CardTitle>
              </div>
              <CardDescription>Set default values for new customers and orders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Fuel Type</Label>
                  <Select value={defaultFuelType} onValueChange={setDefaultFuelType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="gasoline">Gasoline</SelectItem>
                      <SelectItem value="heating_oil">Heating Oil</SelectItem>
                      <SelectItem value="propane">Propane</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Tank Capacity ({getUnitLabel(false)})</Label>
                  <Input
                    type="number"
                    value={defaultTankCapacity}
                    onChange={(e) => setDefaultTankCapacity(e.target.value)}
                    placeholder={getUnitLabel(false) === 'Litres' ? '2000' : '500'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Low Fuel Threshold (%)</Label>
                  <Input
                    type="number"
                    value={lowFuelThreshold}
                    onChange={(e) => setLowFuelThreshold(e.target.value)}
                    placeholder="25"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Delivery Window</Label>
                  <Select value={defaultDeliveryWindow} onValueChange={setDefaultDeliveryWindow}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (6AM - 12PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                      <SelectItem value="anytime">Anytime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSaveSettings} disabled={isSaving} className="bg-orange-500 hover:bg-orange-600">
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Defaults
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-orange-500" />
                <CardTitle>Pricing Configuration</CardTitle>
              </div>
              <CardDescription>Set base prices and fees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Base Price {getUnitLabel(false) === 'Litres' ? 'per Litre' : 'per Gallon'} ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={basePricePerUnit}
                    onChange={(e) => setBasePricePerUnit(e.target.value)}
                    placeholder={getUnitLabel(false) === 'Litres' ? '1.50' : '3.50'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Standard Delivery Fee ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    placeholder="25.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rush Delivery Fee ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={rushDeliveryFee}
                    onChange={(e) => setRushDeliveryFee(e.target.value)}
                    placeholder="50.00"
                  />
                </div>
              </div>
              <Button onClick={handleSaveSettings} disabled={isSaving} className="bg-orange-500 hover:bg-orange-600">
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Pricing
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
