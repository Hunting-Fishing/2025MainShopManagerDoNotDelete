
import React, { useState, useEffect } from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getWorkOrderParts } from '@/services/workOrder/workOrderUnifiedService';
import { UnifiedItemsTable } from '../shared/UnifiedItemsTable';

interface WorkOrderPartsSectionProps {
  workOrderId: string;
  isEditMode?: boolean;
  onPartUpdate?: (updatedPart: WorkOrderPart) => Promise<void>;
  onPartDelete?: (partId: string) => Promise<void>;
}

export function WorkOrderPartsSection({ 
  workOrderId, 
  isEditMode = false,
  onPartUpdate,
  onPartDelete
}: WorkOrderPartsSectionProps) {
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchParts = async () => {
      if (!workOrderId) return;
      
      try {
        setIsLoading(true);
        const partsData = await getWorkOrderParts(workOrderId);
        setParts(partsData);
      } catch (error) {
        console.error('Error fetching work order parts:', error);
        setParts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParts();
  }, [workOrderId]);

  const handlePartUpdate = async (updatedPart: WorkOrderPart) => {
    if (onPartUpdate) {
      await onPartUpdate(updatedPart);
    } else {
      const updatedParts = parts.map(part => 
        part.id === updatedPart.id ? updatedPart : part
      );
      setParts(updatedParts);
    }
  };

  const handlePartDelete = async (partId: string) => {
    if (onPartDelete) {
      await onPartDelete(partId);
    } else {
      const updatedParts = parts.filter(part => part.id !== partId);
      setParts(updatedParts);
    }
  };

  const handlePartsReorder = (reorderedParts: WorkOrderPart[]) => {
    setParts(reorderedParts);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Parts & Inventory</CardTitle>
          {isEditMode && (
            <Button size="sm" className="h-8 px-3">
              <Plus className="h-4 w-4 mr-2" />
              Add Part
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Loading parts...
          </div>
        ) : (
          <UnifiedItemsTable
            jobLines={[]}
            allParts={parts}
            onPartUpdate={handlePartUpdate}
            onPartDelete={handlePartDelete}
            onReorderParts={handlePartsReorder}
            isEditMode={isEditMode}
            showType="parts"
          />
        )}
      </CardContent>
    </Card>
  );
}
