
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Search, Filter, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart } from '@/types/workOrderPart';

export function PartsInventoryOverview() {
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [filteredParts, setFilteredParts] = useState<WorkOrderPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    loadParts();
  }, []);

  useEffect(() => {
    filterParts();
  }, [parts, searchQuery, statusFilter, categoryFilter]);

  const loadParts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('work_order_parts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setParts(data || []);
    } catch (error) {
      console.error('Error loading parts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterParts = () => {
    let filtered = parts;

    if (searchQuery) {
      filtered = filtered.filter(part =>
        part.part_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.part_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.supplier_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(part => part.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(part => part.category === categoryFilter);
    }

    setFilteredParts(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'installed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'ordered': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'received': return <Package className="h-4 w-4 text-purple-600" />;
      case 'backordered': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'defective': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'returned': return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'installed': 'bg-green-100 text-green-800',
      'ordered': 'bg-blue-100 text-blue-800',
      'received': 'bg-purple-100 text-purple-800',
      'backordered': 'bg-yellow-100 text-yellow-800',
      'defective': 'bg-red-100 text-red-800',
      'returned': 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const uniqueCategories = [...new Set(parts.map(p => p.category).filter(Boolean))];
  const uniqueStatuses = [...new Set(parts.map(p => p.status))];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Parts Inventory Overview
          </CardTitle>
          <CardDescription>
            Comprehensive view of all parts across work orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search parts, numbers, suppliers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category || ''}>
                    {category || 'Uncategorized'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results Summary */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredParts.length} of {parts.length} parts
            </p>
          </div>

          {/* Parts List */}
          <div className="space-y-2">
            {filteredParts.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <Package className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No parts found matching your criteria</p>
              </div>
            ) : (
              filteredParts.map((part) => (
                <div key={part.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(part.status)}
                        <h3 className="font-medium">{part.part_name}</h3>
                        {getStatusBadge(part.status)}
                        {part.category && (
                          <Badge variant="outline">{part.category}</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Part #:</span> {part.part_number || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Supplier:</span> {part.supplier_name || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Quantity:</span> {part.quantity}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Cost:</span> ${part.supplier_cost.toFixed(2)}
                        </div>
                        <div>
                          <span className="font-medium">Customer Price:</span> ${part.customer_price.toFixed(2)}
                        </div>
                        <div>
                          <span className="font-medium">Total:</span> ${(part.customer_price * part.quantity).toFixed(2)}
                        </div>
                      </div>

                      {part.warranty_duration && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Warranty:</span> {part.warranty_duration}
                        </div>
                      )}

                      {part.bin_location && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Location:</span> {part.bin_location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
