
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeTab } from './ThemeTab';
import { ColorsTab } from './ColorsTab';
import { LogoTab } from './LogoTab';

export function BrandingTab() {
  const { settings, updateTheme, loading } = useTheme();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('Your Company');

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyName(e.target.value);
  };

  const handleColorChange = (colorKey: string, value: string) => {
    updateTheme({ [colorKey as keyof typeof settings]: value });
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    updateTheme({ theme_mode: theme });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <p>Loading branding settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Branding & Appearance</CardTitle>
          <p className="text-muted-foreground">
            Customize your application's appearance, colors, and branding
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="theme" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="logo">Logo & Branding</TabsTrigger>
        </TabsList>

        <TabsContent value="theme">
          <ThemeTab 
            theme={settings.theme_mode} 
            setTheme={handleThemeChange}
          />
        </TabsContent>

        <TabsContent value="colors">
          <ColorsTab
            colors={{
              primary: settings.primary_color,
              secondary: settings.secondary_color,
              accent: settings.accent_color,
              text: '#000000',
              background: '#ffffff'
            }}
            onColorChange={handleColorChange}
          />
        </TabsContent>

        <TabsContent value="logo">
          <LogoTab
            logoPreview={logoPreview}
            companyName={companyName}
            onLogoChange={handleLogoChange}
            onCompanyNameChange={handleCompanyNameChange}
            loading={false}
          />
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Preview Changes</h3>
              <p className="text-sm text-muted-foreground">
                Changes are applied immediately and saved automatically
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
