
import React, { useState, useEffect } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Upload } from 'lucide-react';
import { CompactJobLinesTable } from '../job-lines/CompactJobLinesTable';
import { getWorkOrderJobLines } from '@/services/workOrder/jobLinesService';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';

interface WorkOrderDocumentsProps {
  workOrderId: string;
  isEditMode?: boolean;
}

export function WorkOrderDocuments({ 
  workOrderId, 
  isEditMode = false 
}: WorkOrderDocumentsProps) {
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [allParts, setAllParts] = useState<WorkOrderPart[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!workOrderId) return;
      
      try {
        setIsLoading(true);
        const [lines, parts] = await Promise.all([
          getWorkOrderJobLines(workOrderId),
          getWorkOrderParts(workOrderId)
        ]);
        setJobLines(lines);
        setAllParts(parts);
      } catch (error) {
        console.error('Error fetching job lines and parts:', error);
        setJobLines([]);
        setAllParts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [workOrderId]);

  const handleJobLineUpdate = (updatedJobLine: WorkOrderJobLine) => {
    const updatedJobLines = jobLines.map(line => 
      line.id === updatedJobLine.id ? updatedJobLine : line
    );
    setJobLines(updatedJobLines);
  };

  const handleJobLineDelete = (jobLineId: string) => {
    const updatedJobLines = jobLines.filter(line => line.id !== jobLineId);
    setJobLines(updatedJobLines);
  };

  const handlePartUpdate = (updatedPart: WorkOrderPart) => {
    const updatedParts = allParts.map(part => 
      part.id === updatedPart.id ? updatedPart : part
    );
    setAllParts(updatedParts);
  };

  const handlePartDelete = (partId: string) => {
    const updatedParts = allParts.filter(part => part.id !== partId);
    setAllParts(updatedParts);
  };

  return (
    <div className="space-y-6">
      {/* Documents Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents & Attachments
            </CardTitle>
            {isEditMode && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-8 px-3">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
                <Button size="sm" className="h-8 px-3">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No documents uploaded yet</p>
            {isEditMode && (
              <p className="text-xs mt-2">Upload documents, photos, or add links related to this work order</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Job Lines & Parts Context */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Job Lines & Parts Reference</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Loading job lines and parts...
            </div>
          ) : (
            <CompactJobLinesTable
              jobLines={jobLines}
              allParts={allParts}
              onUpdate={isEditMode ? handleJobLineUpdate : undefined}
              onDelete={isEditMode ? handleJobLineDelete : undefined}
              onPartUpdate={isEditMode ? handlePartUpdate : undefined}
              onPartDelete={isEditMode ? handlePartDelete : undefined}
              isEditMode={isEditMode}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
