
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Package, Wrench } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { JobLineEditDialog } from './JobLineEditDialog';
import { JobLinePartsDisplay } from '../parts/JobLinePartsDisplay';
import { AddPartsDialog } from '../parts/AddPartsDialog';
import { getJobLineParts } from '@/services/workOrder/workOrderPartsService';
import { toast } from 'sonner';

interface JobLinesGridProps {
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode?: boolean;
}

interface JobLineWithParts extends WorkOrderJobLine {
  parts: WorkOrderPart[];
}

export function JobLinesGrid({
  workOrderId,
  jobLines,
  onJobLinesChange,
  isEditMode = false
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

  const handleRemoveJobLine = (jobLineId: string) => {
    const updatedJobLines = jobLines.filter(jl => jl.id !== jobLineId);
    onJobLinesChange(updatedJobLines);
  };

  // Calculate totals
  const totalJobLines = jobLinesWithParts.length;
  const totalLaborAmount = jobLinesWithParts.reduce((sum, jl) => sum + (jl.totalAmount || 0), 0);
  
  const allParts = jobLinesWithParts.flatMap(jl => jl.parts);
  const totalPartsCount = allParts.length;
  const totalPartsCost = allParts.reduce((sum, part) => sum + (part.supplierCost * part.quantity), 0);
  const totalPartsSellPrice = allParts.reduce((sum, part) => sum + (part.customerPrice * part.quantity), 0);
  const totalPartsMargin = totalPartsSellPrice - totalPartsCost;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">Loading job lines and parts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
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
              <Package className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground"># of Parts</p>
                <p className="text-2xl font-bold">{totalPartsCount}</p>
                <p className="text-sm text-muted-foreground">Across all job lines</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Parts Cost</p>
              <p className="text-2xl font-bold text-red-600">${totalPartsCost.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Total supplier cost</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Parts Sell Price</p>
              <p className="text-2xl font-bold text-green-600">${totalPartsSellPrice.toFixed(2)}</p>
              <p className="text-sm text-green-600">Margin: ${totalPartsMargin.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Lines */}
      <div className="space-y-4">
        {jobLinesWithParts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Job Lines Yet</h3>
              <p className="text-muted-foreground mb-4">
                Add job lines to organize the work and services for this work order.
              </p>
            </CardContent>
          </Card>
        ) : (
          jobLinesWithParts.map((jobLine) => (
            <Card key={jobLine.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wrench className="h-5 w-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{jobLine.name}</CardTitle>
                      {jobLine.category && (
                        <p className="text-sm text-muted-foreground">{jobLine.category}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {jobLine.status || 'pending'}
                    </Badge>
                    {isEditMode && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAddingPartsToJobLine(jobLine.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Parts
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingJobLine(jobLine)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveJobLine(jobLine.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {jobLine.description && (
                  <p className="text-muted-foreground mb-4">{jobLine.description}</p>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Hours</p>
                    <p className="font-medium">{jobLine.estimatedHours || 0} hrs</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Labor Rate</p>
                    <p className="font-medium">${(jobLine.laborRate || 0).toFixed(2)}/hr</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Labor Total</p>
                    <p className="font-medium text-green-600">${(jobLine.totalAmount || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Parts</p>
                    <p className="font-medium">{jobLine.parts.length} items</p>
                  </div>
                </div>

                {/* Parts Display */}
                <JobLinePartsDisplay
                  parts={jobLine.parts}
                  isEditMode={isEditMode}
                  onRemovePart={() => loadJobLinesWithParts()}
                />

                {jobLine.notes && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm">{jobLine.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      {editingJobLine && (
        <JobLineEditDialog
          jobLine={editingJobLine}
          open={!!editingJobLine}
          onOpenChange={(open) => !open && setEditingJobLine(null)}
          onSave={(updatedJobLine) => {
            const updatedJobLines = jobLines.map(jl =>
              jl.id === updatedJobLine.id ? updatedJobLine : jl
            );
            onJobLinesChange(updatedJobLines);
            setEditingJobLine(null);
          }}
        />
      )}

      {/* Add Parts Dialog */}
      {addingPartsToJobLine && (
        <AddPartsDialog
          workOrderId={workOrderId}
          jobLineId={addingPartsToJobLine}
          open={!!addingPartsToJobLine}
          onOpenChange={(open) => !open && setAddingPartsToJobLine(null)}
          onPartsAdd={handlePartsAdded}
        />
      )}
    </div>
  );
}
