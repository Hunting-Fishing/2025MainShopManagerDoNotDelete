
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, History } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { StatusSelector } from './StatusSelector';
import { ChangeHistoryDialog } from './ChangeHistoryDialog';
import { updateWorkOrderJobLine } from '@/services/workOrder/jobLinesService';
import { updateWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { recordJobLineStatusChange, recordPartStatusChange } from '@/services/workOrder/historyService';

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

interface TableItem {
  id: string;
  type: 'labor' | 'parts';
  description: string;
  partNumber?: string;
  quantity?: number;
  price?: number;
  rate?: number;
  hours?: number;
  lineTotal: number;
  status?: string;
  originalItem: WorkOrderJobLine | WorkOrderPart;
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
  }>({
    isOpen: false,
    itemId: '',
    itemType: 'jobLine',
    itemName: ''
  });

  // Convert job lines and parts to unified table items
  const tableItems: TableItem[] = [
    // Job lines (Labor)
    ...jobLines.map((jobLine): TableItem => ({
      id: jobLine.id,
      type: 'labor',
      description: jobLine.name || jobLine.description || '',
      rate: jobLine.labor_rate || 0,
      hours: jobLine.estimated_hours || 0,
      lineTotal: jobLine.total_amount || (jobLine.labor_rate || 0) * (jobLine.estimated_hours || 0),
      status: jobLine.status,
      originalItem: jobLine
    })),
    // Parts
    ...allParts.map((part): TableItem => ({
      id: part.id,
      type: 'parts',
      description: part.name || '',
      partNumber: part.part_number,
      quantity: part.quantity,
      price: part.unit_price,
      lineTotal: part.total_price || part.unit_price * part.quantity,
      status: part.status,
      originalItem: part
    }))
  ];

  const handleStatusChange = async (item: TableItem, newStatus: string) => {
    try {
      if (item.type === 'labor' && onJobLineUpdate) {
        const jobLine = item.originalItem as WorkOrderJobLine;
        const oldStatus = jobLine.status || '';
        
        const updatedJobLine = await updateWorkOrderJobLine(jobLine.id, {
          ...jobLine,
          status: newStatus
        });
        
        await recordJobLineStatusChange(jobLine.id, oldStatus, newStatus, 'System User');
        onJobLineUpdate(updatedJobLine);
      } else if (item.type === 'parts' && onPartUpdate) {
        const part = item.originalItem as WorkOrderPart;
        const oldStatus = part.status || '';
        
        const updatedPart = await updateWorkOrderPart(part.id, {
          part_number: part.part_number,
          name: part.name,
          description: part.description,
          quantity: part.quantity,
          unit_price: part.unit_price,
          status: newStatus,
          notes: part.notes,
          job_line_id: part.job_line_id
        });
        
        await recordPartStatusChange(part.id, oldStatus, newStatus, 'System User');
        onPartUpdate(updatedPart);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleShowHistory = (item: TableItem) => {
    setHistoryDialog({
      isOpen: true,
      itemId: item.id,
      itemType: item.type === 'labor' ? 'jobLine' : 'part',
      itemName: item.description
    });
  };

  const handleEdit = (item: TableItem) => {
    // TODO: Implement edit functionality
    console.log('Edit item:', item);
  };

  const handleDelete = (item: TableItem) => {
    if (item.type === 'labor' && onJobLineDelete) {
      onJobLineDelete(item.id);
    } else if (item.type === 'parts' && onPartDelete) {
      onPartDelete(item.id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (tableItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No job lines or parts added yet
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">TYPE</TableHead>
              <TableHead className="min-w-48">DESCRIPTION</TableHead>
              <TableHead className="w-32">PART #</TableHead>
              <TableHead className="w-20">QTY</TableHead>
              <TableHead className="w-24">PRICE</TableHead>
              <TableHead className="w-24">RATE</TableHead>
              <TableHead className="w-20">HOURS</TableHead>
              <TableHead className="w-32">LINE TOTAL</TableHead>
              <TableHead className="w-32">STATUS</TableHead>
              <TableHead className="w-40">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.type === 'labor' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {item.type === 'labor' ? 'Labor' : 'Parts'}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{item.description}</TableCell>
                <TableCell>{item.partNumber || '-'}</TableCell>
                <TableCell>{item.quantity || '-'}</TableCell>
                <TableCell>{item.price ? formatCurrency(item.price) : '-'}</TableCell>
                <TableCell>{item.rate ? formatCurrency(item.rate) : '-'}</TableCell>
                <TableCell>{item.hours || '-'}</TableCell>
                <TableCell className="font-medium">{formatCurrency(item.lineTotal)}</TableCell>
                <TableCell>
                  {isEditMode ? (
                    <StatusSelector
                      currentStatus={item.status || 'pending'}
                      type={item.type === 'labor' ? 'jobLine' : 'part'}
                      onStatusChange={(newStatus) => handleStatusChange(item, newStatus)}
                    />
                  ) : (
                    <StatusBadge
                      status={item.status || 'pending'}
                      type={item.type === 'labor' ? 'jobLine' : 'part'}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShowHistory(item)}
                      className="h-8 w-8 p-0"
                    >
                      <History className="h-4 w-4" />
                    </Button>
                    {isEditMode && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ChangeHistoryDialog
        isOpen={historyDialog.isOpen}
        onClose={() => setHistoryDialog(prev => ({ ...prev, isOpen: false }))}
        itemId={historyDialog.itemId}
        itemType={historyDialog.itemType}
        itemName={historyDialog.itemName}
      />
    </>
  );
}
