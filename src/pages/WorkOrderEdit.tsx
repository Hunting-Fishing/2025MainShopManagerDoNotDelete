
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { WorkOrder } from '@/types/workOrder';
import { getWorkOrderById, updateWorkOrder } from '@/services/workOrder';
import { WorkOrderEditForm } from '@/components/work-orders/WorkOrderEditForm';

const WorkOrderEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchWorkOrder(id);
    }
  }, [id]);

  const fetchWorkOrder = async (workOrderId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWorkOrderById(workOrderId);
      if (data) {
        setWorkOrder(data);
      } else {
        setError('Work order not found');
      }
    } catch (err) {
      console.error('Error fetching work order:', err);
      setError('Failed to load work order');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedWorkOrder: Partial<WorkOrder>) => {
    if (!id) return;

    try {
      setSaving(true);
      const result = await updateWorkOrder({ ...updatedWorkOrder, id });
      if (result) {
        setWorkOrder(result);
        toast({
          title: "Success",
          description: "Work order updated successfully"
        });
        navigate(`/work-orders/${id}`);
      } else {
        throw new Error('Failed to update work order');
      }
    } catch (err) {
      console.error('Error updating work order:', err);
      toast({
        title: "Error",
        description: "Failed to update work order",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTimeEntriesUpdate = (updatedEntries: any[]) => {
    if (workOrder) {
      setWorkOrder({
        ...workOrder,
        timeEntries: updatedEntries
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading work order...</div>
        </div>
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Work Order</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => navigate('/work-orders')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Work Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/work-orders')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Work Order</h1>
            <p className="text-gray-600">Work Order ID: {workOrder.id}</p>
          </div>
        </div>
        <Button
          onClick={() => handleSave(workOrder)}
          disabled={saving}
          className="flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </Button>
      </div>

      <WorkOrderEditForm
        workOrderId={workOrder.id}
        timeEntries={workOrder.timeEntries || []}
        onUpdateTimeEntries={handleTimeEntriesUpdate}
      />
    </div>
  );
};

export default WorkOrderEdit;
