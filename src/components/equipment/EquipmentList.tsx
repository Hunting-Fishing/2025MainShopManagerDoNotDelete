import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, AlertTriangle, CheckCircle, Clock, Plus, Loader2 } from 'lucide-react';
import { useCompanyAssets } from '@/hooks/useCompanyAssets';
import { AddAssetDialog } from './AddAssetDialog';
import { useToast } from '@/hooks/use-toast';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'operational': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'maintenance': return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'repair': return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default: return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'operational': return 'default';
    case 'maintenance': return 'secondary';
    case 'repair': return 'destructive';
    default: return 'outline';
  }
};

export function EquipmentList() {
  const { assets, loading, error } = useCompanyAssets();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredAssets = assets.filter(item => {
    const matchesSearch = 
      `${item.make} ${item.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (item.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === 'all' || item.asset_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Error loading equipment: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Company Assets & Equipment</CardTitle>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Asset</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="in_use">In Use</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="out_of_service">Out of Service</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            <p>No assets found. Click "Add Asset" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssets.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(item.asset_status || 'available')}
                      <div>
                        <h3 className="font-semibold">{item.year} {item.make} {item.model}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.asset_category || 'Equipment'} • {item.vin || 'No VIN'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {item.license_plate && (
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-medium">Plate: {item.license_plate}</p>
                        <p className="text-xs text-muted-foreground">Location: {item.current_location || 'N/A'}</p>
                      </div>
                    )}
                    <Badge variant={getStatusVariant(item.asset_status || 'available')}>
                      {item.asset_status || 'available'}
                    </Badge>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    <AddAssetDialog 
      open={isAddDialogOpen} 
      onOpenChange={setIsAddDialogOpen}
    />
    </>
  );
}