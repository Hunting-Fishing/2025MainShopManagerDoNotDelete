
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, Shield, Search, Plus, Settings } from "lucide-react";
import { Container, Segment, Header as SemanticHeader } from "semantic-ui-react";

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock user data for demonstration
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active", lastLogin: "2024-01-15" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Manager", status: "Active", lastLogin: "2024-01-14" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Technician", status: "Inactive", lastLogin: "2024-01-10" },
  ];

  const roles = [
    { id: 1, name: "Admin", permissions: 25, users: 2, description: "Full system access" },
    { id: 2, name: "Manager", permissions: 15, users: 5, description: "Shop management access" },
    { id: 3, name: "Technician", permissions: 8, users: 12, description: "Work order access" },
  ];

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid className="px-4 py-8">
      <Segment raised className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 border-t-4 border-t-indigo-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <Button variant="outline" size="sm" className="mb-4" asChild>
              <Link to="/developer">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Developer Portal
              </Link>
            </Button>
            <SemanticHeader as="h1" className="text-3xl font-bold flex items-center gap-3">
              <Users className="h-8 w-8 text-indigo-600" />
              User Management
            </SemanticHeader>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Manage users, roles, and permissions across the platform
            </p>
          </div>
        </div>
      </Segment>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-white dark:bg-slate-800 rounded-full p-1 border shadow-sm">
          <TabsTrigger 
            value="users" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
          >
            Users
          </TabsTrigger>
          <TabsTrigger 
            value="roles" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Roles & Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card className="border-t-4 border-t-indigo-500">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Accounts
                  </CardTitle>
                  <CardDescription>
                    Manage user accounts and their access levels
                  </CardDescription>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">User</th>
                      <th className="text-left p-3">Role</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Last Login</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50 dark:hover:bg-slate-800">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="border-indigo-300 text-indigo-700">
                            {user.role}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-gray-600">{user.lastLogin}</td>
                        <td className="p-3">
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card className="border-t-4 border-t-purple-500">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Roles & Permissions
                  </CardTitle>
                  <CardDescription>
                    Configure user roles and their permissions
                  </CardDescription>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {roles.map((role) => (
                  <Card key={role.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{role.name}</h3>
                        <p className="text-gray-600 text-sm mb-3">{role.description}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-purple-600">{role.permissions} permissions</span>
                          <span className="text-indigo-600">{role.users} users</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  );
}
