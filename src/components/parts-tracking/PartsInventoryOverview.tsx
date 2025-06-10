
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { WorkOrderPart, partStatusMap } from '@/types/workOrderPart';
import { supabase } from '@/integrations/supabase/client';

export function PartsInventoryOverview() {
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Map database fields to WorkOrderPart interface
  const mapDatabaseToPart = (dbPart: any): WorkOrderPart => ({
    id: dbPart.id,
    workOrderId: dbPart.work_order_id,
    jobLineId: dbPart.job_line_id,
    inventoryItemId: dbPart.inventory_item_id,
    partName: dbPart.part_name,
    partNumber: dbPart.part_number,
    supplierName: dbPart.supplier_name,
    supplierCost: dbPart.supplier_cost,
    supplierSuggestedRetailPrice: dbPart.supplier_suggested_retail_price,
    markupPercentage: dbPart.markup_percentage,
    retailPrice: dbPart.retail_price,
    customerPrice: dbPart.customer_price,
    quantity: dbPart.quantity,
    partType: dbPart.part_type as 'inventory' | 'non-inventory',
    invoiceNumber: dbPart.invoice_number,
    poLine: dbPart.po_line,
    notes: dbPart.notes,
    createdAt: dbPart.created_at,
    updatedAt: dbPart.updated_at,
    category: dbPart.category,
    isTaxable: dbPart.is_taxable,
    coreChargeAmount: dbPart.core_charge_amount,
    coreChargeApplied: dbPart.core_charge_applied,
    warrantyDuration: dbPart.warranty_duration,
    warrantyExpiryDate: dbPart.warranty_expiry_date,
    installDate: dbPart.install_date,
    installedBy: dbPart.installed_by,
    status: dbPart.status,
    isStockItem: dbPart.is_stock_item,
    dateAdded: dbPart.date_added,
    attachments: Array.isArray(dbPart.attachments) ? dbPart.attachments : [],
    notesInternal: dbPart.notes_internal,
    binLocation: dbPart.bin_location,
    warehouseLocation: dbPart.warehouse_location,
    shelfLocation: dbPart.shelf_location
  });

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('work_order_parts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedParts = data?.map(mapDatabaseToPart) || [];
      setParts(mappedParts);
    } catch (error) {
      console.error('Error fetching parts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredParts = parts.filter(part => {
    const matchesSearch = part.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         part.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         part.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || part.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || part.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalValue = filteredParts.reduce((sum, part) => sum + (part.customerPrice * part.quantity), 0);
  const lowStockParts = filteredParts.filter(part => part.quantity <= 5);
  const categories = [...new Set(parts.map(part => part.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading parts inventory...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Parts</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredParts.length}</div>
            <p className="text-xs text-muted-foreground">
              Active inventory items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Current inventory value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockParts.length}</div>
            <p className="text-xs text-muted-foreground">
              Parts below 5 units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Active categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Parts Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search parts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="installed">Installed</SelectItem>
                <SelectItem value="backordered">Backordered</SelectItem>
                <SelectItem value="defective">Defective</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Parts Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part Name</TableHead>
                  <TableHead>Part Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Warranty</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell className="font-medium">{part.partName}</TableCell>
                    <TableCell>
                      {part.partNumber ? (
                        <Badge variant="outline">{part.partNumber}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {part.supplierName ? (
                        <Badge variant="secondary">{part.supplierName}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {part.category ? (
                        <Badge variant="outline">{part.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={part.quantity <= 5 ? "destructive" : "default"}>
                        {part.quantity}
                      </Badge>
                    </TableCell>
                    <TableCell>${part.supplierCost.toFixed(2)}</TableCell>
                    <TableCell>${part.customerPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className="font-medium">
                        ${(part.quantity * part.customerPrice).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={partStatusMap[part.status]?.classes}
                      >
                        {partStatusMap[part.status]?.label || part.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {part.warrantyDuration ? (
                        <Badge variant="outline">{part.warrantyDuration}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {part.binLocation ? (
                        <Badge variant="outline">{part.binLocation}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredParts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No parts found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
