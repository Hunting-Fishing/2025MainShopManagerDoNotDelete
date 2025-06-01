
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign } from 'lucide-react';

interface JobLineCardProps {
  jobLine: WorkOrderJobLine;
  onUpdate?: (updatedJobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
}

export function JobLineCard({ jobLine, onUpdate, onDelete }: JobLineCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success' as const;
      case 'in-progress':
        return 'info' as const;
      case 'on-hold':
        return 'warning' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return 'outline' as const;
    
    switch (category.toLowerCase()) {
      case 'remove & replace':
      case 'replacement':
        return 'destructive' as const;
      case 'repair':
      case 'service':
        return 'info' as const;
      case 'maintenance':
        return 'warning' as const;
      case 'inspection':
      case 'testing':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-base leading-tight mb-1">
              {jobLine.name}
            </h3>
            {jobLine.category && (
              <Badge variant={getCategoryColor(jobLine.category)} className="text-xs mb-2">
                {jobLine.category}
              </Badge>
            )}
          </div>
          <Badge variant={getStatusColor(jobLine.status)} className="text-xs ml-2">
            {jobLine.status.replace('-', ' ')}
          </Badge>
        </div>

        {jobLine.description && jobLine.description !== jobLine.name && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {jobLine.description}
          </p>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {jobLine.estimatedHours && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{jobLine.estimatedHours}h</span>
              </div>
            )}
          </div>
          
          {jobLine.totalAmount && (
            <div className="flex items-center gap-1 font-semibold text-lg">
              <DollarSign className="h-4 w-4" />
              <span>${jobLine.totalAmount.toFixed(2)}</span>
            </div>
          )}
        </div>

        {jobLine.laborRate && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="text-xs text-muted-foreground">
              Labor Rate: ${jobLine.laborRate}/hr
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
