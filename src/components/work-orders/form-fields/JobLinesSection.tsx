
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Wrench, Loader2 } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { AddJobLineDialog } from '../job-lines/AddJobLineDialog';
import { JobLinesGrid } from '../job-lines/JobLinesGrid';
import { parseWorkOrderDescription } from '@/services/workOrder/jobLineParser';

interface JobLinesSectionProps {
  workOrderId: string;
  description: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  shopId?: string;
  isEditMode?: boolean;
}

export function JobLinesSection({
  workOrderId,
  description,
  jobLines,
  onJobLinesChange,
  shopId,
  isEditMode = false
}: JobLinesSectionProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [hasAutoCreated, setHasAutoCreated] = useState(false);

  // Auto-create job lines from description when description changes
  useEffect(() => {
    if (description && description.trim() && jobLines.length === 0 && !hasAutoCreated) {
      handleAutoCreateJobLines();
    }
  }, [description, jobLines.length, hasAutoCreated]);

  const handleAutoCreateJobLines = async () => {
    if (!description?.trim()) return;
    
    setIsParsing(true);
    try {
      const parsedJobLines = await parseWorkOrderDescription(description, workOrderId, shopId);
      
      // Ensure all parts have the enhanced fields with proper defaults
      const enhancedJobLines = parsedJobLines.map(jobLine => ({
        ...jobLine,
        parts: (jobLine.parts || []).map(part => createEnhancedPart(part))
      }));
      
      onJobLinesChange(enhancedJobLines);
      setHasAutoCreated(true);
    } catch (error) {
      console.error('Error parsing job lines:', error);
    } finally {
      setIsParsing(false);
    }
  };

  const createEnhancedPart = (part: Partial<WorkOrderPart>): WorkOrderPart => {
    return {
      id: part.id || `temp-${Date.now()}-${Math.random()}`,
      workOrderId: part.workOrderId || workOrderId,
      jobLineId: part.jobLineId || '',
      inventoryItemId: part.inventoryItemId,
      partName: part.partName || '',
      partNumber: part.partNumber,
      supplierName: part.supplierName || '',
      supplierCost: part.supplierCost || 0,
      markupPercentage: part.markupPercentage || 0,
      retailPrice: part.retailPrice || 0,
      customerPrice: part.customerPrice || 0,
      quantity: part.quantity || 1,
      partType: part.partType || 'non-inventory',
      invoiceNumber: part.invoiceNumber,
      poLine: part.poLine,
      notes: part.notes,
      createdAt: part.createdAt || new Date().toISOString(),
      updatedAt: part.updatedAt || new Date().toISOString(),
      // Enhanced fields with defaults
      category: part.category,
      isTaxable: part.isTaxable ?? true,
      coreChargeAmount: part.coreChargeAmount || 0,
      coreChargeApplied: part.coreChargeApplied || false,
      warrantyDuration: part.warrantyDuration,
      warrantyExpiryDate: part.warrantyExpiryDate,
      installDate: part.installDate,
      installedBy: part.installedBy,
      status: part.status || 'ordered',
      isStockItem: part.isStockItem ?? true,
      dateAdded: part.dateAdded || new Date().toISOString(),
      attachments: part.attachments || [],
      notesInternal: part.notesInternal
    };
  };

  const handleAddJobLine = (newJobLine: WorkOrderJobLine) => {
    const enhancedJobLine = {
      ...newJobLine,
      parts: (newJobLine.parts || []).map(part => createEnhancedPart(part))
    };
    onJobLinesChange([...jobLines, enhancedJobLine]);
    setShowAddDialog(false);
  };

  const handleUpdateJobLine = (updatedJobLine: WorkOrderJobLine) => {
    const enhancedJobLine = {
      ...updatedJobLine,
      parts: (updatedJobLine.parts || []).map(part => createEnhancedPart(part))
    };
    onJobLinesChange(jobLines.map(line => 
      line.id === updatedJobLine.id ? enhancedJobLine : line
    ));
  };

  const handleDeleteJobLine = (jobLineId: string) => {
    onJobLinesChange(jobLines.filter(line => line.id !== jobLineId));
  };

  const handleRefreshJobLines = () => {
    setHasAutoCreated(false);
    handleAutoCreateJobLines();
  };

  const totalEstimatedHours = jobLines.reduce((sum, line) => sum + (line.estimatedHours || 0), 0);
  const totalLaborCost = jobLines.reduce((sum, line) => sum + (line.totalAmount || 0), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Labor & Services
            </CardTitle>
            {jobLines.length > 0 && (
              <Badge variant="secondary">
                {jobLines.length} service{jobLines.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {description && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshJobLines}
                disabled={isParsing}
              >
                {isParsing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Parsing...
                  </>
                ) : (
                  'Refresh from Description'
                )}
              </Button>
            )}
            
            {isEditMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            )}
          </div>
        </div>
        
        {totalEstimatedHours > 0 && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Total Hours: {totalEstimatedHours.toFixed(1)}</span>
            <span>Total Labor: ${totalLaborCost.toFixed(2)}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {isParsing ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Analyzing work order description...</span>
          </div>
        ) : (
          <JobLinesGrid
            jobLines={jobLines}
            onUpdate={handleUpdateJobLine}
            onDelete={handleDeleteJobLine}
            isEditMode={isEditMode}
          />
        )}
      </CardContent>
      
      {showAddDialog && (
        <AddJobLineDialog
          workOrderId={workOrderId}
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSave={handleAddJobLine}
        />
      )}
    </Card>
  );
}
