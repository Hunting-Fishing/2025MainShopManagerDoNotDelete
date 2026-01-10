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
import { ArrowLeft, Settings, Bell, MapPin, Fuel, DollarSign, Save, Loader2, Ruler } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AddressAutocomplete, type AddressResult } from '@/components/fuel-delivery/AddressAutocomplete';
import { useFuelUnits, UnitSystem } from '@/hooks/fuel-delivery/useFuelUnits';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Default shop_id for now - in production this would come from user context
const DEFAULT_SHOP_ID = '00000000-0000-0000-0000-000000000001';

interface FuelDeliverySettingsData {
  id?: string;
  shop_id: string;
  unit_system: string;
  volume_unit: string;
  business_address: string | null;
  business_latitude: number | null;
  business_longitude: number | null;
  email_notifications: boolean;
  sms_notifications: boolean;
  low_fuel_alerts: boolean;
  delivery_reminders: boolean;
  default_fuel_type: string;
  default_tank_capacity: number;
  low_fuel_threshold: number;
  default_delivery_window: string;
  base_price_per_unit: number | null;
  delivery_fee: number | null;
  rush_delivery_fee: number | null;
}

export default function FuelDeliverySettings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  
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
  
  // Settings ID for updates
  const [settingsId, setSettingsId] = useState<string | null>(null);

  // Fetch existing settings
  const { data: existingSettings } = useQuery({
    queryKey: ['fuel-delivery-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fuel_delivery_settings')
        .select('*')
        .maybeSingle();
      
      if (error) throw error;
      return data as FuelDeliverySettingsData | null;
    },
  });

  // Load settings into state when fetched
  useEffect(() => {
    if (existingSettings) {
      setSettingsId(existingSettings.id || null);
      setBusinessAddress(existingSettings.business_address || '');
      setBusinessLatitude(existingSettings.business_latitude);
      setBusinessLongitude(existingSettings.business_longitude);
      setEmailNotifications(existingSettings.email_notifications ?? true);
      setSmsNotifications(existingSettings.sms_notifications ?? false);
      setLowFuelAlerts(existingSettings.low_fuel_alerts ?? true);
      setDeliveryReminders(existingSettings.delivery_reminders ?? true);
      setDefaultFuelType(existingSettings.default_fuel_type || 'diesel');
      setDefaultTankCapacity(String(existingSettings.default_tank_capacity || 500));
      setLowFuelThreshold(String(existingSettings.low_fuel_threshold || 25));
      setDefaultDeliveryWindow(existingSettings.default_delivery_window || 'morning');
      setBasePricePerUnit(existingSettings.base_price_per_unit ? String(existingSettings.base_price_per_unit) : '');
      setDeliveryFee(existingSettings.delivery_fee ? String(existingSettings.delivery_fee) : '');
      setRushDeliveryFee(existingSettings.rush_delivery_fee ? String(existingSettings.rush_delivery_fee) : '');
      
      // Sync unit system from DB
      if (existingSettings.unit_system) {
        setUnitSystem(existingSettings.unit_system as UnitSystem);
      }
    }
    setIsLoading(false);
  }, [existingSettings, setUnitSystem]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (settings: Partial<FuelDeliverySettingsData>) => {
      if (settingsId) {
        // Update existing
        const { error } = await supabase
          .from('fuel_delivery_settings')
          .update(settings)
          .eq('id', settingsId);
        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('fuel_delivery_settings')
          .insert({ ...settings, shop_id: DEFAULT_SHOP_ID })
          .select()
          .single();
        if (error) throw error;
        if (data) setSettingsId(data.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-delivery-settings'] });
      toast.success('Settings saved successfully');
    },
    onError: (error: any) => {
      console.error('Save error:', error);
      toast.error('Failed to save settings');
    },
  });

  const handleAddressSelect = (result: AddressResult) => {
    setBusinessAddress(result.address);
    const [lng, lat] = result.coordinates;
    setBusinessLatitude(lat);
    setBusinessLongitude(lng);
  };

  const handleSaveBusinessLocation = () => {
    saveMutation.mutate({
      business_address: businessAddress,
      business_latitude: businessLatitude,
      business_longitude: businessLongitude,
    });
  };

  const handleSaveNotifications = () => {
    saveMutation.mutate({
      email_notifications: emailNotifications,
      sms_notifications: smsNotifications,
      low_fuel_alerts: lowFuelAlerts,
      delivery_reminders: deliveryReminders,
    });
  };

  const handleSaveDefaults = () => {
    saveMutation.mutate({
      default_fuel_type: defaultFuelType,
      default_tank_capacity: parseFloat(defaultTankCapacity) || 500,
      low_fuel_threshold: parseInt(lowFuelThreshold) || 25,
      default_delivery_window: defaultDeliveryWindow,
    });
  };

  const handleSavePricing = () => {
    saveMutation.mutate({
      base_price_per_unit: basePricePerUnit ? parseFloat(basePricePerUnit) : null,
      delivery_fee: deliveryFee ? parseFloat(deliveryFee) : null,
      rush_delivery_fee: rushDeliveryFee ? parseFloat(rushDeliveryFee) : null,
    });
  };

  const handleUnitSystemChange = (value: string) => {
    const newSystem = value as UnitSystem;
    setUnitSystem(newSystem);
    
    // Save to database
    saveMutation.mutate({
      unit_system: newSystem,
      volume_unit: newSystem === 'metric' ? 'litres' : 'gallons',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

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
              {businessLatitude !== null && businessLongitude !== null && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Coordinates: {businessLatitude.toFixed(6)}, {businessLongitude.toFixed(6)}
                  </p>
                </div>
              )}
              <Button 
                onClick={handleSaveBusinessLocation} 
                disabled={saveMutation.isPending} 
                className="bg-orange-500 hover:bg-orange-600"
              >
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
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
              <Button 
                onClick={handleSaveNotifications} 
                disabled={saveMutation.isPending} 
                className="bg-orange-500 hover:bg-orange-600"
              >
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
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
              <Button 
                onClick={handleSaveDefaults} 
                disabled={saveMutation.isPending} 
                className="bg-orange-500 hover:bg-orange-600"
              >
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
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
              <Button 
                onClick={handleSavePricing} 
                disabled={saveMutation.isPending} 
                className="bg-orange-500 hover:bg-orange-600"
              >
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Pricing
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
