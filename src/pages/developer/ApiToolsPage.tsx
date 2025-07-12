import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Code, Play, Key, Webhook, BarChart3, Shield } from 'lucide-react';
import { toast } from 'sonner';

export function ApiToolsPage() {
  const [testRequest, setTestRequest] = useState({
    method: 'GET',
    endpoint: '/api/customers',
    headers: '',
    body: ''
  });
  const [testResponse, setTestResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTestRequest = async () => {
    setLoading(true);
    // Simulate API request
    setTimeout(() => {
      setTestResponse(`{
  "status": 200,
  "data": [
    {
      "id": "cust-123",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "created_at": "2024-01-01T12:00:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "per_page": 10
  }
}`);
      setLoading(false);
      toast.success('Request completed');
    }, 1000);
  };

  const generateApiKey = () => {
    const key = 'asp_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    toast.success('API key generated: ' + key);
  };

  const webhookLogs = [
    {
      id: '1',
      event: 'work_order.completed',
      url: 'https://example.com/webhook',
      status: 'success',
      timestamp: '2024-01-01T12:00:00Z',
      response_time: '245ms'
    },
    {
      id: '2',
      event: 'customer.created',
      url: 'https://example.com/webhook',
      status: 'failed',
      timestamp: '2024-01-01T11:58:00Z',
      response_time: 'timeout'
    },
    {
      id: '3',
      event: 'invoice.paid',
      url: 'https://example.com/webhook',
      status: 'success',
      timestamp: '2024-01-01T11:55:00Z',
      response_time: '123ms'
    }
  ];

  const apiMetrics = {
    totalRequests: 15420,
    successRate: 99.2,
    avgResponseTime: 180,
    rateLimitHits: 12
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Code className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold">API Tools</h1>
          <p className="text-muted-foreground">
            Test endpoints, manage keys, and monitor API usage
          </p>
        </div>
      </div>

      <Tabs defaultValue="playground" className="space-y-6">
        <TabsList>
          <TabsTrigger value="playground">API Playground</TabsTrigger>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks">Webhook Manager</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="playground" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                API Playground
              </CardTitle>
              <CardDescription>
                Test API endpoints directly from the browser
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="method">HTTP Method</Label>
                    <Select value={testRequest.method} onValueChange={(value) => 
                      setTestRequest(prev => ({ ...prev, method: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="endpoint">Endpoint</Label>
                    <Input
                      id="endpoint"
                      value={testRequest.endpoint}
                      onChange={(e) => setTestRequest(prev => ({ ...prev, endpoint: e.target.value }))}
                      placeholder="/api/customers"
                    />
                  </div>

                  <div>
                    <Label htmlFor="headers">Headers (JSON)</Label>
                    <Textarea
                      id="headers"
                      value={testRequest.headers}
                      onChange={(e) => setTestRequest(prev => ({ ...prev, headers: e.target.value }))}
                      placeholder='{"Content-Type": "application/json"}'
                      rows={3}
                    />
                  </div>

                  {testRequest.method !== 'GET' && (
                    <div>
                      <Label htmlFor="body">Request Body (JSON)</Label>
                      <Textarea
                        id="body"
                        value={testRequest.body}
                        onChange={(e) => setTestRequest(prev => ({ ...prev, body: e.target.value }))}
                        placeholder='{"first_name": "John", "last_name": "Doe"}'
                        rows={6}
                      />
                    </div>
                  )}

                  <Button onClick={handleTestRequest} disabled={loading} className="w-full">
                    {loading ? 'Sending...' : 'Send Request'}
                  </Button>
                </div>

                <div>
                  <Label>Response</Label>
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-auto h-96 mt-2">
                    <code>{testResponse || 'Response will appear here...'}</code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Key Management
              </CardTitle>
              <CardDescription>
                Generate and manage your API keys
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={generateApiKey} className="mb-4">
                Generate New API Key
              </Button>
              
              <div className="space-y-3">
                {[
                  { name: 'Production Key', key: 'asp_prod_****', created: '2024-01-01', lastUsed: '2024-01-15' },
                  { name: 'Development Key', key: 'asp_dev_****', created: '2024-01-05', lastUsed: '2024-01-15' },
                  { name: 'Testing Key', key: 'asp_test_****', created: '2024-01-10', lastUsed: 'Never' }
                ].map((key, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{key.name}</h4>
                      <p className="text-sm text-muted-foreground font-mono">{key.key}</p>
                      <p className="text-xs text-muted-foreground">
                        Created: {key.created} • Last used: {key.lastUsed}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Copy
                      </Button>
                      <Button variant="destructive" size="sm">
                        Revoke
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhook Management
              </CardTitle>
              <CardDescription>
                Configure and monitor webhook endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="mb-4">
                Add Webhook Endpoint
              </Button>

              <div>
                <h4 className="font-semibold mb-3">Recent Webhook Deliveries</h4>
                <div className="space-y-2">
                  {webhookLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                          {log.status}
                        </Badge>
                        <div>
                          <p className="font-medium">{log.event}</p>
                          <p className="text-sm text-muted-foreground">{log.url}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{log.response_time}</p>
                        <p>{new Date(log.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{apiMetrics.totalRequests.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{apiMetrics.successRate}%</div>
                <p className="text-xs text-muted-foreground">+0.3% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{apiMetrics.avgResponseTime}ms</div>
                <p className="text-xs text-muted-foreground">-15ms from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Rate Limit Hits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{apiMetrics.rateLimitHits}</div>
                <p className="text-xs text-muted-foreground">-5 from last month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                API Usage Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                API usage chart would be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}