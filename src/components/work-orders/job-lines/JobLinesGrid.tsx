
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Package, Wrench } from 'lucide-react';
import { JobLineEditDialog } from './JobLineEditDialog';
import { JobLinePartsDisplay } from '../parts/JobLinePartsDisplay';
import { AddPartsDialog } from '../parts/AddPartsDialog';
import { getJobLineParts } from '@/services/workOrder/workOrderPartsService';
import { toast } from 'sonner';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';

export interface JobLinesGridProps {
  workOrderId?: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange?: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode?: boolean;
  showSummary?: boolean;
  onUpdate?: (updatedJobLine: WorkOrderJobLine) => Promise<void>;
  onDelete?: (jobLineId: string) => Promise<void>;
}

interface JobLineWithParts extends WorkOrderJobLine {
  parts: WorkOrderPart[];
}

export function JobLinesGrid({ 
  workOrderId, 
  jobLines, 
  onJobLinesChange, 
  isEditMode = false,
  showSummary = false,
  onUpdate,
  onDelete
}: JobLinesGridProps) {
  const [jobLinesWithParts, setJobLinesWithParts] = useState<JobLineWithParts[]>([]);
  const [editingJobLine, setEditingJobLine] = useState<WorkOrderJobLine | null>(null);
  const [addingPartsToJobLine, setAddingPartsToJobLine] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobLinesWithParts();
  }, [jobLines]);

  const loadJobLinesWithParts = async () => {
    setLoading(true);
    try {
      const jobLinesWithPartsData: JobLineWithParts[] = [];
      
      for (const jobLine of jobLines) {
        try {
          const parts = await getJobLineParts(jobLine.id);
          jobLinesWithPartsData.push({
            ...jobLine,
            parts: parts || []
          });
        } catch (error) {
          console.error(`Error loading parts for job line ${jobLine.id}:`, error);
          // Continue with empty parts array if there's an error
          jobLinesWithPartsData.push({
            ...jobLine,
            parts: []
          });
        }
      }
      
      setJobLinesWithParts(jobLinesWithPartsData);
    } catch (error) {
      console.error('Error loading job lines with parts:', error);
      toast.error('Failed to load parts data');
    } finally {
      setLoading(false);
    }
  };

  const handlePartsAdded = () => {
    loadJobLinesWithParts();
    setAddingPartsToJobLine(null);
  };

  const handleEditJobLine = (updatedJobLine: WorkOrderJobLine) => {
    if (onUpdate) {
      onUpdate(updatedJobLine);
    } else if (onJobLinesChange) {
      const updatedJobLines = jobLines.map(jl => 
        jl.id === updatedJobLine.id ? updatedJobLine : jl
      );
      onJobLinesChange(updatedJobLines);
    }
    setEditingJobLine(null);
  };

  const handleRemoveJobLine = async (jobLineId: string) => {
    if (onDelete) {
      await onDelete(jobLineId);
    } else if (onJobLinesChange) {
      const updatedJobLines = jobLines.filter(jl => jl.id !== jobLineId);
      onJobLinesChange(updatedJobLines);
    }
  };

  // Calculate totals
  const totalJobLines = jobLinesWithParts.length;
  const totalLaborAmount = jobLinesWithParts.reduce((sum, jl) => sum + (jl.totalAmount || 0), 0);
  const allParts = jobLinesWithParts.flatMap(jl => jl.parts);
  const totalPartsCount = allParts.length;
  const totalPartsCost = allParts.reduce((sum, part) => sum + (part.supplierCost || 0) * part.quantity, 0);
  const totalPartsSellPrice = allParts.reduce((sum, part) => sum + part.customerPrice * part.quantity, 0);
  const totalPartsMargin = totalPartsSellPrice - totalPartsCost;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          Loading job lines and parts...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Job Lines</p>
                  <p className="text-2xl font-bold">{totalJobLines}</p>
                  <p className="text-sm text-green-600">Labor: ${totalLaborAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Parts</p>
                  <p className="text-2xl font-bold">{totalPartsCount}</p>
                  <p className="text-sm text-blue-600">Cost: ${totalPartsCost.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Sell Price</p>
                  <p className="text-2xl font-bold">${totalPartsSellPrice.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Parts Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Margin</p>
                  <p className="text-2xl font-bold">${totalPartsMargin.toFixed(2)}</p>
                  <p className="text-sm text-orange-600">
                    {totalPartsCost > 0 ? `${((totalPartsMargin / totalPartsCost) * 100).toFixed(1)}%` : '0%'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        {jobLinesWithParts.map((jobLine) => (
          <Card key={jobLine.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{jobLine.name}</CardTitle>
                  {jobLine.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {jobLine.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {jobLine.status}
                  </Badge>
                  
                  {isEditMode && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingJobLine(jobLine)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveJobLine(jobLine.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <div className="flex gap-4 text-sm">
                  {jobLine.estimatedHours && (
                    <span>Est. Hours: {jobLine.estimatedHours}</span>
                  )}
                  {jobLine.laborRate && (
                    <span>Rate: ${jobLine.laborRate}/hr</span>
                  )}
                  {jobLine.totalAmount && (
                    <span className="font-medium text-green-600">
                      Total: ${jobLine.totalAmount.toFixed(2)}
                    </span>
                  )}
                </div>
                
                {isEditMode && workOrderId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddingPartsToJobLine(jobLine.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Parts
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <JobLinePartsDisplay
                parts={jobLine.parts}
                isEditMode={isEditMode}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {jobLinesWithParts.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
          <p className="text-slate-500">No job lines added yet</p>
          <p className="text-sm text-slate-400">Add job lines to get started</p>
        </div>
      )}

      <JobLineEditDialog
        jobLine={editingJobLine}
        open={!!editingJobLine}
        onOpenChange={() => setEditingJobLine(null)}
        onSave={handleEditJobLine}
      />

      {addingPartsToJobLine && workOrderId && (
        <AddPartsDialog
          open={!!addingPartsToJobLine}
          onOpenChange={() => setAddingPartsToJobLine(null)}
          workOrderId={workOrderId}
          jobLineId={addingPartsToJobLine}
          onPartsAdded={handlePartsAdded}
        />
      )}
    </div>
  );
}
