
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Key, Lock, LogOut, AlertTriangle, Smartphone } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function SecurityTab() {
  const [sessions] = useState([
    { 
      device: "MacBook Pro",
      location: "San Francisco, CA",
      lastActive: "Just now",
      ip: "192.168.1.1", 
      isCurrent: true 
    },
    { 
      device: "iPhone 13",
      location: "San Francisco, CA",
      lastActive: "2 hours ago",
      ip: "192.168.1.2", 
      isCurrent: false 
    },
    { 
      device: "Windows PC",
      location: "New York, NY",
      lastActive: "2 days ago",
      ip: "192.168.1.3", 
      isCurrent: false 
    },
  ]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Password Settings
          </CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" />
          </div>
          <div className="flex justify-end">
            <Button className="bg-esm-blue-600 hover:bg-esm-blue-700">
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Receive a verification code via SMS or authentication app each time you log in
              </p>
            </div>
            <Switch id="two-factor" />
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="mt-0.5">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <Label className="text-sm font-medium">Authentication Method</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="app" name="auth-method" className="text-primary focus:ring-primary" />
                    <label htmlFor="app" className="text-sm">Authentication App</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="sms" name="auth-method" className="text-primary focus:ring-primary" />
                    <label htmlFor="sms" className="text-sm">SMS Verification</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>Manage your currently active sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{session.device}</span>
                        {session.isCurrent && (
                          <Badge variant="outline" className="mt-1 w-fit">Current</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{session.location}</span>
                        <span className="text-xs text-muted-foreground">{session.ip}</span>
                      </div>
                    </TableCell>
                    <TableCell>{session.lastActive}</TableCell>
                    <TableCell className="text-right">
                      {!session.isCurrent && (
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                          <LogOut className="mr-1 h-3 w-3" />
                          Sign Out
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" className="text-red-600">
              Sign out of all other sessions
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <h4 className="text-sm font-medium text-red-800">Delete Account</h4>
            <p className="mt-1 text-sm text-red-600">
              Once you delete your account, there is no going back. This action is permanent.
            </p>
            <div className="mt-4">
              <Button variant="destructive" size="sm">
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
