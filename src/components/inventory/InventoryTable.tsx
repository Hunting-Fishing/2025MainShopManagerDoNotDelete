
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Package, Search, Filter } from 'lucide-react';
import { InventoryItemExtended } from '@/types/inventory';
import { getInventoryStatus } from '@/utils/inventory';

interface InventoryTableProps {
  items: InventoryItemExtended[];
  onUpdateItem?: (id: string, updates: Partial<InventoryItemExtended>) => Promise<InventoryItemExtended>;
}

export function InventoryTable({ items, onUpdateItem }: InventoryTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<InventoryItemExtended>>({});

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleEdit = (item: InventoryItemExtended) => {
    setEditingItem(item.id);
    setEditValues({
      quantity: item.quantity,
      unit_price: item.unit_price,
      reorder_point: item.reorder_point
    });
  };

  const handleSave = async (itemId: string) => {
    if (onUpdateItem && editValues) {
      try {
        await onUpdateItem(itemId, editValues);
        setEditingItem(null);
        setEditValues({});
      } catch (error) {
        console.error('Error updating item:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setEditValues({});
  };

  if (filteredItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            {searchQuery ? 'No matching items found' : 'No inventory items found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery 
              ? `No items match your search for "${searchQuery}"`
              : 'Your inventory database is empty. Add real inventory items to start managing your business inventory.'
            }
          </p>
          {searchQuery && (
            <Button 
              variant="outline" 
              onClick={() => setSearchQuery('')}
              className="mr-4"
            >
              Clear Search
            </Button>
          )}
          <Button onClick={() => window.location.href = "/inventory/add"}>
            Add Inventory Item
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Items ({filteredItems.length})
          </CardTitle>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Reorder Point</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const isEditing = editingItem === item.id;
                const status = getInventoryStatus(item);
                
                return (
                  <TableRow key={item.id} className="group hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                    <TableCell>
                      {item.category && (
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editValues.quantity || ''}
                          onChange={(e) => setEditValues(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                          className="w-20 text-right"
                        />
                      ) : (
                        <span className="font-medium">{item.quantity}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editValues.unit_price || ''}
                          onChange={(e) => setEditValues(prev => ({ ...prev, unit_price: parseFloat(e.target.value) || 0 }))}
                          className="w-24 text-right"
                        />
                      ) : (
                        <span className="font-medium">
                          ${item.unit_price.toFixed(2)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editValues.reorder_point || ''}
                          onChange={(e) => setEditValues(prev => ({ ...prev, reorder_point: parseInt(e.target.value) || 0 }))}
                          className="w-20 text-right"
                        />
                      ) : (
                        <span>{item.reorder_point}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(status)}>
                        {status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleSave(item.id)}
                            className="h-8 px-3"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                            className="h-8 px-3"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(item)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
