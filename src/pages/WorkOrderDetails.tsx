
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { WorkOrder } from '@/types/workOrder';
import { getWorkOrderById } from '@/services/workOrder';
import { WorkOrderDetailsView } from '@/components/work-orders/WorkOrderDetailsView';

const WorkOrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchWorkOrder(id);
    }
  }, [id]);

  const fetchWorkOrder = async (workOrderId: string) => {
    try {
      console.log('Fetching work order details for:', workOrderId);
      setLoading(true);
      setError(null);
      
      const data = await getWorkOrderById(workOrderId);
      if (data) {
        console.log('Work order details loaded:', data);
        setWorkOrder(data);
      } else {
        setError('Work order not found');
      }
    } catch (err) {
      console.error('Error fetching work order details:', err);
      setError('Failed to load work order details');
    } finally {
      setLoading(false);
    }
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

  return <WorkOrderDetailsView />;
};

export default WorkOrderDetails;
