
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { EditableJobLineCard } from './EditableJobLineCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import { Clock, DollarSign, Plus, Wrench, Package } from 'lucide-react';
import { AddJobLineDialog } from './AddJobLineDialog';
import { toast } from 'sonner';

interface EditableJobLinesGridProps {
  jobLines: WorkOrderJobLine[];
  onUpdateJobLine: (updatedJobLine: WorkOrderJobLine) => void;
  onDeleteJobLine: (jobLineId: string) => void;
  onAddJobLine: (newJobLine: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  showSummary?: boolean;
  workOrderId: string;
  shopId?: string;
}

export function EditableJobLinesGrid({ 
  jobLines, 
  onUpdateJobLine, 
  onDeleteJobLine, 
  onAddJobLine,
  showSummary = true,
  workOrderId,
  shopId 
}: EditableJobLinesGridProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const totalHours = jobLines.reduce((sum, line) => sum + (line.estimatedHours || 0), 0);
  const totalAmount = jobLines.reduce((sum, line) => sum + (line.totalAmount || 0), 0);

  const handleAddPartsLine = () => {
    // Create a parts-specific job line
    const partsJobLine: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'> = {
      workOrderId,
      name: 'Parts & Materials',
      category: 'Parts',
      description: 'Parts and materials for this work order',
      estimatedHours: 0,
      laborRate: 0,
      totalAmount: 0,
      status: 'pending'
    };
    
    onAddJobLine(partsJobLine);
    toast.success('Parts line added successfully');
  };

  if (jobLines.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Job Lines Found</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Job lines will be automatically parsed from the work order description, or you can add them manually.
          </p>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Job Line
            </Button>
            <Button onClick={handleAddPartsLine} variant="outline" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Add Parts Line
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Service Details</h3>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            {jobLines.length} service{jobLines.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setShowAddDialog(true)} 
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Job Line
            </Button>
            <Button 
              onClick={handleAddPartsLine}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              Add Parts Line
            </Button>
          </div>
        </div>
      </div>

      <ResponsiveGrid
        cols={{ default: 1, md: 2, lg: 3 }}
        gap="md"
      >
        {jobLines.map((jobLine) => (
          <EditableJobLineCard 
            key={jobLine.id} 
            jobLine={jobLine} 
            onUpdate={onUpdateJobLine}
            onDelete={onDeleteJobLine}
            shopId={shopId}
          />
        ))}
      </ResponsiveGrid>

      {showSummary && (totalHours > 0 || totalAmount > 0) && (
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Labor Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-sm text-muted-foreground">Total Labor Time</div>
                  <div className="font-semibold">{totalHours.toFixed(1)} hours</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-sm text-muted-foreground">Total Labor Cost</div>
                  <div className="font-semibold">${totalAmount.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <AddJobLineDialog
        workOrderId={workOrderId}
        onJobLineAdd={onAddJobLine}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
}
