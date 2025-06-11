
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import { jobLineStatusMap } from '@/types/jobLine';

interface JobLineCardProps {
  jobLine: WorkOrderJobLine;
  onEdit?: (jobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
}

export function JobLineCard({ jobLine, onEdit, onDelete }: JobLineCardProps) {
  const statusInfo = jobLineStatusMap[jobLine.status || 'pending'];

  const handleEdit = () => {
    if (onEdit) {
      onEdit(jobLine);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(jobLine.id);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {jobLine.name}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge className={statusInfo.classes}>
            {statusInfo.label}
          </Badge>
          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {jobLine.description && (
          <p className="text-sm text-muted-foreground mb-2">
            {jobLine.description}
          </p>
        )}
        <div className="flex justify-between text-sm">
          <span>Hours: {jobLine.estimated_hours || 0}</span>
          <span>Amount: ${jobLine.total_amount?.toFixed(2) || '0.00'}</span>
        </div>
      </CardContent>
    </Card>
  );
}
