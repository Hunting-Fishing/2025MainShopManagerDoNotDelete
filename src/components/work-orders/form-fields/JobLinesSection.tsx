
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Plus, Wrench } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { JobLinesGrid } from '../job-lines/JobLinesGrid';
import { AddJobLineDialog } from '../job-lines/AddJobLineDialog';
import { WorkOrderJobLine } from '@/types/jobLine';
import { loadJobLinesFromDatabase, saveJobLinesToDatabase, parseJobLinesFromDescription } from '@/services/jobLineParserEnhanced';

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
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load job lines from database on mount
  useEffect(() => {
    const loadJobLines = async () => {
      if (hasLoaded) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Loading job lines for work order:', workOrderId);
        const loadedJobLines = await loadJobLinesFromDatabase(workOrderId);
        console.log('Loaded job lines:', loadedJobLines);
        
        if (loadedJobLines.length > 0) {
          // Job lines exist in database, use them
          const jobLinesWithParts = loadedJobLines.map(jobLine => ({
            ...jobLine,
            parts: jobLine.parts?.map(part => ({
              ...part,
              // Ensure all enhanced fields are present with defaults
              isTaxable: part.isTaxable ?? true,
              coreChargeAmount: part.coreChargeAmount ?? 0,
              coreChargeApplied: part.coreChargeApplied ?? false,
              status: part.status ?? 'ordered',
              isStockItem: part.isStockItem ?? false,
              dateAdded: part.dateAdded ?? new Date().toISOString().split('T')[0],
              attachments: part.attachments ?? [],
              warrantyDuration: part.warrantyDuration,
              warrantyExpiryDate: part.warrantyExpiryDate,
              installDate: part.installDate,
              installedBy: part.installedBy,
              notesInternal: part.notesInternal,
              category: part.category
            })) || []
          }));
          
          onJobLinesChange(jobLinesWithParts);
        } else if (description?.trim()) {
          // No job lines in database, parse from description
          console.log('No job lines found, parsing from description:', description);
          const parsedJobLines = parseJobLinesFromDescription(description);
          console.log('Parsed job lines:', parsedJobLines);
          
          if (parsedJobLines.length > 0) {
            // Save parsed job lines to database
            const jobLinesToSave = parsedJobLines.map(jobLine => ({
              ...jobLine,
              workOrderId,
              parts: []
            }));
            
            await saveJobLinesToDatabase(workOrderId, jobLinesToSave);
            onJobLinesChange(jobLinesToSave);
          }
        }
        
        setHasLoaded(true);
      } catch (error) {
        console.error('Error loading job lines:', error);
        setError(error instanceof Error ? error.message : 'Failed to load job lines');
      } finally {
        setIsLoading(false);
      }
    };

    if (workOrderId && workOrderId !== `temp-${Date.now()}`) {
      loadJobLines();
    }
  }, [workOrderId, description, hasLoaded, onJobLinesChange]);

  // Handle job line updates
  const handleJobLineUpdate = async (updatedJobLine: WorkOrderJobLine) => {
    const updatedJobLines = jobLines.map(jobLine =>
      jobLine.id === updatedJobLine.id ? updatedJobLine : jobLine
    );
    
    onJobLinesChange(updatedJobLines);
    
    // Save to database if not a temp work order
    if (workOrderId && !workOrderId.startsWith('temp-')) {
      try {
        await saveJobLinesToDatabase(workOrderId, updatedJobLines);
      } catch (error) {
        console.error('Error saving job line update:', error);
        setError('Failed to save job line changes');
      }
    }
  };

  // Handle job line deletion
  const handleJobLineDelete = async (jobLineId: string) => {
    const updatedJobLines = jobLines.filter(jobLine => jobLine.id !== jobLineId);
    onJobLinesChange(updatedJobLines);
    
    // Save to database if not a temp work order
    if (workOrderId && !workOrderId.startsWith('temp-')) {
      try {
        await saveJobLinesToDatabase(workOrderId, updatedJobLines);
      } catch (error) {
        console.error('Error saving job line deletion:', error);
        setError('Failed to delete job line');
      }
    }
  };

  // Handle adding new job lines
  const handleJobLineAdd = async (newJobLines: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    const jobLinesToAdd: WorkOrderJobLine[] = newJobLines.map(jobLine => ({
      ...jobLine,
      id: crypto.randomUUID(),
      workOrderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parts: []
    }));

    const updatedJobLines = [...jobLines, ...jobLinesToAdd];
    onJobLinesChange(updatedJobLines);

    // Save to database if not a temp work order
    if (workOrderId && !workOrderId.startsWith('temp-')) {
      try {
        await saveJobLinesToDatabase(workOrderId, updatedJobLines);
      } catch (error) {
        console.error('Error saving new job lines:', error);
        setError('Failed to save new job lines');
      }
    }
  };

  // Handle parts refresh
  const handlePartsRefresh = () => {
    // Force a refresh of the job lines to get updated parts
    if (workOrderId && !workOrderId.startsWith('temp-')) {
      setHasLoaded(false);
    }
  };

  const totalJobLines = jobLines.length;
  const totalEstimatedHours = jobLines.reduce((sum, jobLine) => sum + (jobLine.estimatedHours || 0), 0);
  const totalAmount = jobLines.reduce((sum, jobLine) => {
    const laborAmount = jobLine.totalAmount || 0;
    const partsAmount = jobLine.parts?.reduce((partSum, part) => 
      partSum + (part.customerPrice * part.quantity), 0) || 0;
    return sum + laborAmount + partsAmount;
  }, 0);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Labor & Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Labor & Services
            {totalJobLines > 0 && (
              <Badge variant="secondary">{totalJobLines} item{totalJobLines !== 1 ? 's' : ''}</Badge>
            )}
          </CardTitle>
          {isEditMode && (
            <Button
              size="sm"
              onClick={() => setAddDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Services
            </Button>
          )}
        </div>
        
        {totalJobLines > 0 && (
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Estimated Hours: {totalEstimatedHours.toFixed(1)}</span>
            <span>Total Amount: ${totalAmount.toFixed(2)}</span>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <JobLinesGrid
          jobLines={jobLines}
          onUpdate={handleJobLineUpdate}
          onDelete={handleJobLineDelete}
          onPartsRefresh={handlePartsRefresh}
          isEditMode={isEditMode}
          isLoading={isLoading}
        />
      </CardContent>

      <AddJobLineDialog
        workOrderId={workOrderId}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onJobLineAdd={handleJobLineAdd}
      />
    </Card>
  );
}
