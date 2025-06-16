
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Wrench, Package, History, Trash2, Edit } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { StatusSelector } from './StatusSelector';
import { StatusBadge } from './StatusBadge';
import { ChangeHistoryDialog } from './ChangeHistoryDialog';
import { jobLineStatusMap, partStatusMap } from '@/types/jobLine';

interface UnifiedItemsTableProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onJobLineUpdate?: (jobLine: WorkOrderJobLine) => void;
  onJobLineDelete?: (jobLineId: string) => void;
  onPartUpdate?: (part: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
  isEditMode: boolean;
  showType?: 'overview' | 'parts' | 'labor';
}

export function UnifiedItemsTable({
  jobLines,
  allParts,
  onJobLineUpdate,
  onJobLineDelete,
  onPartUpdate,
  onPartDelete,
  isEditMode,
  showType = 'overview'
}: UnifiedItemsTableProps) {
  const [expandedJobLines, setExpandedJobLines] = useState<Set<string>>(new Set());
  const [historyDialog, setHistoryDialog] = useState<{
    isOpen: boolean;
    itemId: string;
    itemType: 'jobLine' | 'part';
    itemName: string;
  }>({ isOpen: false, itemId: '', itemType: 'jobLine', itemName: '' });

  const toggleJobLineExpansion = (jobLineId: string) => {
    const newExpanded = new Set(expandedJobLines);
    if (newExpanded.has(jobLineId)) {
      newExpanded.delete(jobLineId);
    } else {
      newExpanded.add(jobLineId);
    }
    setExpandedJobLines(newExpanded);
  };

  const handleStatusChange = (id: string, newStatus: string, type: 'jobLine' | 'part') => {
    if (type === 'jobLine' && onJobLineUpdate) {
      const jobLine = jobLines.find(jl => jl.id === id);
      if (jobLine) {
        onJobLineUpdate({ ...jobLine, status: newStatus });
      }
    } else if (type === 'part' && onPartUpdate) {
      const part = allParts.find(p => p.id === id);
      if (part) {
        onPartUpdate({ ...part, status: newStatus });
      }
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

  // Group parts by job line
  const getPartsForJobLine = (jobLineId: string) => {
    return allParts.filter(part => part.job_line_id === jobLineId);
  };

  const unassignedParts = allParts.filter(part => !part.job_line_id);

  if (jobLines.length === 0 && allParts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">No Items Added</p>
        <p className="text-sm">Add job lines and parts to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-8"></TableHead>
              <TableHead className="w-12"></TableHead>
              <TableHead className="font-semibold">Description</TableHead>
              <TableHead className="font-semibold w-32">Part #</TableHead>
              <TableHead className="font-semibold w-20 text-center">Qty</TableHead>
              <TableHead className="font-semibold w-24 text-center">Hours</TableHead>
              <TableHead className="font-semibold w-28 text-right">Rate</TableHead>
              <TableHead className="font-semibold w-28 text-right">Total</TableHead>
              <TableHead className="font-semibold w-32">Status</TableHead>
              {isEditMode && <TableHead className="w-24">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobLines.map((jobLine) => {
              const isExpanded = expandedJobLines.has(jobLine.id);
              const jobLineParts = getPartsForJobLine(jobLine.id);
              const hasVisibleParts = jobLineParts.length > 0;

              return (
                <React.Fragment key={jobLine.id}>
                  {/* Job Line Row */}
                  <TableRow className="hover:bg-muted/20 border-b-2 border-muted/30">
                    <TableCell>
                      {hasVisibleParts && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => toggleJobLineExpansion(jobLine.id)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Wrench className="h-4 w-4 text-blue-600" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-base">{jobLine.name}</div>
                        {jobLine.description && (
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {jobLine.description}
                          </div>
                        )}
                        {jobLine.category && (
                          <Badge variant="outline" className="text-xs">
                            {jobLine.category}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      —
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      —
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {formatHours(jobLine.estimated_hours)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(jobLine.labor_rate)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(jobLine.total_amount)}
                    </TableCell>
                    <TableCell>
                      {isEditMode ? (
                        <StatusSelector
                          currentStatus={jobLine.status || 'pending'}
                          type="jobLine"
                          onStatusChange={(newStatus) => handleStatusChange(jobLine.id, newStatus, 'jobLine')}
                        />
                      ) : (
                        <StatusBadge status={jobLine.status || 'pending'} type="jobLine" />
                      )}
                    </TableCell>
                    {isEditMode && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => showHistory(jobLine.id, 'jobLine', jobLine.name)}
                          >
                            <History className="h-3 w-3" />
                          </Button>
                          {onJobLineDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              onClick={() => onJobLineDelete(jobLine.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>

                  {/* Parts for this Job Line */}
                  {hasVisibleParts && isExpanded && jobLineParts.map((part) => (
                    <TableRow
                      key={`part-${part.id}`}
                      className="hover:bg-blue-50/30 bg-blue-50/10 border-l-4 border-l-blue-200"
                    >
                      <TableCell></TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center ml-4">
                          <Package className="h-4 w-4 text-orange-600" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="ml-4 space-y-1">
                          <div className="font-medium">{part.name}</div>
                          {part.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {part.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm font-medium">
                          {part.part_number}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm">
                        {part.quantity}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        —
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatCurrency(part.unit_price)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {formatCurrency(part.total_price)}
                      </TableCell>
                      <TableCell>
                        {isEditMode ? (
                          <StatusSelector
                            currentStatus={part.status || 'pending'}
                            type="part"
                            onStatusChange={(newStatus) => handleStatusChange(part.id, newStatus, 'part')}
                          />
                        ) : (
                          <StatusBadge status={part.status || 'pending'} type="part" />
                        )}
                      </TableCell>
                      {isEditMode && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => showHistory(part.id, 'part', part.name)}
                            >
                              <History className="h-3 w-3" />
                            </Button>
                            {onPartDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                onClick={() => onPartDelete(part.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </React.Fragment>
              );
            })}

            {/* Unassigned Parts Section */}
            {unassignedParts.length > 0 && (
              <>
                <TableRow className="bg-orange-50/30">
                  <TableCell colSpan={isEditMode ? 10 : 9} className="py-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-orange-800">
                      <Package className="h-4 w-4" />
                      Unassigned Parts
                    </div>
                  </TableCell>
                </TableRow>
                {unassignedParts.map((part) => (
                  <TableRow
                    key={`unassigned-${part.id}`}
                    className="hover:bg-orange-50/30 bg-orange-50/10 border-l-4 border-l-orange-200"
                  >
                    <TableCell></TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Package className="h-4 w-4 text-orange-600" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{part.name}</div>
                        {part.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {part.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm font-medium">
                        {part.part_number}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {part.quantity}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      —
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(part.unit_price)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(part.total_price)}
                    </TableCell>
                    <TableCell>
                      {isEditMode ? (
                        <StatusSelector
                          currentStatus={part.status || 'pending'}
                          type="part"
                          onStatusChange={(newStatus) => handleStatusChange(part.id, newStatus, 'part')}
                        />
                      ) : (
                        <StatusBadge status={part.status || 'pending'} type="part" />
                      )}
                    </TableCell>
                    {isEditMode && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => showHistory(part.id, 'part', part.name)}
                          >
                            <History className="h-3 w-3" />
                          </Button>
                          {onPartDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              onClick={() => onPartDelete(part.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      <ChangeHistoryDialog
        isOpen={historyDialog.isOpen}
        onClose={() => setHistoryDialog({ isOpen: false, itemId: '', itemType: 'jobLine', itemName: '' })}
        itemId={historyDialog.itemId}
        itemType={historyDialog.itemType}
        itemName={historyDialog.itemName}
      />
    </div>
  );
}
