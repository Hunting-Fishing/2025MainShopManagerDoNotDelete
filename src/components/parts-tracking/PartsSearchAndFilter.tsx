
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import { WorkOrderPart, partStatusMap, PART_CATEGORIES } from '@/types/workOrderPart';
import { supabase } from '@/integrations/supabase/client';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';

export function PartsSearchAndFilter() {
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Map database fields to WorkOrderPart interface
  const mapDatabaseToPart = (dbPart: any): WorkOrderPart => ({
    id: dbPart.id,
    workOrderId: dbPart.work_order_id,
    jobLineId: dbPart.job_line_id,
    inventoryItemId: dbPart.inventory_item_id,
    partName: dbPart.part_name || '',
    partNumber: dbPart.part_number,
    supplierName: dbPart.supplier_name,
    supplierCost: dbPart.supplier_cost || 0,
    supplierSuggestedRetailPrice: dbPart.supplier_suggested_retail_price,
    markupPercentage: dbPart.markup_percentage || 0,
    retailPrice: dbPart.retail_price || 0,
    customerPrice: dbPart.customer_price || 0,
    quantity: dbPart.quantity || 0,
    partType: dbPart.part_type as 'inventory' | 'non-inventory',
    invoiceNumber: dbPart.invoice_number,
    poLine: dbPart.po_line,
    notes: dbPart.notes,
    createdAt: dbPart.created_at,
    updatedAt: dbPart.updated_at,
    category: dbPart.category,
    isTaxable: dbPart.is_taxable || false,
    coreChargeAmount: dbPart.core_charge_amount || 0,
    coreChargeApplied: dbPart.core_charge_applied || false,
    warrantyDuration: dbPart.warranty_duration,
    warrantyExpiryDate: dbPart.warranty_expiry_date,
    installDate: dbPart.install_date,
    installedBy: dbPart.installed_by,
    status: dbPart.status || 'ordered',
    isStockItem: dbPart.is_stock_item || false,
    dateAdded: dbPart.date_added || dbPart.created_at,
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
    const matchesSupplier = supplierFilter === 'all' || part.supplierName === supplierFilter;
    
    let matchesDate = true;
    if (dateRange?.from) {
      const partDate = new Date(part.dateAdded);
      matchesDate = partDate >= dateRange.from && (!dateRange.to || partDate <= dateRange.to);
    }
    
    return matchesSearch && matchesStatus && matchesCategory && matchesSupplier && matchesDate;
  });

  const suppliers = [...new Set(parts.map(part => part.supplierName).filter(Boolean))];

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setSupplierFilter('all');
    setDateRange(undefined);
  };

  const exportToCSV = () => {
    const headers = ['Part Name', 'Part Number', 'Supplier', 'Category', 'Quantity', 'Cost', 'Price', 'Status'];
    const csvData = filteredParts.map(part => [
      part.partName,
      part.partNumber || '',
      part.supplierName || '',
      part.category || '',
      part.quantity,
      part.supplierCost,
      part.customerPrice,
      part.status
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parts-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Parts Search & Filter</CardTitle>
              <p className="text-sm text-muted-foreground">
                Advanced search and filtering for parts inventory
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
              <Button variant="outline" onClick={fetchParts}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search parts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
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
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {PART_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier} value={supplier}>
                    {supplier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-6">
            <DatePickerWithRange
              date={dateRange}
              onDateChange={setDateRange}
              className="w-full md:w-auto"
            />
          </div>

          <div className="flex items-center gap-4 mb-4">
            <Badge variant="secondary">
              {filteredParts.length} parts found
            </Badge>
            {searchTerm && (
              <Badge variant="outline">
                Search: "{searchTerm}"
              </Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge variant="outline">
                Status: {statusFilter}
              </Badge>
            )}
            {categoryFilter !== 'all' && (
              <Badge variant="outline">
                Category: {categoryFilter}
              </Badge>
            )}
            {supplierFilter !== 'all' && (
              <Badge variant="outline">
                Supplier: {supplierFilter}
              </Badge>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">Loading parts...</div>
          ) : (
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
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
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
                      <TableCell>{part.quantity}</TableCell>
                      <TableCell>${part.supplierCost.toFixed(2)}</TableCell>
                      <TableCell>${part.customerPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={partStatusMap[part.status]?.classes}
                        >
                          {partStatusMap[part.status]?.label || part.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(part.dateAdded).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!loading && filteredParts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No parts found matching your search criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
