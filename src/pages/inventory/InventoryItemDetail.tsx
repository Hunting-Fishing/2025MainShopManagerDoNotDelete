import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Package } from 'lucide-react';
import { InventoryItemExtended } from '@/types/inventory';
import { useInventoryCrud } from '@/hooks/inventory/useInventoryCrud';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CoreTrackingManager } from '@/components/inventory/core-tracking/CoreTrackingManager';
import { SerialNumberTracker } from '@/components/inventory/serial-tracking/SerialNumberTracker';
import { SeoHead } from '@/components/common/SeoHead';

export default function InventoryItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getItem, loading } = useInventoryCrud();
  const [item, setItem] = useState<InventoryItemExtended | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      const itemData = await getItem(id);
      if (itemData) {
        setItem(itemData);
      }
    };

    fetchItem();
  }, [id, getItem]);

  const handleBack = () => {
    navigate('/inventory');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col justify-center items-center h-[500px] space-y-4">
        <div className="text-xl font-semibold text-red-500">Item Not Found</div>
        <Button onClick={handleBack}>Back to Inventory</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SeoHead
        title={`${item.name} | Inventory Detail`}
        description={`Details for inventory item ${item.name}`}
        keywords="inventory management, item detail, core tracking, serial number tracking"
      />

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Inventory
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{item.name}</h1>
              <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-100 px-3 py-1 rounded-full text-sm">
              Category: <span className="font-medium">{item.category}</span>
            </div>
            <div className="bg-slate-100 px-3 py-1 rounded-full text-sm">
              Supplier: <span className="font-medium">{item.supplier}</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              item.status === 'In Stock' ? 'bg-green-100 text-green-800' :
              item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {item.status}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Quantity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.quantity}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unit Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${item.unitPrice.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(item.quantity * item.unitPrice).toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="core-tracking">Core Tracking</TabsTrigger>
            <TabsTrigger value="serial-tracking">Serial Numbers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <dt className="font-medium">Part Number</dt>
                      <dd className="text-right">{item.partNumber || "-"}</dd>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <dt className="font-medium">Barcode</dt>
                      <dd className="text-right">{item.barcode || "-"}</dd>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <dt className="font-medium">Brand/Manufacturer</dt>
                      <dd className="text-right">{item.manufacturer || "-"}</dd>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <dt className="font-medium">Subcategory</dt>
                      <dd className="text-right">{item.subcategory || "-"}</dd>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <dt className="font-medium">Location</dt>
                      <dd className="text-right">{item.location || "-"}</dd>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <dt className="font-medium">Vehicle Compatibility</dt>
                      <dd className="text-right">{item.vehicleCompatibility || "-"}</dd>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <dt className="font-medium">Warranty Period</dt>
                      <dd className="text-right">{item.warrantyPeriod || "-"}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Stock Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <dt className="font-medium">Reorder Point</dt>
                      <dd className="text-right">{item.reorderPoint}</dd>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <dt className="font-medium">Quantity Reserved</dt>
                      <dd className="text-right">{item.onHold || 0}</dd>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <dt className="font-medium">Quantity Available</dt>
                      <dd className="text-right">{item.quantity - (item.onHold || 0)}</dd>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <dt className="font-medium">On Order</dt>
                      <dd className="text-right">{item.onOrder || 0}</dd>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <dt className="font-medium">Unit Cost</dt>
                      <dd className="text-right">${item.cost?.toFixed(2) || "-"}</dd>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <dt className="font-medium">Markup %</dt>
                      <dd className="text-right">{item.marginMarkup?.toFixed(2)}%</dd>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <dt className="font-medium">Core Charge</dt>
                      <dd className="text-right">${item.coreCharge?.toFixed(2) || "0.00"}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
            
            {item.description && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{item.description}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="core-tracking">
            <CoreTrackingManager item={item} />
          </TabsContent>
          
          <TabsContent value="serial-tracking">
            <SerialNumberTracker itemId={item.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
