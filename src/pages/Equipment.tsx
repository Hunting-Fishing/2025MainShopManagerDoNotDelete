import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cog, Settings, Wrench } from 'lucide-react';
import { EquipmentList } from '@/components/equipment/EquipmentList';
import { AddEquipmentDialog } from '@/components/equipment/AddEquipmentDialog';
import { useEquipment } from '@/hooks/useEquipment';

export default function Equipment() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { equipment, stats, isLoading, refetch } = useEquipment();

  return (
    <>
      <Helmet>
        <title>Equipment Management | AutoShop Pro</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Equipment Management</h1>
            <p className="text-muted-foreground">
              Manage your shop equipment, tools, and machinery
            </p>
          </div>
          <AddEquipmentDialog 
            open={dialogOpen} 
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                // Force refetch after closing to show new equipment
                setTimeout(() => refetch(), 300);
              }
            }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
              <Cog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Active equipment items
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : stats.needsMaintenance}</div>
              <p className="text-xs text-muted-foreground">
                Items need maintenance
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Service</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : stats.outOfService}</div>
              <p className="text-xs text-muted-foreground">
                Currently out of service
              </p>
            </CardContent>
          </Card>
        </div>

        <EquipmentList equipment={equipment} loading={isLoading} onUpdate={refetch} />
      </div>
    </>
  );
}