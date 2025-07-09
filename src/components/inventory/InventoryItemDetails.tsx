import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Edit2, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';
import { InventoryItemExtended } from '@/types/inventory';

interface InventoryItemDetailsProps {
  item: InventoryItemExtended;
  onUpdate: (updates: Partial<InventoryItemExtended>) => void;
  isUpdating?: boolean;
}

export function InventoryItemDetails({ item, onUpdate, isUpdating }: InventoryItemDetailsProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<InventoryItemExtended>>({});

  const handleEdit = () => {
    setEditData({
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      unit_price: item.unit_price,
      reorder_point: item.reorder_point,
      location: item.location,
      supplier: item.supplier,
      description: item.description,
      status: item.status,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({});
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in stock':
        return 'bg-green-100 text-green-800';
      case 'low stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out of stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalValue = (Number(item.unit_price) || 0) * (Number(item.quantity) || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/inventory')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inventory
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{item.name}</h1>
            <p className="text-muted-foreground">SKU: {item.sku}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                disabled={isUpdating}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit} size="sm">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Item
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editData.name || ''}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                ) : (
                  <p className="text-sm font-medium mt-1">{item.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="sku">SKU</Label>
                {isEditing ? (
                  <Input
                    id="sku"
                    value={editData.sku || ''}
                    onChange={(e) => setEditData({ ...editData, sku: e.target.value })}
                  />
                ) : (
                  <p className="text-sm font-medium mt-1">{item.sku}</p>
                )}
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                {isEditing ? (
                  <Input
                    id="category"
                    value={editData.category || ''}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                  />
                ) : (
                  <p className="text-sm font-medium mt-1">{item.category}</p>
                )}
              </div>
              <div>
                <Label htmlFor="supplier">Supplier</Label>
                {isEditing ? (
                  <Input
                    id="supplier"
                    value={editData.supplier || ''}
                    onChange={(e) => setEditData({ ...editData, supplier: e.target.value })}
                  />
                ) : (
                  <p className="text-sm font-medium mt-1">{item.supplier || 'N/A'}</p>
                )}
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                {isEditing ? (
                  <Input
                    id="location"
                    value={editData.location || ''}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                  />
                ) : (
                  <p className="text-sm font-medium mt-1">{item.location || 'N/A'}</p>
                )}
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <div className="mt-1">
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              {isEditing ? (
                <Textarea
                  id="description"
                  value={editData.description || ''}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={3}
                />
              ) : (
                <p className="text-sm mt-1">{item.description || 'No description available'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stock & Pricing */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="quantity">Current Stock</Label>
                {isEditing ? (
                  <Input
                    id="quantity"
                    type="number"
                    value={editData.quantity || 0}
                    onChange={(e) => setEditData({ ...editData, quantity: Number(e.target.value) })}
                  />
                ) : (
                  <p className="text-2xl font-bold text-primary">{item.quantity}</p>
                )}
              </div>
              <div>
                <Label htmlFor="reorder_point">Reorder Point</Label>
                {isEditing ? (
                  <Input
                    id="reorder_point"
                    type="number"
                    value={editData.reorder_point || 0}
                    onChange={(e) => setEditData({ ...editData, reorder_point: Number(e.target.value) })}
                  />
                ) : (
                  <p className="text-sm font-medium mt-1">{item.reorder_point || 0}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="unit_price">Unit Price</Label>
                {isEditing ? (
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    value={editData.unit_price || 0}
                    onChange={(e) => setEditData({ ...editData, unit_price: Number(e.target.value) })}
                  />
                ) : (
                  <p className="text-lg font-semibold">{formatCurrency(item.unit_price)}</p>
                )}
              </div>
              <div>
                <Label>Total Value</Label>
                <p className="text-lg font-semibold text-primary">{formatCurrency(totalValue)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}