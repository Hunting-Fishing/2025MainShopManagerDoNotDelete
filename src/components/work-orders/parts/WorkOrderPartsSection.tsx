
import React from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { UnifiedItemsTable } from '../shared/UnifiedItemsTable';

interface WorkOrderPartsSectionProps {
  workOrderId: string;
  allParts: WorkOrderPart[];
  jobLines: WorkOrderJobLine[];
  onPartsChange: () => void;
  isEditMode: boolean;
  showType: "all" | "joblines" | "parts";
}

export function WorkOrderPartsSection({
  workOrderId,
  allParts,
  jobLines,
  onPartsChange,
  isEditMode,
  showType
}: WorkOrderPartsSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Parts</CardTitle>
          {isEditMode && (
            <Button size="sm" className="h-8 px-3">
              <Plus className="h-4 w-4 mr-2" />
              Add Part
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <UnifiedItemsTable
          jobLines={jobLines}
          allParts={allParts}
          isEditMode={isEditMode}
          showType={showType}
        />
      </CardContent>
    </Card>
  );
}
