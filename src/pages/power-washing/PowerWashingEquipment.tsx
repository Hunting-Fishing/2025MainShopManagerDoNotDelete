import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  ArrowLeft,
  Wrench,
  AlertTriangle,
  Gauge
} from 'lucide-react';
import { usePowerWashingEquipment } from '@/hooks/usePowerWashing';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const conditionColors: Record<string, string> = {
  excellent: 'bg-green-500/10 text-green-500 border-green-500/20',
  good: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  fair: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  poor: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function PowerWashingEquipment() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: equipment, isLoading } = usePowerWashingEquipment();

  const filteredEquipment = equipment?.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.equipment_type.toLowerCase().includes(query) ||
      item.brand?.toLowerCase().includes(query)
    );
  });

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/power-washing')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Equipment</h1>
            <p className="text-muted-foreground">Manage your power washing equipment</p>
          </div>
          <Button onClick={() => navigate('/power-washing/equipment/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search equipment..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Equipment Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : filteredEquipment && filteredEquipment.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((item) => {
            const needsMaintenance = item.next_maintenance_date && item.next_maintenance_date <= today;
            
            return (
              <Card 
                key={item.id} 
                className={`cursor-pointer hover:border-primary/50 transition-colors ${
                  needsMaintenance ? 'border-amber-500/50' : ''
                }`}
                onClick={() => navigate(`/power-washing/equipment/${item.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Gauge className="h-6 w-6 text-primary" />
                    </div>
                    <Badge className={conditionColors[item.condition] || ''}>
                      {item.condition}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-lg text-foreground mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize mb-4">
                    {item.equipment_type.replace('_', ' ')}
                    {item.brand && ` • ${item.brand}`}
                  </p>

                  <div className="space-y-2 text-sm">
                    {item.psi_rating && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">PSI Rating</span>
                        <span className="font-medium">{item.psi_rating.toLocaleString()}</span>
                      </div>
                    )}
                    {item.gpm_rating && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GPM</span>
                        <span className="font-medium">{item.gpm_rating}</span>
                      </div>
                    )}
                  </div>

                  {needsMaintenance && (
                    <div className="mt-4 flex items-center gap-2 text-amber-500 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Maintenance due</span>
                    </div>
                  )}

                  {item.next_maintenance_date && !needsMaintenance && (
                    <div className="mt-4 flex items-center gap-2 text-muted-foreground text-sm">
                      <Wrench className="h-4 w-4" />
                      <span>Next maintenance: {format(new Date(item.next_maintenance_date), 'MMM d')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Gauge className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No equipment found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try adjusting your search' : 'Add your power washing equipment to track it'}
            </p>
            <Button onClick={() => navigate('/power-washing/equipment/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Equipment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
