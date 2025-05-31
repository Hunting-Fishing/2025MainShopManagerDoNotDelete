
import React, { useState, useEffect } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { parseJobLinesFromDescriptionEnhanced } from '@/services/jobLineParserEnhanced';
import { EditableJobLinesGrid } from '../job-lines/EditableJobLinesGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

interface JobLinesSectionProps {
  workOrderId: string;
  description: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  shopId?: string;
}

export function JobLinesSection({ 
  workOrderId, 
  description, 
  jobLines, 
  onJobLinesChange,
  shopId 
}: JobLinesSectionProps) {
  const [isParsingJobLines, setIsParsingJobLines] = useState(false);

  // Auto-parse job lines when description changes
  useEffect(() => {
    if (description && jobLines.length === 0) {
      handleParseJobLines();
    }
  }, [description]);

  const handleParseJobLines = async () => {
    if (!description.trim()) {
      toast.error('Please enter a work order description first');
      return;
    }

    setIsParsingJobLines(true);
    try {
      const parsedJobLines = await parseJobLinesFromDescriptionEnhanced(
        description,
        workOrderId,
        shopId
      );
      
      if (parsedJobLines.length > 0) {
        onJobLinesChange(parsedJobLines);
        toast.success(`Parsed ${parsedJobLines.length} job line(s) from description`);
      } else {
        toast.info('No specific services detected in description');
      }
    } catch (error) {
      console.error('Error parsing job lines:', error);
      toast.error('Failed to parse job lines from description');
    } finally {
      setIsParsingJobLines(false);
    }
  };

  const handleUpdateJobLine = (updatedJobLine: WorkOrderJobLine) => {
    const updatedJobLines = jobLines.map(line => 
      line.id === updatedJobLine.id ? updatedJobLine : line
    );
    onJobLinesChange(updatedJobLines);
  };

  const handleDeleteJobLine = (jobLineId: string) => {
    const updatedJobLines = jobLines.filter(line => line.id !== jobLineId);
    onJobLinesChange(updatedJobLines);
  };

  const handleAddJobLine = (newJobLineData: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newJobLine: WorkOrderJobLine = {
      ...newJobLineData,
      id: `${workOrderId}-job-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onJobLinesChange([...jobLines, newJobLine]);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Labor & Services</CardTitle>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleParseJobLines}
            disabled={isParsingJobLines || !description.trim()}
            className="flex items-center gap-2"
          >
            {isParsingJobLines ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            {isParsingJobLines ? 'Parsing...' : 'Parse from Description'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <EditableJobLinesGrid
          jobLines={jobLines}
          onUpdateJobLine={handleUpdateJobLine}
          onDeleteJobLine={handleDeleteJobLine}
          onAddJobLine={handleAddJobLine}
          workOrderId={workOrderId}
          shopId={shopId}
          showSummary={true}
        />
      </CardContent>
    </Card>
  );
}
