import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, MapPin, RefreshCw, Fuel } from 'lucide-react';
import { 
  useShopFuelPriceSettings, 
  useUpdateFuelPriceSettings, 
  useRefreshFuelPrices,
  CANADIAN_CITIES 
} from '@/hooks/fuel-delivery/useFuelMarketPrices';
import { FuelMarketPrices } from '../FuelMarketPrices';

interface FuelPriceSettingsTabProps {
  shopId: string | undefined;
}

export function FuelPriceSettingsTab({ shopId }: FuelPriceSettingsTabProps) {
  const { data: settings, isLoading } = useShopFuelPriceSettings();
  const updateMutation = useUpdateFuelPriceSettings();
  const refreshMutation = useRefreshFuelPrices();

  const [referenceCity, setReferenceCity] = useState('Victoria');
  const [referenceProvince, setReferenceProvince] = useState('BC');
  const [customLocationLabel, setCustomLocationLabel] = useState('');
  const [showOnPortal, setShowOnPortal] = useState(true);

  // Load settings when fetched
  useEffect(() => {
    if (settings) {
      setReferenceCity(settings.reference_city);
      setReferenceProvince(settings.reference_province);
      setCustomLocationLabel(settings.custom_location_label || '');
      setShowOnPortal(settings.show_on_portal);
    }
  }, [settings]);

  const handleCityChange = (value: string) => {
    const [city, province] = value.split('|');
    setReferenceCity(city);
    setReferenceProvince(province);
  };

  const handleSave = () => {
    updateMutation.mutate({
      reference_city: referenceCity,
      reference_province: referenceProvince,
      custom_location_label: customLocationLabel || null,
      show_on_portal: showOnPortal,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    );
  }

  // Group cities by province
  const citiesByProvince: Record<string, typeof CANADIAN_CITIES> = {};
  for (const city of CANADIAN_CITIES) {
    if (!citiesByProvince[city.province]) {
      citiesByProvince[city.province] = [];
    }
    citiesByProvince[city.province].push(city);
  }

  const provinceNames: Record<string, string> = {
    'BC': 'British Columbia',
    'AB': 'Alberta',
    'SK': 'Saskatchewan',
    'MB': 'Manitoba',
    'ON': 'Ontario',
    'QC': 'Quebec',
    'NS': 'Nova Scotia',
    'NB': 'New Brunswick',
    'PE': 'Prince Edward Island',
    'NL': 'Newfoundland & Labrador',
    'YT': 'Yukon',
    'NT': 'Northwest Territories',
    'NU': 'Nunavut',
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-orange-500" />
            <CardTitle>Market Price Settings</CardTitle>
          </div>
          <CardDescription>
            Select your reference city for fuel market prices. Statistics Canada provides monthly price data for major Canadian cities.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Custom Location Label */}
          <div className="space-y-2">
            <Label>Your Service Area (Optional)</Label>
            <Input
              value={customLocationLabel}
              onChange={(e) => setCustomLocationLabel(e.target.value)}
              placeholder="e.g., Campbell River Area, Comox Valley, etc."
            />
            <p className="text-xs text-muted-foreground">
              This label will be shown to customers instead of the reference city name
            </p>
          </div>

          {/* Reference City Selection */}
          <div className="space-y-2">
            <Label>Reference City for Pricing</Label>
            <Select 
              value={`${referenceCity}|${referenceProvince}`}
              onValueChange={handleCityChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reference city" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(citiesByProvince).map(([province, cities]) => (
                  <React.Fragment key={province}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted">
                      {provinceNames[province] || province}
                    </div>
                    {cities.map((city) => (
                      <SelectItem key={`${city.city}|${city.province}`} value={`${city.city}|${city.province}`}>
                        {city.city}, {city.province}
                      </SelectItem>
                    ))}
                  </React.Fragment>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select the nearest major city to your service area. This will be used for market price comparisons.
            </p>
          </div>

          {/* Show on Portal Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-0.5">
              <Label>Show Fuel Prices on Customer Portal</Label>
              <p className="text-xs text-muted-foreground">
                Display current market prices to customers for transparency
              </p>
            </div>
            <Switch
              checked={showOnPortal}
              onCheckedChange={setShowOnPortal}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Settings
            </Button>
            <Button
              variant="outline"
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
            >
              {refreshMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh Prices
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Fuel className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-base">Price Preview</CardTitle>
          </div>
          <CardDescription>
            This is how current fuel prices will appear
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FuelMarketPrices showRefresh={false} />
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm">About Fuel Price Data</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Fuel prices are sourced from Statistics Canada's monthly Consumer Price Index data for major Canadian cities.
          </p>
          <p>
            <strong>Data Updates:</strong> Statistics Canada publishes new data around the 15th of each month for the previous month's prices.
          </p>
          <p>
            <strong>Regional Mapping:</strong> For areas not covered by Statistics Canada (like Campbell River or Nanaimo), we recommend selecting the nearest major market (e.g., Victoria for Vancouver Island).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
