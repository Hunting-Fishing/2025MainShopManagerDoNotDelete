
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Clock, DollarSign } from 'lucide-react';
import { jobLineStatusMap } from '@/types/jobLine';

interface JobLinesTableProps {
  jobLines: WorkOrderJobLine[];
  isEditMode?: boolean;
  onUpdate?: (jobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
}

export function JobLinesTable({ 
  jobLines, 
  isEditMode = false,
  onUpdate = () => {},
  onDelete = () => {}
}: JobLinesTableProps) {
  if (jobLines.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-lg font-medium mb-2">No Job Lines Found</p>
        <p className="text-sm">Job lines will be automatically parsed from the work order description.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Service</TableHead>
            <TableHead className="font-semibold">Category</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold text-center">Hours</TableHead>
            <TableHead className="font-semibold text-center">Rate</TableHead>
            <TableHead className="font-semibold text-center">Labor</TableHead>
            <TableHead className="font-semibold text-center">Total</TableHead>
            {isEditMode && <TableHead className="font-semibold text-center">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobLines.map((jobLine) => {
            const statusInfo = jobLineStatusMap[jobLine.status] || jobLineStatusMap.pending;
            const partsTotal = jobLine.parts?.reduce((total, part) => 
              total + (part.customerPrice * part.quantity), 0) || 0;
            const totalWithParts = (jobLine.totalAmount || 0) + partsTotal;

            return (
              <TableRow key={jobLine.id} className="hover:bg-muted/30">
                <TableCell>
                  <div>
                    <div className="font-medium">{jobLine.name}</div>
                    {jobLine.description && (
                      <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {jobLine.description}
                      </div>
                    )}
                    {jobLine.parts && jobLine.parts.length > 0 && (
                      <div className="text-xs text-blue-600 mt-1">
                        {jobLine.parts.length} part{jobLine.parts.length !== 1 ? 's' : ''} included
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {jobLine.category && (
                      <Badge variant="outline" className="text-xs w-fit">
                        {jobLine.category}
                      </Badge>
                    )}
                    {jobLine.subcategory && (
                      <span className="text-xs text-muted-foreground">
                        {jobLine.subcategory}
                      </span>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge className={statusInfo.classes}>
                    {statusInfo.label}
                  </Badge>
                </TableCell>
                
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="font-mono text-sm">
                      {jobLine.estimatedHours?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                </TableCell>
                
                <TableCell className="text-center">
                  <span className="font-mono text-sm">
                    ${jobLine.laborRate?.toFixed(2) || '0.00'}
                  </span>
                </TableCell>
                
                <TableCell className="text-center">
                  <span className="font-mono text-sm">
                    ${jobLine.totalAmount?.toFixed(2) || '0.00'}
                  </span>
                </TableCell>
                
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <DollarSign className="h-3 w-3 text-green-600" />
                    <span className="font-mono text-sm font-semibold text-green-600">
                      ${totalWithParts.toFixed(2)}
                    </span>
                  </div>
                </TableCell>
                
                {isEditMode && (
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdate(jobLine)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(jobLine.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
