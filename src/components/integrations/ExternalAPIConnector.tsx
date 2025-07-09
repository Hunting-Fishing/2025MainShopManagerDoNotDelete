import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plug, 
  Check, 
  X, 
  RefreshCw, 
  Settings, 
  AlertCircle, 
  Globe,
  Database,
  Mail,
  MessageSquare,
  CreditCard,
  Truck,
  FileText,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  config: Record<string, any>;
  features: string[];
  pricing: string;
  website: string;
}

interface APIEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers: Record<string, string>;
  body?: string;
  enabled: boolean;
  schedule?: string;
  lastRun?: string;
  status: 'success' | 'error' | 'pending';
}

const availableIntegrations: Integration[] = [
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sync financial data and invoices',
    category: 'Accounting',
    icon: <Database className="h-5 w-5" />,
    status: 'disconnected',
    config: {},
    features: ['Invoice Sync', 'Customer Data', 'Financial Reports'],
    pricing: 'Free for basic features',
    website: 'https://quickbooks.intuit.com'
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing and customer communications',
    category: 'Marketing',
    icon: <Mail className="h-5 w-5" />,
    status: 'connected',
    config: { apiKey: '***', listId: 'abc123' },
    features: ['Email Campaigns', 'Customer Segments', 'Analytics'],
    pricing: 'Starts at $10/month',
    website: 'https://mailchimp.com'
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS notifications and voice calls',
    category: 'Communications',
    icon: <MessageSquare className="h-5 w-5" />,
    status: 'configuring',
    config: { accountSid: 'AC123', authToken: '***' },
    features: ['SMS Alerts', 'Voice Calls', 'Two-way Messaging'],
    pricing: 'Pay per use',
    website: 'https://twilio.com'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing and billing',
    category: 'Payments',
    icon: <CreditCard className="h-5 w-5" />,
    status: 'connected',
    config: { publishableKey: 'pk_***', secretKey: '***' },
    features: ['Credit Card Processing', 'Recurring Billing', 'Payment Analytics'],
    pricing: '2.9% + 30¢ per transaction',
    website: 'https://stripe.com'
  },
  {
    id: 'fedex',
    name: 'FedEx',
    description: 'Shipping and tracking integration',
    category: 'Logistics',
    icon: <Truck className="h-5 w-5" />,
    status: 'disconnected',
    config: {},
    features: ['Rate Calculation', 'Label Generation', 'Package Tracking'],
    pricing: 'Based on shipping volume',
    website: 'https://developer.fedex.com'
  },
  {
    id: 'docusign',
    name: 'DocuSign',
    description: 'Digital document signing',
    category: 'Documents',
    icon: <FileText className="h-5 w-5" />,
    status: 'disconnected',
    config: {},
    features: ['Digital Signatures', 'Document Templates', 'Audit Trail'],
    pricing: 'Starts at $15/month',
    website: 'https://docusign.com'
  },
  {
    id: 'calendly',
    name: 'Calendly',
    description: 'Appointment scheduling integration',
    category: 'Scheduling',
    icon: <Calendar className="h-5 w-5" />,
    status: 'disconnected',
    config: {},
    features: ['Online Booking', 'Calendar Sync', 'Automated Reminders'],
    pricing: 'Free plan available',
    website: 'https://calendly.com'
  }
];

const mockEndpoints: APIEndpoint[] = [
  {
    id: '1',
    name: 'Sync Customer Data',
    method: 'POST',
    url: 'https://api.external.com/customers/sync',
    headers: { 'Authorization': 'Bearer ***', 'Content-Type': 'application/json' },
    body: '{"customers": "{{customers}}"}',
    enabled: true,
    schedule: 'daily',
    lastRun: '2024-01-15T10:30:00Z',
    status: 'success'
  },
  {
    id: '2',
    name: 'Send Invoice Notifications',
    method: 'POST',
    url: 'https://api.notifications.com/send',
    headers: { 'API-Key': '***' },
    body: '{"message": "{{invoice_message}}", "recipient": "{{customer_email}}"}',
    enabled: true,
    schedule: 'on_event',
    lastRun: '2024-01-15T09:15:00Z',
    status: 'success'
  }
];

export function ExternalAPIConnector() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [integrations, setIntegrations] = useState(availableIntegrations);
  const [endpoints, setEndpoints] = useState(mockEndpoints);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);

  const categories = ['all', ...Array.from(new Set(integrations.map(i => i.category)))];

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(i => i.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'configuring': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <Check className="h-4 w-4" />;
      case 'error': return <X className="h-4 w-4" />;
      case 'configuring': return <Settings className="h-4 w-4" />;
      default: return <Plug className="h-4 w-4" />;
    }
  };

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration);
    setIsConfiguring(true);
  };

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(prev => prev.map(i => 
      i.id === integrationId 
        ? { ...i, status: 'disconnected' as const, config: {} }
        : i
    ));
    
    toast({
      title: "Integration Disconnected",
      description: "The integration has been successfully disconnected."
    });
  };

  const handleSaveConfig = (config: Record<string, any>) => {
    if (!selectedIntegration) return;

    setIntegrations(prev => prev.map(i => 
      i.id === selectedIntegration.id 
        ? { ...i, status: 'connected' as const, config }
        : i
    ));

    setIsConfiguring(false);
    setSelectedIntegration(null);

    toast({
      title: "Integration Connected",
      description: "The integration has been successfully configured and connected."
    });
  };

  const testEndpoint = async (endpoint: APIEndpoint) => {
    toast({
      title: "Testing Endpoint",
      description: "Sending test request..."
    });

    // Simulate API test
    setTimeout(() => {
      toast({
        title: "Test Successful",
        description: "The endpoint responded successfully."
      });
    }, 2000);
  };

  const toggleEndpoint = (endpointId: string) => {
    setEndpoints(prev => prev.map(e => 
      e.id === endpointId 
        ? { ...e, enabled: !e.enabled }
        : e
    ));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">External Integrations</h1>
          <p className="text-muted-foreground">
            Connect with external services to automate workflows and sync data
          </p>
        </div>
        
        <Button onClick={() => window.open('https://docs.api.example.com', '_blank')}>
          <Globe className="h-4 w-4 mr-2" />
          API Documentation
        </Button>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="integrations">Available Integrations</TabsTrigger>
          <TabsTrigger value="endpoints">Custom API Endpoints</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => (
              <Card key={integration.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {integration.icon}
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {integration.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(integration.status)}>
                        {getStatusIcon(integration.status)}
                        <span className="ml-1 capitalize">{integration.status}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {integration.description}
                  </p>
                  
                  <div>
                    <Label className="text-xs font-medium">Features</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {integration.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Pricing: {integration.pricing}
                  </div>
                  
                  <div className="flex gap-2">
                    {integration.status === 'connected' ? (
                      <>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Settings className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDisconnect(integration.id)}
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleConnect(integration)}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Custom API Endpoints</h2>
            <Button>
              <Globe className="h-4 w-4 mr-2" />
              Add Endpoint
            </Button>
          </div>

          <div className="space-y-4">
            {endpoints.map((endpoint) => (
              <Card key={endpoint.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={endpoint.enabled}
                        onCheckedChange={() => toggleEndpoint(endpoint.id)}
                      />
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {endpoint.method}
                          </Badge>
                          <h3 className="font-medium">{endpoint.name}</h3>
                          <Badge className={getStatusColor(endpoint.status)}>
                            {endpoint.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">
                          {endpoint.url}
                        </p>
                        {endpoint.schedule && (
                          <p className="text-xs text-muted-foreground">
                            Schedule: {endpoint.schedule}
                            {endpoint.lastRun && (
                              <span className="ml-2">
                                Last run: {new Date(endpoint.lastRun).toLocaleString()}
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => testEndpoint(endpoint)}>
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Test
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Webhook endpoints allow external services to send data to your application in real-time.
              Configure these URLs in your external service providers.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Work Order Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Webhook URL</Label>
                    <div className="flex gap-2">
                      <Input 
                        value="https://api.yourapp.com/webhooks/work-orders"
                        readOnly 
                        className="font-mono text-xs"
                      />
                      <Button size="sm" variant="outline">Copy</Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Events</Label>
                    <div className="space-y-1">
                      {['created', 'updated', 'completed', 'cancelled'].map((event) => (
                        <div key={event} className="flex items-center space-x-2">
                          <Switch defaultChecked />
                          <Label className="text-sm">work_order.{event}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Webhook URL</Label>
                    <div className="flex gap-2">
                      <Input 
                        value="https://api.yourapp.com/webhooks/customers"
                        readOnly 
                        className="font-mono text-xs"
                      />
                      <Button size="sm" variant="outline">Copy</Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Events</Label>
                    <div className="space-y-1">
                      {['created', 'updated', 'vehicle_added'].map((event) => (
                        <div key={event} className="flex items-center space-x-2">
                          <Switch defaultChecked />
                          <Label className="text-sm">customer.{event}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Configuration Modal would go here */}
      {isConfiguring && selectedIntegration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Configure {selectedIntegration.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>API Key</Label>
                <Input placeholder="Enter your API key" />
              </div>
              <div>
                <Label>Environment</Label>
                <Select defaultValue="production">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => handleSaveConfig({ apiKey: 'test123', environment: 'production' })}
                >
                  Connect
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsConfiguring(false);
                    setSelectedIntegration(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}