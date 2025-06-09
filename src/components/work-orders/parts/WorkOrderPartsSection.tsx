
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, Search, Filter, RotateCcw } from 'lucide-react';
import { WorkOrderPart, PART_CATEGORIES, PART_STATUSES, partStatusMap } from '@/types/workOrderPart';
import { getWorkOrderParts, deleteWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { AddPartsDialog } from './AddPartsDialog';
import { EnhancedPartCard } from './EnhancedPartCard';
import { toast } from 'sonner';

interface WorkOrderPartsSectionProps {
  workOrderId: string;
  isEditMode?: boolean;
}

export function WorkOrderPartsSection({
  workOrderId,
  isEditMode = false
}: WorkOrderPartsSectionProps) {
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  useEffect(() => {
    loadParts();
  }, [workOrderId]);

  const loadParts = async () => {
    try {
      setLoading(true);
      const partsData = await getWorkOrderParts(workOrderId);
      setParts(partsData);
    } catch (error) {
      console.error('Error loading parts:', error);
      toast.error('Failed to load parts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePart = async (partId: string) => {
    if (!confirm('Are you sure you want to delete this part?')) {
      return;
    }

    try {
      await deleteWorkOrderPart(partId);
      setParts(prev => prev.filter(p => p.id !== partId));
      toast.success('Part deleted successfully');
    } catch (error) {
      console.error('Error deleting part:', error);
      toast.error('Failed to delete part');
    }
  };

  const handlePartsAdded = () => {
    loadParts();
    setAddDialogOpen(false);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
  };

  // Filter parts based on search and filters
  const filteredParts = parts.filter(part => {
    const matchesSearch = !searchTerm || 
      part.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || part.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || part.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate totals
  const totalParts = filteredParts.length;
  const totalValue = filteredParts.reduce((sum, part) => {
    const partTotal = part.customerPrice * part.quantity;
    const coreChargeTotal = part.coreChargeApplied ? part.coreChargeAmount * part.quantity : 0;
    return sum + partTotal + coreChargeTotal;
  }, 0);

  const taxableValue = filteredParts.reduce((sum, part) => {
    if (!part.isTaxable) return sum;
    const partTotal = part.customerPrice * part.quantity;
    return sum + partTotal;
  }, 0);

  const coreChargeTotal = filteredParts.reduce((sum, part) => {
    return sum + (part.coreChargeApplied ? part.coreChargeAmount * part.quantity : 0);
  }, 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Parts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Package className="h-8 w-8 animate-pulse mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Loading parts...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Package className="h-5 w-5" />
            Parts ({totalParts})
          </h3>
          <p className="text-sm text-muted-foreground">
            Total Value: ${totalValue.toFixed(2)}
            {coreChargeTotal > 0 && (
              <span className="ml-2">(includes ${coreChargeTotal.toFixed(2)} core charges)</span>
            )}
          </p>
        </div>
        
        {isEditMode && (
          <AddPartsDialog
            workOrderId={workOrderId}
            onPartsAdd={handlePartsAdded}
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
          />
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search parts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="min-w-32">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
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
            </div>
            
            <div className="min-w-32">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {PART_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      <Badge className={partStatusMap[status].classes}>
                        {partStatusMap[status].label}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') && (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {totalParts > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Total Parts</div>
              <div className="text-2xl font-bold">{totalParts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Total Value</div>
              <div className="text-2xl font-bold text-green-600">${totalValue.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Taxable Value</div>
              <div className="text-2xl font-bold">${taxableValue.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Core Charges</div>
              <div className="text-2xl font-bold text-orange-600">${coreChargeTotal.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Parts List */}
      <div className="space-y-4">
        {filteredParts.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Parts Found</h3>
                <p className="text-muted-foreground mb-4">
                  {parts.length === 0 
                    ? "No parts have been added to this work order yet."
                    : "No parts match your current filters."
                  }
                </p>
                {isEditMode && parts.length === 0 && (
                  <Button onClick={() => setAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Part
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredParts.map((part) => (
            <EnhancedPartCard
              key={part.id}
              part={part}
              onDelete={handleDeletePart}
              isEditMode={isEditMode}
            />
          ))
        )}
      </div>
    </div>
  );
}
