
import React from 'react';
import { TimeEntry } from '@/types/workOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { UnifiedItemsTable } from '../shared/UnifiedItemsTable';

interface TimeTrackingSectionProps {
  workOrderId: string;
  timeEntries: TimeEntry[];
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
  isEditMode?: boolean;
}

export function TimeTrackingSection({
  workOrderId,
  timeEntries,
  onUpdateTimeEntries,
  isEditMode = false
}: TimeTrackingSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Time Tracking</CardTitle>
          {isEditMode && (
            <Button size="sm" className="h-8 px-3">
              <Plus className="h-4 w-4 mr-2" />
              Add Time Entry
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <UnifiedItemsTable
          jobLines={[]}
          allParts={[]}
          isEditMode={isEditMode}
          showType="detailed"
        />
      </CardContent>
    </Card>
  );
}
