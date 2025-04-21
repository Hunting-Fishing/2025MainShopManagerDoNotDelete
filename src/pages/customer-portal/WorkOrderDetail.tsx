
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { WorkOrder } from "@/types/workOrder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Clock, MessageSquare, User, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CustomerChatPanel } from "@/components/customer-portal/CustomerChatPanel";
import { WorkOrderStatusBadge } from "@/components/workOrders/WorkOrderStatusBadge";

export default function CustomerWorkOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const fetchWorkOrderDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('work_orders')
          .select(`
            *,
            customers(first_name, last_name, email),
            vehicles(make, model, year, color, vin)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (data) {
          setWorkOrder(data as unknown as WorkOrder);
          
          // Set up real-time subscription for this work order
          const workOrderChannel = supabase
            .channel(`work-order-${id}`)
            .on('postgres_changes', {
              event: 'UPDATE',
              schema: 'public',
              table: 'work_orders',
              filter: `id=eq.${id}`
            }, (payload) => {
              setWorkOrder(current => ({
                ...(current as WorkOrder),
                ...payload.new as Partial<WorkOrder>
              }));

              // Show toast notification for status changes
              if (payload.new.status !== payload.old.status) {
                toast({
                  title: "Work Order Updated",
                  description: `Status changed to ${payload.new.status}`,
                  variant: "default"
                });
              }
            })
            .subscribe();

          return () => {
            supabase.removeChannel(workOrderChannel);
          };
        } else {
          toast({
            title: "Work Order Not Found",
            description: "We couldn't find this work order in our records.",
            variant: "destructive"
          });
          navigate('/customer-portal/work-orders');
        }
      } catch (error) {
        console.error("Error fetching work order:", error);
        toast({
          title: "Error",
          description: "Failed to load work order details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrderDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Work Order Not Found</h2>
        <p className="text-slate-600 mb-6">We couldn't find the work order you're looking for.</p>
        <Button onClick={() => navigate('/customer-portal/work-orders')}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Work Orders
        </Button>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'PPP');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => navigate('/customer-portal/work-orders')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Work Orders
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div>
                  <span>Work Order #{workOrder.id.substring(0, 8)}</span>
                </div>
                <WorkOrderStatusBadge status={workOrder.status} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-500">Description</h3>
                <p className="mt-1">{workOrder.description || "No description provided"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-500">Service Details</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-slate-500">Service Type</p>
                    <p>{workOrder.service_type || "General Service"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Created Date</p>
                    <p>{formatDate(workOrder.created_at)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500">Vehicle Information</h3>
                {workOrder.vehicles ? (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-slate-500">Make & Model</p>
                      <p>{workOrder.vehicles.year} {workOrder.vehicles.make} {workOrder.vehicles.model}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Color</p>
                      <p>{workOrder.vehicles.color || "Not specified"}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm italic text-slate-500 mt-2">No vehicle information available</p>
                )}
              </div>

              {workOrder.estimated_hours && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Estimated Time</h3>
                  <div className="flex items-center mt-1">
                    <Clock className="h-4 w-4 text-slate-400 mr-2" />
                    <p>{workOrder.estimated_hours} hours</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>
                <span>Work Order Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-8 before:absolute before:inset-0 before:left-5 before:h-full before:w-0.5 before:-ml-px before:bg-gradient-to-b before:from-blue-500 before:via-blue-500 before:to-slate-200">
                <div className="relative flex items-center">
                  <div className="absolute left-0 rounded-full bg-blue-500 text-white flex items-center justify-center h-10 w-10">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="ml-14">
                    <div className="font-semibold">Work Order Created</div>
                    <div className="text-sm text-slate-500">{formatDate(workOrder.created_at)}</div>
                  </div>
                </div>
                
                {workOrder.start_time && (
                  <div className="relative flex items-center">
                    <div className="absolute left-0 rounded-full bg-blue-500 text-white flex items-center justify-center h-10 w-10">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="ml-14">
                      <div className="font-semibold">Work Started</div>
                      <div className="text-sm text-slate-500">{formatDate(workOrder.start_time)}</div>
                    </div>
                  </div>
                )}
                
                {workOrder.status === "completed" && workOrder.end_time && (
                  <div className="relative flex items-center">
                    <div className="absolute left-0 rounded-full bg-green-500 text-white flex items-center justify-center h-10 w-10">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="ml-14">
                      <div className="font-semibold">Work Completed</div>
                      <div className="text-sm text-slate-500">{formatDate(workOrder.end_time)}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Section */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => setShowChat(!showChat)}>
              <CardTitle className="flex justify-between items-center">
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  <span>Message Technician</span>
                </div>
                <Badge variant={showChat ? "default" : "outline"}>
                  {showChat ? "Hide Chat" : "Open Chat"}
                </Badge>
              </CardTitle>
            </CardHeader>
            {showChat && (
              <CardContent>
                <CustomerChatPanel workOrderId={workOrder.id} />
              </CardContent>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {/* Work Order Technician */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                <span>Assigned Technician</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workOrder.technician ? (
                <div className="flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <User className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="font-medium">{workOrder.technician}</p>
                  <Button 
                    onClick={() => setShowChat(true)}
                    variant="outline" 
                    className="mt-3 w-full"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              ) : (
                <p className="text-center text-slate-500 py-2">No technician assigned yet</p>
              )}
            </CardContent>
          </Card>
          
          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                <span>Documents</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="bg-slate-50 border rounded p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">Service Estimate</p>
                  <p className="text-sm text-slate-500">PDF - 48KB</p>
                </div>
                <Button size="sm" variant="outline">View</Button>
              </div>
              <div className="bg-slate-50 border rounded p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">Work Order Form</p>
                  <p className="text-sm text-slate-500">PDF - 65KB</p>
                </div>
                <Button size="sm" variant="outline">View</Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Latest Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Latest Updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* This will be populated from notifications */}
              <p className="text-sm text-slate-500">Real-time updates will appear here</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
