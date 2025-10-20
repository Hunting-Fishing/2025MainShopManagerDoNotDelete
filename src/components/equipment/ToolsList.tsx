import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useShopId } from '@/hooks/useShopId';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Hammer, CheckCircle, AlertCircle, XCircle, Wrench as WrenchIcon } from 'lucide-react';
import { ToolDialog } from './ToolDialog';
import { useToast } from '@/hooks/use-toast';

const statusIcons = {
  available: <CheckCircle className="h-4 w-4 text-green-600" />,
  in_use: <WrenchIcon className="h-4 w-4 text-blue-600" />,
  maintenance: <AlertCircle className="h-4 w-4 text-yellow-600" />,
  broken: <XCircle className="h-4 w-4 text-red-600" />,
  lost: <AlertCircle className="h-4 w-4 text-gray-600" />,
  retired: <AlertCircle className="h-4 w-4 text-gray-400" />,
};

const statusColors = {
  available: 'bg-green-100 text-green-800',
  in_use: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  broken: 'bg-red-100 text-red-800',
  lost: 'bg-gray-100 text-gray-800',
  retired: 'bg-gray-100 text-gray-600',
};

export function ToolsList() {
  const { shopId } = useShopId();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<any>(null);

  const { data: tools, isLoading, refetch } = useQuery({
    queryKey: ['tools', shopId, categoryFilter, statusFilter],
    queryFn: async () => {
      if (!shopId) return [];
      
      let query = supabase
        .from('tools')
        .select('*')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false });

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as any);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to load tools',
          variant: 'destructive',
        });
        throw error;
      }

      return data;
    },
    enabled: !!shopId,
  });

  const filteredTools = tools?.filter(tool =>
    searchQuery === '' ||
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.tool_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (tool: any) => {
    setSelectedTool(tool);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedTool(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedTool(null);
    refetch();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Hammer className="h-5 w-5" />
              Tool Inventory
            </CardTitle>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Tool
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, tool number, or manufacturer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="hand_tool">Hand Tool</SelectItem>
                <SelectItem value="power_tool">Power Tool</SelectItem>
                <SelectItem value="diagnostic">Diagnostic</SelectItem>
                <SelectItem value="specialty">Specialty</SelectItem>
                <SelectItem value="ppe">PPE</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="in_use">In Use</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="broken">Broken</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading tools...</div>
          ) : filteredTools && filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTools.map((tool) => (
                <Card
                  key={tool.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleEdit(tool)}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{tool.name}</h3>
                          <p className="text-sm text-muted-foreground">#{tool.tool_number}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {statusIcons[tool.status as keyof typeof statusIcons]}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {tool.category.replace('_', ' ')}
                        </Badge>
                        <Badge className={statusColors[tool.status as keyof typeof statusColors]}>
                          {tool.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="text-sm space-y-1">
                        {tool.manufacturer && (
                          <p><span className="font-medium">Manufacturer:</span> {tool.manufacturer}</p>
                        )}
                        {tool.model && (
                          <p><span className="font-medium">Model:</span> {tool.model}</p>
                        )}
                        {tool.location && (
                          <p><span className="font-medium">Location:</span> {tool.location}</p>
                        )}
                        {tool.assigned_to_person_name && (
                          <p><span className="font-medium">Assigned to:</span> {tool.assigned_to_person_name}</p>
                        )}
                        {tool.condition && (
                          <Badge variant="secondary" className="text-xs capitalize">
                            {tool.condition}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No tools found. Click "Add Tool" to get started.
            </div>
          )}
        </CardContent>
      </Card>

      <ToolDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        tool={selectedTool}
      />
    </div>
  );
}
