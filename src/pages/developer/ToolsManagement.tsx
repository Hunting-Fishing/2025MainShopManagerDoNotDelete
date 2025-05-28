
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { ArrowLeft, Hammer, Search, Plus, Package, Settings } from "lucide-react";
import { Container, Segment, Header as SemanticHeader } from "semantic-ui-react";

export default function ToolsManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock tool data for demonstration
  const tools = [
    { id: 1, name: "Impact Wrench", category: "Hand Tools", brand: "DeWalt", model: "DCF899", status: "Available", location: "Bay 1" },
    { id: 2, name: "Diagnostic Scanner", category: "Diagnostic", brand: "Snap-on", model: "MODIS", status: "In Use", location: "Bay 2" },
    { id: 3, name: "Hydraulic Lift", category: "Lifting", brand: "BendPak", model: "XPR-10", status: "Maintenance", location: "Bay 3" },
  ];

  const categories = [
    { id: 1, name: "Hand Tools", count: 45, description: "Wrenches, sockets, and manual tools" },
    { id: 2, name: "Power Tools", count: 23, description: "Electric and pneumatic tools" },
    { id: 3, name: "Diagnostic", count: 12, description: "Scanning and diagnostic equipment" },
    { id: 4, name: "Lifting", count: 8, description: "Lifts, jacks, and hoists" },
  ];

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800 border-green-300';
      case 'In Use': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Container fluid className="px-4 py-8">
      <Segment raised className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-900 border-t-4 border-t-amber-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <Button variant="outline" size="sm" className="mb-4" asChild>
              <Link to="/developer">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Developer Portal
              </Link>
            </Button>
            <SemanticHeader as="h1" className="text-3xl font-bold flex items-center gap-3">
              <Hammer className="h-8 w-8 text-amber-600" />
              Tools Management
            </SemanticHeader>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Manage tools, equipment, and their categories across the platform
            </p>
          </div>
        </div>
      </Segment>

      <Tabs defaultValue="tools" className="space-y-6">
        <TabsList className="bg-white dark:bg-slate-800 rounded-full p-1 border shadow-sm">
          <TabsTrigger 
            value="tools" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-amber-600 data-[state=active]:text-white"
          >
            Tools Inventory
          </TabsTrigger>
          <TabsTrigger 
            value="categories" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white"
          >
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-6">
          <Card className="border-t-4 border-t-amber-500">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Hammer className="h-5 w-5" />
                    Tools Inventory
                  </CardTitle>
                  <CardDescription>
                    Manage and track all tools and equipment
                  </CardDescription>
                </div>
                <Button className="bg-amber-600 hover:bg-amber-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tool
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search tools..."
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
                      <th className="text-left p-3">Tool</th>
                      <th className="text-left p-3">Category</th>
                      <th className="text-left p-3">Brand/Model</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Location</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTools.map((tool) => (
                      <tr key={tool.id} className="border-b hover:bg-gray-50 dark:hover:bg-slate-800">
                        <td className="p-3">
                          <div className="font-medium">{tool.name}</div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="border-amber-300 text-amber-700">
                            {tool.category}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{tool.brand}</div>
                            <div className="text-sm text-gray-500">{tool.model}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(tool.status)}`}>
                            {tool.status}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-600">{tool.location}</td>
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

        <TabsContent value="categories" className="space-y-6">
          <Card className="border-t-4 border-t-orange-500">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Tool Categories
                  </CardTitle>
                  <CardDescription>
                    Organize tools by categories and types
                  </CardDescription>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {categories.map((category) => (
                  <Card key={category.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                        <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-amber-600">{category.count} tools</span>
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
