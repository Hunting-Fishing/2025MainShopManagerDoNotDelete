
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Key, AlertTriangle, Eye } from "lucide-react";
import { Container, Segment, Header as SemanticHeader } from "semantic-ui-react";

export default function SecuritySettings() {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    ipWhitelist: false,
    sessionTimeout: true,
    apiRateLimit: true,
    auditLogging: true,
    encryptionAtRest: true,
  });

  const [ipAddresses, setIpAddresses] = useState([
    "192.168.1.100",
    "10.0.0.50",
    "203.0.113.10"
  ]);

  const securityLogs = [
    { time: "2024-01-15 10:30", event: "Failed login attempt", user: "admin@shop.com", severity: "High" },
    { time: "2024-01-15 09:15", event: "API key generated", user: "manager@shop.com", severity: "Medium" },
    { time: "2024-01-15 08:45", event: "Password changed", user: "tech@shop.com", severity: "Low" },
  ];

  const handleSettingChange = (key: string, value: boolean) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'bg-red-100 text-red-800 border-red-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Container fluid className="px-4 py-8">
      <Segment raised className="mb-8 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 border-t-4 border-t-cyan-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <Button variant="outline" size="sm" className="mb-4" asChild>
              <Link to="/developer">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Developer Portal
              </Link>
            </Button>
            <SemanticHeader as="h1" className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-cyan-600" />
              Security Settings
            </SemanticHeader>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Manage security configurations and access controls
            </p>
          </div>
        </div>
      </Segment>

      <Tabs defaultValue="authentication" className="space-y-6">
        <TabsList className="bg-white dark:bg-slate-800 rounded-full p-1 border shadow-sm">
          <TabsTrigger 
            value="authentication" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
          >
            Authentication
          </TabsTrigger>
          <TabsTrigger 
            value="access" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Access Control
          </TabsTrigger>
          <TabsTrigger 
            value="monitoring" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Monitoring
          </TabsTrigger>
          <TabsTrigger 
            value="encryption" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            Encryption
          </TabsTrigger>
        </TabsList>

        <TabsContent value="authentication" className="space-y-6">
          <Card className="border-t-4 border-t-cyan-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Authentication Settings
              </CardTitle>
              <CardDescription>
                Configure user authentication and password policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Two-Factor Authentication</Label>
                  <div className="text-sm text-gray-600">
                    Require 2FA for all admin accounts
                  </div>
                </div>
                <Switch
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Session Timeout</Label>
                  <div className="text-sm text-gray-600">
                    Automatically log out inactive users
                  </div>
                </div>
                <Switch
                  checked={securitySettings.sessionTimeout}
                  onCheckedChange={(checked) => handleSettingChange('sessionTimeout', checked)}
                />
              </div>

              <Card className="p-4 bg-blue-50 dark:bg-slate-800">
                <h3 className="font-semibold mb-3">Password Policy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p>• Minimum 12 characters</p>
                    <p>• At least 1 uppercase letter</p>
                    <p>• At least 1 lowercase letter</p>
                  </div>
                  <div className="space-y-2">
                    <p>• At least 1 number</p>
                    <p>• At least 1 special character</p>
                    <p>• Cannot reuse last 5 passwords</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-3">
                  Modify Policy
                </Button>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-6">
          <Card className="border-t-4 border-t-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Access Control
              </CardTitle>
              <CardDescription>
                Manage IP restrictions and API access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">IP Whitelist</Label>
                  <div className="text-sm text-gray-600">
                    Restrict access to specific IP addresses
                  </div>
                </div>
                <Switch
                  checked={securitySettings.ipWhitelist}
                  onCheckedChange={(checked) => handleSettingChange('ipWhitelist', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">API Rate Limiting</Label>
                  <div className="text-sm text-gray-600">
                    Limit API requests per user/IP
                  </div>
                </div>
                <Switch
                  checked={securitySettings.apiRateLimit}
                  onCheckedChange={(checked) => handleSettingChange('apiRateLimit', checked)}
                />
              </div>

              {securitySettings.ipWhitelist && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Allowed IP Addresses</h3>
                  <div className="space-y-2">
                    {ipAddresses.map((ip, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700 rounded">
                        <span className="font-mono text-sm">{ip}</span>
                        <Button variant="outline" size="sm">Remove</Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Input placeholder="Enter IP address" className="flex-1" />
                    <Button>Add IP</Button>
                  </div>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card className="border-t-4 border-t-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Security Monitoring
              </CardTitle>
              <CardDescription>
                Monitor security events and audit logs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Audit Logging</Label>
                  <div className="text-sm text-gray-600">
                    Log all security-related events
                  </div>
                </div>
                <Switch
                  checked={securitySettings.auditLogging}
                  onCheckedChange={(checked) => handleSettingChange('auditLogging', checked)}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Recent Security Events</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Time</th>
                        <th className="text-left p-3">Event</th>
                        <th className="text-left p-3">User</th>
                        <th className="text-left p-3">Severity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {securityLogs.map((log, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-slate-800">
                          <td className="p-3 text-sm font-mono">{log.time}</td>
                          <td className="p-3">{log.event}</td>
                          <td className="p-3 text-sm text-gray-600">{log.user}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(log.severity)}`}>
                              {log.severity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="encryption" className="space-y-6">
          <Card className="border-t-4 border-t-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Encryption Settings
              </CardTitle>
              <CardDescription>
                Configure data encryption and security protocols
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Encryption at Rest</Label>
                  <div className="text-sm text-gray-600">
                    Encrypt sensitive data in the database
                  </div>
                </div>
                <Switch
                  checked={securitySettings.encryptionAtRest}
                  onCheckedChange={(checked) => handleSettingChange('encryptionAtRest', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    SSL/TLS
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">Transport layer security</p>
                  <Badge variant="outline" className="border-green-300 text-green-700">
                    Active
                  </Badge>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    API Keys
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">Secure API authentication</p>
                  <Button variant="outline" size="sm">
                    Rotate Keys
                  </Button>
                </Card>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold text-amber-800 dark:text-amber-400">Security Recommendations</h3>
                </div>
                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• Enable two-factor authentication for all admin accounts</li>
                  <li>• Regularly rotate API keys and certificates</li>
                  <li>• Monitor and review security logs weekly</li>
                  <li>• Keep security policies up to date</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  );
}
