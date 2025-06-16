
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, History, Edit } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { StatusSelector } from './StatusSelector';
import { ChangeHistoryDialog } from './ChangeHistoryDialog';
import { updateWorkOrderJobLine } from '@/services/workOrder/jobLinesService';
import { updateWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { recordJobLineStatusChange, recordPartStatusChange } from '@/services/workOrder/historyService';
import { toast } from 'sonner';

interface UnifiedItemsTableProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onJobLineUpdate?: (updatedJobLine: WorkOrderJobLine) => void;
  onJobLineDelete?: (jobLineId: string) => void;
  onPartUpdate?: (updatedPart: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
  isEditMode?: boolean;
  showType?: 'overview' | 'detailed';
}

export function UnifiedItemsTable({
  jobLines,
  allParts,
  onJobLineUpdate,
  onJobLineDelete,
  onPartUpdate,
  onPartDelete,
  isEditMode = false,
  showType = 'overview'
}: UnifiedItemsTableProps) {
  const [historyDialog, setHistoryDialog] = useState<{
    isOpen: boolean;
    itemId: string;
    itemType: 'jobLine' | 'part';
    itemName: string;
  }>({ isOpen: false, itemId: '', itemType: 'jobLine', itemName: '' });

  const handleJobLineStatusChange = async (jobLine: WorkOrderJobLine, newStatus: string) => {
    if (!onJobLineUpdate) return;
    
    try {
      const oldStatus = jobLine.status || 'pending';
      
      // Update the job line in the database
      await updateWorkOrderJobLine(jobLine.id, {
        ...jobLine,
        status: newStatus
      });

      // Record the status change in history
      await recordJobLineStatusChange(
        jobLine.id,
        oldStatus,
        newStatus,
        'Current User' // In a real app, get this from auth context
      );

      // Update local state
      onJobLineUpdate({ ...jobLine, status: newStatus });
      
      toast.success('Job line status updated successfully');
    } catch (error) {
      console.error('Error updating job line status:', error);
      toast.error('Failed to update job line status');
    }
  };

  const handlePartStatusChange = async (part: WorkOrderPart, newStatus: string) => {
    if (!onPartUpdate) return;
    
    try {
      const oldStatus = part.status || 'pending';
      
      // Update the part in the database
      await updateWorkOrderPart(part.id, {
        part_number: part.part_number,
        name: part.name,
        unit_price: part.unit_price,
        quantity: part.quantity,
        status: newStatus,
        notes: part.notes
      });

      // Record the status change in history
      await recordPartStatusChange(
        part.id,
        oldStatus,
        newStatus,
        'Current User' // In a real app, get this from auth context
      );

      // Update local state
      onPartUpdate({ ...part, status: newStatus });
      
      toast.success('Part status updated successfully');
    } catch (error) {
      console.error('Error updating part status:', error);
      toast.error('Failed to update part status');
    }
  };

  const showHistory = (itemId: string, itemType: 'jobLine' | 'part', itemName: string) => {
    setHistoryDialog({
      isOpen: true,
      itemId,
      itemType,
      itemName
    });
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatHours = (hours: number | undefined) => {
    if (hours === undefined || hours === null) return '0.0';
    return hours.toFixed(1);
  };

  const calculateJobLineWithPartsTotal = (jobLine: WorkOrderJobLine) => {
    const laborTotal = jobLine.total_amount || 0;
    const jobLineParts = allParts.filter(part => part.job_line_id === jobLine.id);
    const partsTotal = jobLineParts.reduce((sum, part) => sum + (part.total_price || 0), 0);
    return laborTotal + partsTotal;
  };

  if (jobLines.length === 0 && allParts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No job lines or parts found
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Job Lines Section */}
        {jobLines.length > 0 && (
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-3">Labor & Services</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  {isEditMode && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobLines.map((jobLine) => (
                  <TableRow key={jobLine.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{jobLine.name}</div>
                        {jobLine.description && (
                          <div className="text-sm text-muted-foreground">{jobLine.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isEditMode ? (
                        <StatusSelector
                          currentStatus={jobLine.status || 'pending'}
                          type="jobLine"
                          onStatusChange={(newStatus) => handleJobLineStatusChange(jobLine, newStatus)}
                        />
                      ) : (
                        <StatusBadge status={jobLine.status || 'pending'} type="jobLine" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatHours(jobLine.estimated_hours)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(jobLine.labor_rate)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(calculateJobLineWithPartsTotal(jobLine))}
                    </TableCell>
                    {isEditMode && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => showHistory(jobLine.id, 'jobLine', jobLine.name)}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          {onJobLineDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onJobLineDelete(jobLine.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Parts Section */}
        {allParts.length > 0 && (
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-3">Parts & Materials</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  {isEditMode && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {allParts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{part.name}</div>
                        <div className="text-sm text-muted-foreground">#{part.part_number}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isEditMode ? (
                        <StatusSelector
                          currentStatus={part.status || 'pending'}
                          type="part"
                          onStatusChange={(newStatus) => handlePartStatusChange(part, newStatus)}
                        />
                      ) : (
                        <StatusBadge status={part.status || 'pending'} type="part" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">{part.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(part.unit_price)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(part.total_price)}
                    </TableCell>
                    {isEditMode && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => showHistory(part.id, 'part', part.name)}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          {onPartDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onPartDelete(part.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <ChangeHistoryDialog
        isOpen={historyDialog.isOpen}
        onClose={() => setHistoryDialog({ ...historyDialog, isOpen: false })}
        itemId={historyDialog.itemId}
        itemType={historyDialog.itemType}
        itemName={historyDialog.itemName}
      />
    </>
  );
}
