
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart } from '@/types/workOrderPart';
import { DateRange } from 'react-day-picker';

interface FilterState {
  search: string;
  category: string;
  status: string;
  supplier: string;
  partType: string;
  isTaxable: boolean | null;
  hasWarranty: boolean | null;
  dateRange: DateRange | undefined;
  priceRange: { min: number; max: number };
}

export function PartsSearchAndFilter() {
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [filteredParts, setFilteredParts] = useState<WorkOrderPart[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    status: 'all',
    supplier: 'all',
    partType: 'all',
    isTaxable: null,
    hasWarranty: null,
    dateRange: undefined,
    priceRange: { min: 0, max: 10000 }
  });

  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const [uniqueSuppliers, setUniqueSuppliers] = useState<string[]>([]);
  const [uniqueStatuses, setUniqueStatuses] = useState<string[]>([]);

  useEffect(() => {
    loadParts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [parts, filters]);

  const loadParts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('work_order_parts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const partsData = data || [];
      setParts(partsData);

      // Extract unique values for filters
      setUniqueCategories([...new Set(partsData.map(p => p.category).filter(Boolean))]);
      setUniqueSuppliers([...new Set(partsData.map(p => p.supplier_name).filter(Boolean))]);
      setUniqueStatuses([...new Set(partsData.map(p => p.status))]);

    } catch (error) {
      console.error('Error loading parts:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = parts;

    // Text search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(part =>
        part.part_name.toLowerCase().includes(searchLower) ||
        part.part_number?.toLowerCase().includes(searchLower) ||
        part.supplier_name?.toLowerCase().includes(searchLower) ||
        part.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(part => part.category === filters.category);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(part => part.status === filters.status);
    }

    // Supplier filter
    if (filters.supplier !== 'all') {
      filtered = filtered.filter(part => part.supplier_name === filters.supplier);
    }

    // Part type filter
    if (filters.partType !== 'all') {
      filtered = filtered.filter(part => part.part_type === filters.partType);
    }

    // Taxable filter
    if (filters.isTaxable !== null) {
      filtered = filtered.filter(part => part.is_taxable === filters.isTaxable);
    }

    // Warranty filter
    if (filters.hasWarranty !== null) {
      if (filters.hasWarranty) {
        filtered = filtered.filter(part => part.warranty_duration && part.warranty_duration !== 'No Warranty');
      } else {
        filtered = filtered.filter(part => !part.warranty_duration || part.warranty_duration === 'No Warranty');
      }
    }

    // Price range filter
    filtered = filtered.filter(part => 
      part.customer_price >= filters.priceRange.min && 
      part.customer_price <= filters.priceRange.max
    );

    // Date range filter
    if (filters.dateRange?.from) {
      filtered = filtered.filter(part => {
        const partDate = new Date(part.created_at);
        const fromDate = filters.dateRange!.from!;
        const toDate = filters.dateRange!.to || fromDate;
        return partDate >= fromDate && partDate <= toDate;
      });
    }

    setFilteredParts(filtered);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      status: 'all',
      supplier: 'all',
      partType: 'all',
      isTaxable: null,
      hasWarranty: null,
      dateRange: undefined,
      priceRange: { min: 0, max: 10000 }
    });
  };

  const exportResults = () => {
    // Create CSV content
    const headers = [
      'Part Name', 'Part Number', 'Category', 'Supplier', 'Status', 
      'Quantity', 'Supplier Cost', 'Customer Price', 'Total Value', 
      'Taxable', 'Warranty', 'Install Date', 'Location', 'Notes'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredParts.map(part => [
        `"${part.part_name}"`,
        `"${part.part_number || ''}"`,
        `"${part.category || ''}"`,
        `"${part.supplier_name || ''}"`,
        `"${part.status}"`,
        part.quantity,
        part.supplier_cost,
        part.customer_price,
        (part.customer_price * part.quantity).toFixed(2),
        part.is_taxable ? 'Yes' : 'No',
        `"${part.warranty_duration || 'No Warranty'}"`,
        `"${part.install_date || ''}"`,
        `"${part.bin_location || ''}"`,
        `"${part.notes || ''}"`.replace(/"/g, '""')
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parts-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Advanced Parts Search & Filter
            </CardTitle>
            <CardDescription>
              Search and filter parts with comprehensive criteria
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadParts} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportResults}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search parts, numbers, suppliers, notes..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-10"
          />
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Select 
            value={filters.category} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={filters.status} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {uniqueStatuses.map(status => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={filters.supplier} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, supplier: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {uniqueSuppliers.map(supplier => (
                <SelectItem key={supplier} value={supplier}>
                  {supplier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={filters.partType} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, partType: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Part Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="inventory">Inventory</SelectItem>
              <SelectItem value="non-inventory">Non-Inventory</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h4 className="font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Advanced Filters
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Checkbox Filters */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="taxable"
                  checked={filters.isTaxable === true}
                  onCheckedChange={(checked) => 
                    setFilters(prev => ({ 
                      ...prev, 
                      isTaxable: checked ? true : (filters.isTaxable === true ? null : filters.isTaxable)
                    }))
                  }
                />
                <label htmlFor="taxable" className="text-sm">Taxable Parts Only</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="warranty"
                  checked={filters.hasWarranty === true}
                  onCheckedChange={(checked) => 
                    setFilters(prev => ({ 
                      ...prev, 
                      hasWarranty: checked ? true : (filters.hasWarranty === true ? null : filters.hasWarranty)
                    }))
                  }
                />
                <label htmlFor="warranty" className="text-sm">Has Warranty</label>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Price Range</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange.min}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, min: Number(e.target.value) || 0 }
                  }))}
                  className="w-20"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange.max}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, max: Number(e.target.value) || 10000 }
                  }))}
                  className="w-20"
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <DatePickerWithRange
                date={filters.dateRange}
                onDateChange={(dateRange) => setFilters(prev => ({ ...prev, dateRange }))}
              />
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg px-3 py-1">
              {filteredParts.length} Results
            </Badge>
            <span className="text-sm text-muted-foreground">
              Total Value: ${filteredParts.reduce((sum, part) => sum + (part.customer_price * part.quantity), 0).toFixed(2)}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 border rounded">
            <div className="text-lg font-bold">{filteredParts.filter(p => p.status === 'installed').length}</div>
            <div className="text-xs text-muted-foreground">Installed</div>
          </div>
          <div className="text-center p-3 border rounded">
            <div className="text-lg font-bold">{filteredParts.filter(p => p.status === 'ordered').length}</div>
            <div className="text-xs text-muted-foreground">Ordered</div>
          </div>
          <div className="text-center p-3 border rounded">
            <div className="text-lg font-bold">{filteredParts.filter(p => p.status === 'defective').length}</div>
            <div className="text-xs text-muted-foreground">Defective</div>
          </div>
          <div className="text-center p-3 border rounded">
            <div className="text-lg font-bold">{filteredParts.filter(p => p.is_taxable).length}</div>
            <div className="text-xs text-muted-foreground">Taxable</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
