
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Link as LinkIcon, Key, CheckCircle, AlertCircle, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface IntegrationService {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isConnected: boolean;
  status: 'active' | 'inactive' | 'error';
  apiKey?: string;
  lastSync?: string;
}

interface IntegrationsTabProps {
  shopId?: string;
}

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({ shopId }) => {
  const [services, setServices] = useState<IntegrationService[]>([
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Payment processing and billing management',
      icon: <Globe className="h-5 w-5 text-blue-600" />,
      isConnected: true,
      status: 'active',
      lastSync: '2024-01-15T10:30:00Z'
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      description: 'Accounting and financial management',
      icon: <Settings className="h-5 w-5 text-green-600" />,
      isConnected: false,
      status: 'inactive'
    },
    {
      id: 'mailgun',
      name: 'Mailgun',
      description: 'Email delivery and marketing automation',
      icon: <LinkIcon className="h-5 w-5 text-orange-600" />,
      isConnected: true,
      status: 'error',
      lastSync: '2024-01-14T15:45:00Z'
    },
    {
      id: 'twilio',
      name: 'Twilio',
      description: 'SMS messaging and communication',
      icon: <Key className="h-5 w-5 text-red-600" />,
      isConnected: false,
      status: 'inactive'
    }
  ]);

  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    stripe: 'sk_test_*********************',
    mailgun: 'mg_*********************'
  });

  const handleToggleConnection = (serviceId: string) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { 
            ...service, 
            isConnected: !service.isConnected,
            status: !service.isConnected ? 'active' : 'inactive'
          }
        : service
    ));
    
    const service = services.find(s => s.id === serviceId);
    if (service) {
      toast.success(`${service.name} ${service.isConnected ? 'disconnected' : 'connected'} successfully`);
    }
  };

  const handleApiKeyChange = (serviceId: string, apiKey: string) => {
    setApiKeys(prev => ({ ...prev, [serviceId]: apiKey }));
  };

  const handleSaveApiKey = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      toast.success(`${service.name} API key saved successfully`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Settings className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'error':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">Error</Badge>;
      default:
        return <Badge variant="secondary">Inactive</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {services.map((service) => (
          <Card key={service.id} className="bg-white shadow-md rounded-xl border border-gray-100">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {service.icon}
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(service.status)}
                  <Switch
                    checked={service.isConnected}
                    onCheckedChange={() => handleToggleConnection(service.id)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(service.status)}
                    <span className="text-sm text-gray-600">
                      Status: {service.status === 'active' ? 'Connected and working' : 
                              service.status === 'error' ? 'Connection error' : 'Not connected'}
                    </span>
                  </div>
                  {service.lastSync && (
                    <span className="text-xs text-gray-500">
                      Last sync: {new Date(service.lastSync).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {service.isConnected && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`${service.id}-api-key`}>API Key</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id={`${service.id}-api-key`}
                          type="password"
                          value={apiKeys[service.id] || ''}
                          onChange={(e) => handleApiKeyChange(service.id, e.target.value)}
                          placeholder="Enter API key..."
                        />
                        <Button 
                          onClick={() => handleSaveApiKey(service.id)}
                          variant="outline"
                          size="sm"
                        >
                          Save
                        </Button>
                      </div>
                    </div>

                    {service.status === 'error' && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          Connection error: Invalid API credentials. Please check your API key and try again.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {!service.isConnected && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Enable this integration to connect {service.name} with your shop. 
                      You'll need to provide valid API credentials.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <LinkIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Need help setting up integrations?</h3>
              <p className="text-sm text-blue-700 mt-1">
                Check our documentation for step-by-step guides on configuring each integration service.
              </p>
              <Button variant="outline" size="sm" className="mt-3 border-blue-300 text-blue-700 hover:bg-blue-100">
                View Documentation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
