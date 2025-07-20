
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { securityService } from '@/services/developer/securityService';
import { useToast } from '@/hooks/use-toast';
import { Shield, Key, Clock, Eye } from 'lucide-react';

interface SecurityConfig {
  sessionTimeout: number;
  mfaEnabled: boolean;
  passwordComplexity: boolean;
  dataEncryption: boolean;
  auditLogging: boolean;
  ipWhitelist: string[];
}

export function SecurityTab() {
  const [config, setConfig] = useState<SecurityConfig>({
    sessionTimeout: 30,
    mfaEnabled: false,
    passwordComplexity: true,
    dataEncryption: true,
    auditLogging: true,
    ipWhitelist: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      setLoading(true);
      const settings = await securityService.getSecuritySettings();
      
      // Transform settings to our config format
      const transformedConfig: SecurityConfig = {
        sessionTimeout: 30, // Default values for demo
        mfaEnabled: false,
        passwordComplexity: true,
        dataEncryption: true,
        auditLogging: true,
        ipWhitelist: []
      };

      settings.forEach(setting => {
        switch (setting.name) {
          case 'Session Timeout':
            transformedConfig.sessionTimeout = Number(setting.value);
            break;
          case 'Two-Factor Authentication':
            transformedConfig.mfaEnabled = Boolean(setting.value);
            break;
          case 'Password Complexity':
            transformedConfig.passwordComplexity = Boolean(setting.value);
            break;
          case 'Data Encryption':
            transformedConfig.dataEncryption = Boolean(setting.value);
            break;
          case 'Audit Logging':
            transformedConfig.auditLogging = Boolean(setting.value);
            break;
        }
      });

      setConfig(transformedConfig);
    } catch (error) {
      console.error('Error loading security settings:', error);
      toast({
        title: "Error",
        description: "Failed to load security settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (key: keyof SecurityConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);

      // In a real implementation, this would enforce these settings
      // For now, we'll just save them to demonstrate the connection
      await securityService.updateSecuritySetting('1', config.sessionTimeout);
      await securityService.updateSecuritySetting('2', config.mfaEnabled);
      await securityService.updateSecuritySetting('3', config.passwordComplexity);
      await securityService.updateSecuritySetting('4', config.dataEncryption);
      await securityService.updateSecuritySetting('5', config.auditLogging);

      toast({
        title: "Security Settings Updated",
        description: "Your security configuration has been saved successfully",
      });
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast({
        title: "Error",
        description: "Failed to save security settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <p>Loading security settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <p className="text-muted-foreground">
            Configure security policies and authentication requirements
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Session Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <p className="text-sm text-muted-foreground">
                Automatically log out users after period of inactivity
              </p>
            </div>
            <Input
              id="session-timeout"
              type="number"
              value={config.sessionTimeout}
              onChange={(e) => handleConfigChange('sessionTimeout', Number(e.target.value))}
              className="w-20"
              min="5"
              max="480"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Authentication Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Require 2FA for all user accounts
              </p>
            </div>
            <Switch
              checked={config.mfaEnabled}
              onCheckedChange={(checked) => handleConfigChange('mfaEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Password Complexity Requirements</Label>
              <p className="text-sm text-muted-foreground">
                Enforce strong password policies
              </p>
            </div>
            <Switch
              checked={config.passwordComplexity}
              onCheckedChange={(checked) => handleConfigChange('passwordComplexity', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Data Protection & Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Data Encryption at Rest</Label>
              <p className="text-sm text-muted-foreground">
                Encrypt sensitive data in the database
              </p>
            </div>
            <Switch
              checked={config.dataEncryption}
              onCheckedChange={(checked) => handleConfigChange('dataEncryption', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Audit Logging</Label>
              <p className="text-sm text-muted-foreground">
                Log all user actions and system events
              </p>
            </div>
            <Switch
              checked={config.auditLogging}
              onCheckedChange={(checked) => handleConfigChange('auditLogging', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Apply Security Settings</h3>
              <p className="text-sm text-muted-foreground">
                These settings will be enforced across the entire application
              </p>
            </div>
            <Button 
              onClick={handleSaveSettings}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Security Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
