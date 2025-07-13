import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Shield, Settings, Plus } from 'lucide-react';

export const UserRoleManagement = () => {
  const mockRoles = [
    { id: '1', name: 'Admin', users: 3, permissions: 24 },
    { id: '2', name: 'Manager', users: 8, permissions: 18 },
    { id: '3', name: 'User', users: 45, permissions: 12 },
    { id: '4', name: 'Customer', users: 128, permissions: 6 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User & Role Management</h2>
          <p className="text-muted-foreground">Manage user roles and permissions</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockRoles.map((role) => (
          <Card key={role.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{role.name}</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{role.users}</div>
              <p className="text-xs text-muted-foreground">
                {role.permissions} permissions
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
          <CardDescription>
            Configure roles and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Role Management Interface</h3>
            <p>Detailed role and permission management interface would be displayed here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};