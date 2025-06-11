
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkOrder, TimeEntry, WorkOrderInventoryItem } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { getWorkOrderById } from '@/services/workOrder';
import { useJobLines } from '@/hooks/useJobLines';
import { useJobLineParts } from '@/hooks/useJobLineParts';
import { WorkOrderDetailsHeader } from './details/WorkOrderDetailsHeader';
import { WorkOrderDetailsTabs } from './details/WorkOrderDetailsTabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

interface WorkOrderDetailsViewProps {
  workOrderId?: string;
}

export function WorkOrderDetailsView({ workOrderId }: WorkOrderDetailsViewProps) {
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [inventoryItems, setInventoryItems] = useState<WorkOrderInventoryItem[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { jobLines, setJobLines, isLoading: jobLinesLoading } = useJobLines(workOrderId || '');
  const { parts } = useJobLineParts(workOrderId || '');

  useEffect(() => {
    if (workOrderId) {
      fetchWorkOrderData();
    }
  }, [workOrderId]);

  const fetchWorkOrderData = async () => {
    if (!workOrderId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await getWorkOrderById(workOrderId);
      if (data) {
        setWorkOrder(data);
        setTimeEntries(data.timeEntries || []);
        setInventoryItems(data.inventoryItems || []);
        setNotes(data.notes || '');
      } else {
        setError('Work order not found');
      }
    } catch (err) {
      console.error('Error fetching work order:', err);
      setError('Failed to load work order details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/work-orders/${workOrderId}/edit`);
  };

  const handleInvoiceCreated = (invoiceId: string) => {
    navigate(`/invoices/${invoiceId}`);
  };

  const handleUpdateTimeEntries = (entries: TimeEntry[]) => {
    setTimeEntries(entries);
  };

  const handleUpdateNotes = (newNotes: string) => {
    setNotes(newNotes);
  };

  const handleJobLinesChange = (newJobLines: WorkOrderJobLine[]) => {
    setJobLines(newJobLines);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg">Loading work order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Work order not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div id="work-order-details-content" className="container mx-auto p-6 space-y-6">
      <WorkOrderDetailsHeader
        workOrder={workOrder}
        onEdit={handleEdit}
        onInvoiceCreated={handleInvoiceCreated}
      />
      
      <WorkOrderDetailsTabs
        workOrder={workOrder}
        timeEntries={timeEntries}
        onUpdateTimeEntries={handleUpdateTimeEntries}
        inventoryItems={inventoryItems}
        notes={notes}
        onUpdateNotes={handleUpdateNotes}
        jobLines={jobLines}
        parts={parts}
        onJobLinesChange={handleJobLinesChange}
        jobLinesLoading={jobLinesLoading}
      />
    </div>
  );
}
