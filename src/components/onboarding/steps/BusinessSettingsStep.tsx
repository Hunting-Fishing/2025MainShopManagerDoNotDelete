
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar, DollarSign, Settings } from 'lucide-react';

interface BusinessSettingsStepProps {
  onNext: () => void;
  onPrevious: () => void;
  data: any;
  updateData: (data: any) => void;
}

const daysOfWeek = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export function BusinessSettingsStep({ onNext, onPrevious, data, updateData }: BusinessSettingsStepProps) {
  const [settings, setSettings] = useState({
    hours: {
      monday: { open: '08:00', close: '17:00', closed: false },
      tuesday: { open: '08:00', close: '17:00', closed: false },
      wednesday: { open: '08:00', close: '17:00', closed: false },
      thursday: { open: '08:00', close: '17:00', closed: false },
      friday: { open: '08:00', close: '17:00', closed: false },
      saturday: { open: '08:00', close: '15:00', closed: false },
      sunday: { open: '10:00', close: '14:00', closed: true },
    },
    features: {
      onlineBooking: true,
      emailNotifications: true,
      smsNotifications: false,
      digitalInvoicing: true,
      loyaltyProgram: false,
      workOrderTracking: true,
    },
    rates: {
      standardLabor: 125,
      diagnosticLabor: 145,
      emergencyLabor: 175,
    },
    ...data.businessSettings
  });

  const handleHourChange = (day: string, field: 'open' | 'close', value: string) => {
    setSettings(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: { ...prev.hours[day], [field]: value }
      }
    }));
  };

  const handleClosedToggle = (day: string, closed: boolean) => {
    setSettings(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: { ...prev.hours[day], closed }
      }
    }));
  };

  const handleFeatureToggle = (feature: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: enabled
      }
    }));
  };

  const handleRateChange = (rate: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      rates: {
        ...prev.rates,
        [rate]: value
      }
    }));
  };

  const handleNext = () => {
    updateData({ businessSettings: settings });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Business Hours
            </CardTitle>
            <CardDescription>
              Set your operating hours for each day of the week
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {daysOfWeek.map((day) => (
              <div key={day.key} className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-2 min-w-[100px]">
                  <Label className="text-sm font-medium">{day.label}</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={!settings.hours[day.key].closed}
                    onCheckedChange={(checked) => handleClosedToggle(day.key, !checked)}
                  />
                  
                  {!settings.hours[day.key].closed && (
                    <>
                      <input
                        type="time"
                        value={settings.hours[day.key].open}
                        onChange={(e) => handleHourChange(day.key, 'open', e.target.value)}
                        className="px-2 py-1 border rounded text-sm"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={settings.hours[day.key].close}
                        onChange={(e) => handleHourChange(day.key, 'close', e.target.value)}
                        className="px-2 py-1 border rounded text-sm"
                      />
                    </>
                  )}
                  
                  {settings.hours[day.key].closed && (
                    <span className="text-sm text-gray-500 ml-4">Closed</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Labor Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Labor Rates
            </CardTitle>
            <CardDescription>
              Set your standard labor rates (can be changed later)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="standardLabor">Standard Labor Rate ($/hour)</Label>
              <input
                id="standardLabor"
                type="number"
                value={settings.rates.standardLabor}
                onChange={(e) => handleRateChange('standardLabor', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-md mt-1"
                placeholder="125"
              />
            </div>
            
            <div>
              <Label htmlFor="diagnosticLabor">Diagnostic Rate ($/hour)</Label>
              <input
                id="diagnosticLabor"
                type="number"
                value={settings.rates.diagnosticLabor}
                onChange={(e) => handleRateChange('diagnosticLabor', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-md mt-1"
                placeholder="145"
              />
            </div>
            
            <div>
              <Label htmlFor="emergencyLabor">Emergency Rate ($/hour)</Label>
              <input
                id="emergencyLabor"
                type="number"
                value={settings.rates.emergencyLabor}
                onChange={(e) => handleRateChange('emergencyLabor', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-md mt-1"
                placeholder="175"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Feature Settings
          </CardTitle>
          <CardDescription>
            Choose which features to enable for your shop
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Online Booking</Label>
                <p className="text-sm text-gray-500">Allow customers to book appointments online</p>
              </div>
              <Switch
                checked={settings.features.onlineBooking}
                onCheckedChange={(checked) => handleFeatureToggle('onlineBooking', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-500">Send automated email updates</p>
              </div>
              <Switch
                checked={settings.features.emailNotifications}
                onCheckedChange={(checked) => handleFeatureToggle('emailNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>SMS Notifications</Label>
                <p className="text-sm text-gray-500">Send text message updates</p>
              </div>
              <Switch
                checked={settings.features.smsNotifications}
                onCheckedChange={(checked) => handleFeatureToggle('smsNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Digital Invoicing</Label>
                <p className="text-sm text-gray-500">Create and send digital invoices</p>
              </div>
              <Switch
                checked={settings.features.digitalInvoicing}
                onCheckedChange={(checked) => handleFeatureToggle('digitalInvoicing', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Work Order Tracking</Label>
                <p className="text-sm text-gray-500">Real-time job progress tracking</p>
              </div>
              <Switch
                checked={settings.features.workOrderTracking}
                onCheckedChange={(checked) => handleFeatureToggle('workOrderTracking', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Loyalty Program</Label>
                <p className="text-sm text-gray-500">Customer points and rewards system</p>
              </div>
              <Switch
                checked={settings.features.loyaltyProgram}
                onCheckedChange={(checked) => handleFeatureToggle('loyaltyProgram', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={handleNext} className="px-8">
          Continue
        </Button>
      </div>
    </div>
  );
}
