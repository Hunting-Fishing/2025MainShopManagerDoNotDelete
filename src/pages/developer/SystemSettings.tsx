
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { ArrowLeft, Settings, Database, Shield, Bell, Globe } from "lucide-react";
import { Container, Segment, Header as SemanticHeader } from "semantic-ui-react";

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    autoBackup: true,
    emailNotifications: true,
    smsNotifications: false,
    apiRateLimit: '1000',
    sessionTimeout: '24',
    maxFileSize: '50',
    enableAnalytics: true,
  });

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Container fluid className="px-4 py-8">
      <Segment raised className="mb-8 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-slate-800 dark:to-slate-900 border-t-4 border-t-emerald-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <Button variant="outline" size="sm" className="mb-4" asChild>
              <Link to="/developer">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Developer Portal
              </Link>
            </Button>
            <SemanticHeader as="h1" className="text-3xl font-bold flex items-center gap-3">
              <Settings className="h-8 w-8 text-emerald-600" />
              System Settings
            </SemanticHeader>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Configure application-wide settings and system behavior
            </p>
          </div>
        </div>
      </Segment>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-white dark:bg-slate-800 rounded-full p-1 border shadow-sm">
          <TabsTrigger 
            value="general" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
          >
            General
          </TabsTrigger>
          <TabsTrigger 
            value="database" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Database
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-red-600 data-[state=active]:text-white"
          >
            Security
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="border-t-4 border-t-emerald-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Application Settings
              </CardTitle>
              <CardDescription>
                Configure general application behavior and limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Maintenance Mode</Label>
                  <div className="text-sm text-gray-600">
                    Enable to restrict access for system maintenance
                  </div>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apiRateLimit">API Rate Limit (requests/hour)</Label>
                  <Input
                    id="apiRateLimit"
                    value={settings.apiRateLimit}
                    onChange={(e) => handleSettingChange('apiRateLimit', e.target.value)}
                    placeholder="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                  <Input
                    id="sessionTimeout"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                    placeholder="24"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxFileSize">Maximum File Upload Size (MB)</Label>
                <Input
                  id="maxFileSize"
                  value={settings.maxFileSize}
                  onChange={(e) => handleSettingChange('maxFileSize', e.target.value)}
                  placeholder="50"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card className="border-t-4 border-t-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Management
              </CardTitle>
              <CardDescription>
                Configure database settings and backup options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Automatic Backups</Label>
                  <div className="text-sm text-gray-600">
                    Enable daily automatic database backups
                  </div>
                </div>
                <Switch
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
                />
              </div>

              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  Create Manual Backup
                </Button>
                <Button variant="outline" className="w-full">
                  View Backup History
                </Button>
                <Button variant="outline" className="w-full">
                  Database Health Check
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-t-4 border-t-red-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Configuration
              </CardTitle>
              <CardDescription>
                Configure security policies and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Password Policy</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Minimum 8 characters</p>
                    <p>• Require uppercase letters</p>
                    <p>• Require numbers</p>
                    <p>• Require special characters</p>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3">
                    Configure
                  </Button>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Two-Factor Authentication</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• SMS verification</p>
                    <p>• Email verification</p>
                    <p>• Authenticator apps</p>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3">
                    Configure
                  </Button>
                </Card>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowedDomains">Allowed Email Domains</Label>
                <Textarea
                  id="allowedDomains"
                  placeholder="Enter allowed domains, one per line"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-t-4 border-t-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure system-wide notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <div className="text-sm text-gray-600">
                    Send notifications via email
                  </div>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">SMS Notifications</Label>
                  <div className="text-sm text-gray-600">
                    Send notifications via SMS
                  </div>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Analytics Tracking</Label>
                  <div className="text-sm text-gray-600">
                    Enable user analytics and tracking
                  </div>
                </div>
                <Switch
                  checked={settings.enableAnalytics}
                  onCheckedChange={(checked) => handleSettingChange('enableAnalytics', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end">
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          Save All Settings
        </Button>
      </div>
    </Container>
  );
}
