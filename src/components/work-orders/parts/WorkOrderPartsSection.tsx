
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WorkOrderPart } from '@/types/workOrderPart';
import { getWorkOrderParts, transformPartData } from '@/services/workOrder/workOrderPartsService';
import { PartsInventorySummary } from './PartsInventorySummary';
import { PartDetailsCard } from './PartDetailsCard';
import { Plus, Package } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchParts();
  }, [workOrderId]);

  const fetchParts = async () => {
    try {
      setIsLoading(true);
      const rawPartsData = await getWorkOrderParts(workOrderId);
      // Transform the raw data to ensure proper mapping
      const transformedParts = rawPartsData.map(transformPartData);
      setParts(transformedParts);
    } catch (error) {
      console.error('Error fetching work order parts:', error);
      toast.error('Failed to load parts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePart = (partId: string) => {
    setParts(prev => prev.filter(p => p.id !== partId));
  };

  const handleUpdatePart = (updatedPart: WorkOrderPart) => {
    setParts(prev => prev.map(p => p.id === updatedPart.id ? updatedPart : p));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">Loading parts...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Parts Summary */}
      {parts.length > 0 && <PartsInventorySummary parts={parts} />}

      {/* Parts List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Parts Inventory ({parts.length})
            </CardTitle>
            {isEditMode && (
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Part
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {parts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Parts</h3>
              <p className="text-muted-foreground mb-4">
                No parts have been added to this work order yet.
              </p>
              {isEditMode && (
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Part
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {parts.map((part) => (
                <PartDetailsCard
                  key={part.id}
                  part={part}
                  onRemove={handleRemovePart}
                  onUpdate={handleUpdatePart}
                  isEditMode={isEditMode}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
