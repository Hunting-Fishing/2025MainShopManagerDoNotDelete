
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bug, ChevronDown, ChevronRight } from 'lucide-react';

interface JobLinesDebugInfoProps {
  jobLines: WorkOrderJobLine[];
  description?: string;
}

export function JobLinesDebugInfo({ jobLines, description }: JobLinesDebugInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show in development or when there are parsing issues
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (!isDevelopment && jobLines.length > 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Debug: Job Line Parsing
            <Badge variant="outline" className="text-xs">
              {jobLines.length} parsed
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-auto p-1"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          {description && (
            <div>
              <h4 className="text-sm font-medium mb-2">Original Description:</h4>
              <div className="text-xs bg-white dark:bg-gray-800 p-2 rounded border">
                {description}
              </div>
            </div>
          )}
          
          <div>
            <h4 className="text-sm font-medium mb-2">Parsed Job Lines:</h4>
            <div className="space-y-2">
              {jobLines.map((line, index) => (
                <div key={index} className="text-xs bg-white dark:bg-gray-800 p-2 rounded border">
                  <div><strong>Name:</strong> {line.name}</div>
                  <div><strong>Category:</strong> {line.category || 'N/A'}</div>
                  <div><strong>Hours:</strong> {line.estimatedHours || 'N/A'}</div>
                  <div><strong>Amount:</strong> ${line.totalAmount || 0}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
