
import React, { useState, useEffect } from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { CompactPartsTable } from './CompactPartsTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';

interface WorkOrderPartsSectionProps {
  workOrderId: string;
  isEditMode: boolean;
}

export function WorkOrderPartsSection({ workOrderId, isEditMode }: WorkOrderPartsSectionProps) {
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchParts = async () => {
      if (workOrderId) {
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
      }
    };

    fetchParts();
  }, [workOrderId]);

  const handlePartUpdate = (updatedPart: WorkOrderPart) => {
    const updatedParts = parts.map(part => 
      part.id === updatedPart.id ? updatedPart : part
    );
    setParts(updatedParts);
  };

  const handlePartDelete = (partId: string) => {
    const updatedParts = parts.filter(part => part.id !== partId);
    setParts(updatedParts);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Parts Inventory</CardTitle>
          {isEditMode && (
            <Button variant="outline" size="sm">
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
          <CompactPartsTable
            parts={parts}
            onUpdate={handlePartUpdate}
            onDelete={handlePartDelete}
            isEditMode={isEditMode}
          />
        )}
      </CardContent>
    </Card>
  );
}
