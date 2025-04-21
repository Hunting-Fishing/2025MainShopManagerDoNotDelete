import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Play, CheckCircle } from 'lucide-react';

export default function WorkOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkOrder = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('work_orders')
          .select(`
            *,
            customers (*),
            vehicles (*)
          `)
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setWorkOrder(data);
        } else {
          toast({
            title: "Work Order Not Found",
            description: "Could not retrieve work order details.",
            variant: "destructive",
          });
          navigate('/customer-portal');
        }
      } catch (error) {
        console.error("Error fetching work order:", error);
        toast({
          title: "Error",
          description: "Failed to load work order details.",
          variant: "destructive",
        });
        navigate('/customer-portal');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrder();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p>Loading work order details...</p>
      </div>
    );
  }

  if (!workOrder) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <Button onClick={() => navigate('/customer-portal')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Work Orders
      </Button>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Work Order Details</h2>

        {/* Customer Details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
          <p>
            <strong>Name:</strong> {workOrder.customers?.first_name} {workOrder.customers?.last_name}
          </p>
          <p>
            <strong>Email:</strong> {workOrder.customers?.email}
          </p>
          <p>
            <strong>Phone:</strong> {workOrder.customers?.phone}
          </p>
        </div>

        {/* Work Order Details */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Work Order Information</h3>
          <p>
            <strong>ID:</strong> {workOrder.id}
          </p>
          <p>
            <strong>Description:</strong> {workOrder.description}
          </p>
          <p>
            <strong>Status:</strong> {workOrder.status}
          </p>

          {/* Creation date */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-600">Created</h3>
            <p className="text-sm text-slate-900">
              {workOrder.createdAt ? format(new Date(workOrder.createdAt), 'MMMM d, yyyy') : 
               workOrder.created_at ? format(new Date(workOrder.created_at), 'MMMM d, yyyy') : 'N/A'}
            </p>
          </div>

          {/* Vehicle information */}
          {(workOrder.vehicleDetails || workOrder.vehicle_make) && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-slate-600">Vehicle</h3>
              <p className="text-sm text-slate-900">
                {workOrder.vehicleDetails ? 
                  `${workOrder.vehicleDetails.year || ''} ${workOrder.vehicleDetails.make || ''} ${workOrder.vehicleDetails.model || ''}` :
                  workOrder.vehicle_make && workOrder.vehicle_model ? 
                    `${workOrder.vehicle_make} ${workOrder.vehicle_model}` : 
                    'N/A'
                }
              </p>
              {workOrder.vehicleDetails?.licensePlate && (
                <p className="text-xs text-slate-500 mt-1">
                  License: {workOrder.vehicleDetails.licensePlate}
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          {workOrder.notes && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-slate-600">Notes</h3>
              <p className="text-sm text-slate-900">{workOrder.notes}</p>
            </div>
          )}

          {/* Timeline section */}
          <div className="mt-8">
            <h3 className="text-lg font-medium">Service Timeline</h3>
            <div className="mt-3 space-y-6">
              {/* Creation */}
              <div className="relative pl-8 pb-8 border-l-2 border-slate-200">
                <div className="absolute -left-2 rounded-full w-5 h-5 bg-blue-500 flex items-center justify-center">
                  <FileText className="text-white h-3 w-3" />
                </div>
                <div>
                  <p className="text-sm font-medium">Work Order Created</p>
                  <p className="text-xs text-slate-500">
                    {workOrder.createdAt ? format(new Date(workOrder.createdAt), 'MMMM d, yyyy • h:mm a') :
                     workOrder.created_at ? format(new Date(workOrder.created_at), 'MMMM d, yyyy • h:mm a') : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Service Start */}
              {(workOrder.startTime || workOrder.start_time) && (
                <div className="relative pl-8 pb-8 border-l-2 border-slate-200">
                  <div className="absolute -left-2 rounded-full w-5 h-5 bg-yellow-500 flex items-center justify-center">
                    <Play className="text-white h-3 w-3" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Service Started</p>
                    <p className="text-xs text-slate-500">
                      {workOrder.startTime ? format(new Date(workOrder.startTime), 'MMMM d, yyyy • h:mm a') :
                       workOrder.start_time ? format(new Date(workOrder.start_time), 'MMMM d, yyyy • h:mm a') : 'N/A'}
                    </p>
                  </div>
                </div>
              )}

              {/* Service Completion */}
              {(workOrder.endTime || workOrder.end_time) && (
                <div className="relative pl-8 border-l-2 border-slate-200">
                  <div className="absolute -left-2 rounded-full w-5 h-5 bg-green-500 flex items-center justify-center">
                    <CheckCircle className="text-white h-3 w-3" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Service Completed</p>
                    <p className="text-xs text-slate-500">
                      {workOrder.endTime ? format(new Date(workOrder.endTime), 'MMMM d, yyyy • h:mm a') :
                       workOrder.end_time ? format(new Date(workOrder.end_time), 'MMMM d, yyyy • h:mm a') : 'N/A'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
