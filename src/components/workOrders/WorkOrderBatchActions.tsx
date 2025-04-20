
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Printer, FileText, Clock, AlertTriangle, Check, X } from 'lucide-react';

interface WorkOrderBatchActionsProps {
  selectedCount: number;
  onUpdateStatus?: (status: string) => void;
  onPrintSelected?: () => void;
  onExportSelected?: () => void;
  onGenerateInvoices?: () => void;
}

export function WorkOrderBatchActions({
  selectedCount,
  onUpdateStatus = () => {},
  onPrintSelected = () => {},
  onExportSelected = () => {},
  onGenerateInvoices = () => {},
}: WorkOrderBatchActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-muted/40 border px-4 py-2 rounded-md flex items-center justify-between">
      <div className="font-medium">
        {selectedCount} {selectedCount === 1 ? 'work order' : 'work orders'} selected
      </div>
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Update Status <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Change status to:</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onUpdateStatus('pending')} className="gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatus('in-progress')} className="gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatus('completed')} className="gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatus('cancelled')} className="gap-2">
              <X className="h-4 w-4 text-red-500" />
              Cancelled
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" onClick={onPrintSelected}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        
        <Button variant="outline" size="sm" onClick={onExportSelected}>
          <FileText className="mr-2 h-4 w-4" />
          Export
        </Button>
        
        <Button variant="default" size="sm" onClick={onGenerateInvoices}>
          Generate Invoices
        </Button>
      </div>
    </div>
  );
}
