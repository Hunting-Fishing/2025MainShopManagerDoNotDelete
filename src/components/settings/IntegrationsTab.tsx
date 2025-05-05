
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { integrationService } from "@/services/settings/integrationService";
import { IntegrationSettings } from "@/types/settings";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle, CreditCard, Calendar, MessageSquare, BarChart3, Users, Link2, Settings2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function IntegrationsTab({ shopId }: { shopId?: string }) {
  const [integrations, setIntegrations] = useState<IntegrationSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentIntegration, setCurrentIntegration] = useState<IntegrationSettings | null>(null);
  const [integrationType, setIntegrationType] = useState<string>("payment");
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [isEnabled, setIsEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!shopId) return;
    
    const loadIntegrations = async () => {
      setLoading(true);
      const data = await integrationService.getIntegrationSettings(shopId);
      
      if (data) {
        setIntegrations(data);
      }
      
      setLoading(false);
    };
    
    loadIntegrations();
  }, [shopId]);

  const handleAddIntegration = () => {
    setCurrentIntegration(null);
    setIntegrationType("payment");
    setConfigValues({});
    setIsEnabled(true);
    setDialogOpen(true);
  };

  const handleEditIntegration = (integration: IntegrationSettings) => {
    setCurrentIntegration(integration);
    setIntegrationType(integration.integration_type);
    setConfigValues(integration.config || {});
    setIsEnabled(integration.is_enabled);
    setDialogOpen(true);
  };

  const handleSaveIntegration = async () => {
    if (!shopId) return;
    
    setSaving(true);
    
    try {
      if (currentIntegration) {
        // Update existing integration
        await integrationService.updateIntegrationSetting(currentIntegration.id, {
          integration_type: integrationType as any,
          config: configValues,
          is_enabled: isEnabled
        });
        
        setIntegrations(prev => 
          prev.map(i => i.id === currentIntegration.id ? {
            ...i, 
            integration_type: integrationType as any,
            config: configValues,
            is_enabled: isEnabled
          } : i)
        );
        
        toast({
          title: "Integration updated",
          description: `${integrationType.charAt(0).toUpperCase() + integrationType.slice(1)} integration has been updated.`
        });
      } else {
        // Create new integration
        const newIntegration = await integrationService.createIntegrationSetting({
          shop_id: shopId,
          integration_type: integrationType as any,
          config: configValues,
          is_enabled: isEnabled
        });
        
        if (newIntegration) {
          setIntegrations(prev => [...prev, newIntegration]);
        }
        
        toast({
          title: "Integration added",
          description: `${integrationType.charAt(0).toUpperCase() + integrationType.slice(1)} integration has been added.`
        });
      }
      
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving integration:", error);
      toast({
        title: "Error",
        description: "Failed to save integration",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteIntegration = async (id: string) => {
    try {
      await integrationService.deleteIntegrationSetting(id);
      setIntegrations(prev => prev.filter(i => i.id !== id));
      
      toast({
        title: "Integration removed",
        description: "The integration has been removed successfully."
      });
    } catch (error) {
      console.error("Error deleting integration:", error);
      toast({
        title: "Error",
        description: "Failed to delete integration",
        variant: "destructive"
      });
    }
  };

  const handleConfigChange = (key: string, value: string) => {
    setConfigValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <CreditCard className="h-5 w-5" />;
      case "calendar":
        return <Calendar className="h-5 w-5" />;
      case "sms":
        return <MessageSquare className="h-5 w-5" />;
      case "analytics":
        return <BarChart3 className="h-5 w-5" />;
      case "crm":
        return <Users className="h-5 w-5" />;
      default:
        return <Link2 className="h-5 w-5" />;
    }
  };

  const getConfigFields = (type: string) => {
    switch (type) {
      case "payment":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="provider">Payment Provider</Label>
              <Select 
                value={configValues.provider || "stripe"} 
                onValueChange={(value) => handleConfigChange("provider", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                type="password"
                value={configValues.api_key || ""}
                onChange={(e) => handleConfigChange("api_key", e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhook_url">Webhook URL</Label>
              <Input
                id="webhook_url"
                value={configValues.webhook_url || ""}
                onChange={(e) => handleConfigChange("webhook_url", e.target.value)}
                placeholder="https://example.com/webhooks/payment"
              />
            </div>
          </>
        );
        
      case "calendar":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="provider">Calendar Provider</Label>
              <Select 
                value={configValues.provider || "google"} 
                onValueChange={(value) => handleConfigChange("provider", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google Calendar</SelectItem>
                  <SelectItem value="outlook">Microsoft Outlook</SelectItem>
                  <SelectItem value="apple">Apple Calendar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_id">Client ID</Label>
              <Input
                id="client_id"
                value={configValues.client_id || ""}
                onChange={(e) => handleConfigChange("client_id", e.target.value)}
                placeholder="Client ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_secret">Client Secret</Label>
              <Input
                id="client_secret"
                type="password"
                value={configValues.client_secret || ""}
                onChange={(e) => handleConfigChange("client_secret", e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </>
        );
        
      case "sms":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="provider">SMS Provider</Label>
              <Select 
                value={configValues.provider || "twilio"} 
                onValueChange={(value) => handleConfigChange("provider", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twilio">Twilio</SelectItem>
                  <SelectItem value="nexmo">Nexmo</SelectItem>
                  <SelectItem value="messagebird">MessageBird</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_sid">Account SID</Label>
              <Input
                id="account_sid"
                value={configValues.account_sid || ""}
                onChange={(e) => handleConfigChange("account_sid", e.target.value)}
                placeholder="Account SID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth_token">Auth Token</Label>
              <Input
                id="auth_token"
                type="password"
                value={configValues.auth_token || ""}
                onChange={(e) => handleConfigChange("auth_token", e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from_number">From Number</Label>
              <Input
                id="from_number"
                value={configValues.from_number || ""}
                onChange={(e) => handleConfigChange("from_number", e.target.value)}
                placeholder="+1234567890"
              />
            </div>
          </>
        );
        
      default:
        return (
          <div className="space-y-2">
            <Label htmlFor="api_key">API Key</Label>
            <Input
              id="api_key"
              type="password"
              value={configValues.api_key || ""}
              onChange={(e) => handleConfigChange("api_key", e.target.value)}
              placeholder="••••••••"
            />
          </div>
        );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Integrations
            </CardTitle>
            <CardDescription>
              Connect your shop with third-party services
            </CardDescription>
          </div>
          <Button onClick={handleAddIntegration}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Integration
          </Button>
        </CardHeader>
        <CardContent>
          {integrations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No integrations configured yet. Click "Add Integration" to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.map((integration) => (
                <Card key={integration.id} className="overflow-hidden">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        {getIntegrationIcon(integration.integration_type)}
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {integration.integration_type.charAt(0).toUpperCase() + integration.integration_type.slice(1)}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {integration.config?.provider || "Default provider"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={integration.is_enabled ? "default" : "outline"}>
                      {integration.is_enabled ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="bg-muted/50 flex items-center justify-end gap-2 p-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditIntegration(integration)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500"
                      onClick={() => handleDeleteIntegration(integration.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentIntegration ? "Edit Integration" : "Add Integration"}</DialogTitle>
            <DialogDescription>
              {currentIntegration
                ? "Update your integration settings"
                : "Configure a new integration for your shop"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="integration_type">Integration Type</Label>
              <Select 
                value={integrationType} 
                onValueChange={setIntegrationType}
                disabled={!!currentIntegration}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select integration type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="calendar">Calendar</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="crm">CRM</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {getConfigFields(integrationType)}
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Integration</Label>
                <p className="text-sm text-muted-foreground">
                  Turn on to activate this integration
                </p>
              </div>
              <Switch 
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveIntegration}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
