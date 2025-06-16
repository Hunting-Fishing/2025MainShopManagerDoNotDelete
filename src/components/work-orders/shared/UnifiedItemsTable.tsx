
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, History, ChevronDown, ChevronRight } from 'lucide-react';
import { StatusSelector } from './StatusSelector';
import { ChangeHistoryDialog } from './ChangeHistoryDialog';
import { jobLineStatusMap, partStatusMap } from '@/types/jobLine';

interface UnifiedItem {
  id: string;
  type: 'labor' | 'part';
  description: string;
  rate?: number;
  hours?: number;
  quantity?: number;
  unitPrice?: number;
  lineTotal: number;
  status: string;
  originalItem: WorkOrderJobLine | WorkOrderPart;
}

interface UnifiedItemsTableProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onJobLineUpdate?: (jobLine: WorkOrderJobLine) => void;
  onJobLineDelete?: (jobLineId: string) => void;
  onPartUpdate?: (part: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
  isEditMode?: boolean;
  showType?: 'overview' | 'detailed';
}

export function UnifiedItemsTable({
  jobLines = [],
  allParts = [],
  onJobLineUpdate,
  onJobLineDelete,
  onPartUpdate,
  onPartDelete,
  isEditMode = false,
  showType = 'detailed'
}: UnifiedItemsTableProps) {
  const [historyDialog, setHistoryDialog] = useState<{
    isOpen: boolean;
    itemId: string;
    itemType: 'jobLine' | 'part';
    itemName: string;
  }>({
    isOpen: false,
    itemId: '',
    itemType: 'jobLine',
    itemName: ''
  });

  const [expandedJobLines, setExpandedJobLines] = useState<Set<string>>(new Set());

  const handleStatusChange = async (itemId: string, newStatus: string, itemType: 'labor' | 'part') => {
    if (itemType === 'labor' && onJobLineUpdate) {
      const jobLine = jobLines.find(jl => jl.id === itemId);
      if (jobLine) {
        const updatedJobLine = { ...jobLine, status: newStatus };
        await onJobLineUpdate(updatedJobLine);
      }
    } else if (itemType === 'part' && onPartUpdate) {
      const part = allParts.find(p => p.id === itemId);
      if (part) {
        const updatedPart = { ...part, status: newStatus };
        await onPartUpdate(updatedPart);
      }
    }
  };

  const handleDelete = (itemId: string, itemType: 'labor' | 'part') => {
    if (itemType === 'labor' && onJobLineDelete) {
      onJobLineDelete(itemId);
    } else if (itemType === 'part' && onPartDelete) {
      onPartDelete(itemId);
    }
  };

  const openHistoryDialog = (itemId: string, itemType: 'jobLine' | 'part', itemName: string) => {
    setHistoryDialog({
      isOpen: true,
      itemId,
      itemType,
      itemName
    });
  };

  const toggleJobLineExpansion = (jobLineId: string) => {
    const newExpanded = new Set(expandedJobLines);
    if (newExpanded.has(jobLineId)) {
      newExpanded.delete(jobLineId);
    } else {
      newExpanded.add(jobLineId);
    }
    setExpandedJobLines(newExpanded);
  };

  const getJobLineParts = (jobLineId: string) => {
    return allParts.filter(part => part.job_line_id === jobLineId);
  };

  const getUnassignedParts = () => {
    return allParts.filter(part => !part.job_line_id);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status: string, type: 'labor' | 'part') => {
    const statusConfig = type === 'labor' 
      ? jobLineStatusMap[status] || { label: status, classes: 'bg-gray-100 text-gray-800' }
      : partStatusMap[status] || { label: status, classes: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge variant="outline" className={statusConfig.classes}>
        {statusConfig.label}
      </Badge>
    );
  };

  if (showType === 'overview') {
    // Overview display: Group parts under job lines
    return (
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right w-24">Rate/Price</TableHead>
              <TableHead className="text-right w-20">Qty/Hrs</TableHead>
              <TableHead className="text-right w-24">Total</TableHead>
              <TableHead className="w-32">Status</TableHead>
              {isEditMode && <TableHead className="w-24">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobLines.map((jobLine) => {
              const jobLineParts = getJobLineParts(jobLine.id);
              const isExpanded = expandedJobLines.has(jobLine.id);
              
              return (
                <React.Fragment key={jobLine.id}>
                  {/* Job Line Row */}
                  <TableRow className="font-medium bg-blue-50">
                    <TableCell>
                      {jobLineParts.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleJobLineExpansion(jobLine.id)}
                          className="h-6 w-6 p-0"
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
                      <div>
                        <div className="font-medium text-blue-900">{jobLine.name}</div>
                        {jobLine.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {jobLine.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(jobLine.labor_rate || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {jobLine.estimated_hours || 0}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(jobLine.total_amount || 0)}
                    </TableCell>
                    <TableCell>
                      {isEditMode ? (
                        <StatusSelector
                          currentStatus={jobLine.status || 'pending'}
                          type="jobLine"
                          onStatusChange={(newStatus) => handleStatusChange(jobLine.id, newStatus, 'labor')}
                        />
                      ) : (
                        getStatusBadge(jobLine.status || 'pending', 'labor')
                      )}
                    </TableCell>
                    {isEditMode && (
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openHistoryDialog(jobLine.id, 'jobLine', jobLine.name)}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(jobLine.id, 'labor')}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                  
                  {/* Parts under this job line */}
                  {isExpanded && jobLineParts.map((part) => (
                    <TableRow key={part.id} className="bg-gray-50">
                      <TableCell></TableCell>
                      <TableCell>
                        <div className="pl-4">
                          <div className="font-medium text-gray-700">{part.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Part #: {part.part_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(part.unit_price || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {part.quantity || 0}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(part.total_price || 0)}
                      </TableCell>
                      <TableCell>
                        {isEditMode ? (
                          <StatusSelector
                            currentStatus={part.status || 'pending'}
                            type="part"
                            onStatusChange={(newStatus) => handleStatusChange(part.id, newStatus, 'part')}
                          />
                        ) : (
                          getStatusBadge(part.status || 'pending', 'part')
                        )}
                      </TableCell>
                      {isEditMode && (
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openHistoryDialog(part.id, 'part', part.name)}
                            >
                              <History className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(part.id, 'part')}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </React.Fragment>
              );
            })}
            
            {/* Unassigned Parts */}
            {getUnassignedParts().length > 0 && (
              <>
                <TableRow className="bg-yellow-50">
                  <TableCell colSpan={isEditMode ? 7 : 6} className="font-medium text-yellow-800">
                    Unassigned Parts
                  </TableCell>
                </TableRow>
                {getUnassignedParts().map((part) => (
                  <TableRow key={part.id} className="bg-yellow-25">
                    <TableCell></TableCell>
                    <TableCell>
                      <div className="pl-4">
                        <div className="font-medium text-yellow-700">{part.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Part #: {part.part_number}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(part.unit_price || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {part.quantity || 0}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(part.total_price || 0)}
                    </TableCell>
                    <TableCell>
                      {isEditMode ? (
                        <StatusSelector
                          currentStatus={part.status || 'pending'}
                          type="part"
                          onStatusChange={(newStatus) => handleStatusChange(part.id, newStatus, 'part')}
                        />
                      ) : (
                        getStatusBadge(part.status || 'pending', 'part')
                      )}
                    </TableCell>
                    {isEditMode && (
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openHistoryDialog(part.id, 'part', part.name)}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(part.id, 'part')}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>

        <ChangeHistoryDialog
          isOpen={historyDialog.isOpen}
          onClose={() => setHistoryDialog(prev => ({ ...prev, isOpen: false }))}
          itemId={historyDialog.itemId}
          itemType={historyDialog.itemType}
          itemName={historyDialog.itemName}
        />
      </div>
    );
  }

  // Detailed display: Show all items as flat list
  const unifiedItems: UnifiedItem[] = [
    ...jobLines.map(jobLine => ({
      id: jobLine.id,
      type: 'labor' as const,
      description: jobLine.name,
      rate: jobLine.labor_rate || 0,
      hours: jobLine.estimated_hours || 0,
      lineTotal: jobLine.total_amount || 0,
      status: jobLine.status || 'pending',
      originalItem: jobLine
    })),
    ...allParts.map(part => ({
      id: part.id,
      type: 'part' as const,
      description: part.name,
      quantity: part.quantity || 0,
      unitPrice: part.unit_price || 0,
      lineTotal: part.total_price || 0,
      status: part.status || 'pending',
      originalItem: part
    }))
  ];

  if (unifiedItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No labor or parts have been added yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Rate/Price</TableHead>
            <TableHead className="text-right">Qty/Hrs</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
            {isEditMode && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {unifiedItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Badge variant={item.type === 'labor' ? 'default' : 'secondary'}>
                  {item.type === 'labor' ? 'Labor' : 'Part'}
                </Badge>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{item.description}</div>
                  {item.type === 'part' && 'part_number' in item.originalItem && (
                    <div className="text-sm text-muted-foreground">
                      Part #: {item.originalItem.part_number}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(item.rate || item.unitPrice || 0)}
              </TableCell>
              <TableCell className="text-right">
                {item.hours || item.quantity || 0}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(item.lineTotal)}
              </TableCell>
              <TableCell>
                {isEditMode ? (
                  <StatusSelector
                    currentStatus={item.status}
                    type={item.type === 'labor' ? 'jobLine' : 'part'}
                    onStatusChange={(newStatus) => handleStatusChange(item.id, newStatus, item.type)}
                  />
                ) : (
                  getStatusBadge(item.status, item.type)
                )}
              </TableCell>
              {isEditMode && (
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openHistoryDialog(
                        item.id, 
                        item.type === 'labor' ? 'jobLine' : 'part', 
                        item.description
                      )}
                    >
                      <History className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id, item.type)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ChangeHistoryDialog
        isOpen={historyDialog.isOpen}
        onClose={() => setHistoryDialog(prev => ({ ...prev, isOpen: false }))}
        itemId={historyDialog.itemId}
        itemType={historyDialog.itemType}
        itemName={historyDialog.itemName}
      />
    </div>
  );
}
