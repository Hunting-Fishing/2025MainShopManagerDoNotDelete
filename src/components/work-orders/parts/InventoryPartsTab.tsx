
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { getInventoryItems } from '@/services/inventory/crudService';
import { InventoryItemExtended } from '@/types/inventory';
import { SupplierSelector } from './SupplierSelector';

interface InventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
}

export function InventoryPartsTab({
  workOrderId,
  jobLineId,
  onAddPart
}: InventoryPartsTabProps) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItemExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        setLoading(true);
        const items = await getInventoryItems();
        setInventoryItems(items);
      } catch (error) {
        console.error('Error fetching inventory items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryItems();
  }, []);

  // Filter items based on search and filters
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSupplier = !selectedSupplier || item.supplier === selectedSupplier;
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    
    return matchesSearch && matchesSupplier && matchesCategory;
  });

  // Get unique categories and suppliers from inventory
  const categories = [...new Set(inventoryItems.map(item => item.category).filter(Boolean))];

  const handleAddInventoryItem = (item: InventoryItemExtended, quantity: number = 1) => {
    const part: WorkOrderPartFormValues = {
      partName: item.name,
      partNumber: item.sku,
      supplierName: item.supplier || '',
      supplierCost: item.cost || item.unit_price || 0,
      markupPercentage: item.marginMarkup || 25,
      retailPrice: item.unit_price || 0,
      customerPrice: item.unit_price || 0,
      quantity: quantity,
      partType: 'inventory',
      inventoryItemId: item.id,
      notes: ''
    };

    onAddPart(part);
  };

  if (loading) {
    return <div className="text-center py-4">Loading inventory items...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search Items</Label>
          <Input
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or SKU"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier-filter">Filter by Supplier</Label>
          <SupplierSelector
            value={selectedSupplier}
            onChange={setSelectedSupplier}
            placeholder="All suppliers"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-filter">Filter by Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clear Filters */}
      {(searchTerm || selectedSupplier || selectedCategory) && (
        <Button
          variant="outline"
          onClick={() => {
            setSearchTerm('');
            setSelectedSupplier('');
            setSelectedCategory('');
          }}
        >
          Clear Filters
        </Button>
      )}

      {/* Inventory Items Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.category || 'N/A'}</TableCell>
                  <TableCell>{item.supplier || 'N/A'}</TableCell>
                  <TableCell>${item.unit_price?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>{item.quantity || 0}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => handleAddInventoryItem(item)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Add
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  No inventory items found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
