
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, MessageSquare, History, Plus } from 'lucide-react';
import { WorkOrder } from '@/types/workOrder';
import { CommunicationHistory } from './CommunicationHistory';
import { SendSmsDialog } from './SendSmsDialog';
import { MakeCallDialog } from './MakeCallDialog';
import { RecordCommunicationDialog } from './RecordCommunicationDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface WorkOrderCommunicationsProps {
  workOrder: WorkOrder;
}

interface CustomerCommunication {
  id: string;
  customer_id: string;
  date: string;
  type: 'email' | 'phone' | 'text' | 'in-person';
  direction: 'inbound' | 'outbound';
  subject?: string;
  content: string;
  staff_member_id: string;
  staff_member_name: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'completed';
  template_id?: string;
  template_name?: string;
  created_at: string;
  updated_at: string;
}

export function WorkOrderCommunications({ workOrder }: WorkOrderCommunicationsProps) {
  const [communications, setCommunications] = useState<CustomerCommunication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSmsDialog, setShowSmsDialog] = useState(false);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [showRecordDialog, setShowRecordDialog] = useState(false);

  // Get customer info from work order
  const customerId = workOrder.customer_id;
  const customerName = workOrder.customer_name || workOrder.customer || 'Unknown Customer';
  const customerPhone = workOrder.customer_phone || '';
  const customerEmail = workOrder.customer_email || '';

  useEffect(() => {
    if (customerId) {
      fetchCommunications();
    }
  }, [customerId]);

  const fetchCommunications = async () => {
    try {
      setLoading(true);
      console.log('Fetching communications for customer:', customerId);

      const { data, error } = await supabase
        .from('customer_communications')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching communications:', error);
        throw error;
      }

      console.log('Communications fetched:', data);
      setCommunications(data || []);
    } catch (error) {
      console.error('Error fetching communications:', error);
      toast({
        title: "Error",
        description: "Failed to load communications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCommunicationSent = () => {
    fetchCommunications();
    toast({
      title: "Success",
      description: "Communication sent successfully",
    });
  };

  const handleCommunicationRecorded = () => {
    fetchCommunications();
    toast({
      title: "Success",
      description: "Communication recorded successfully",
    });
  };

  if (!customerId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Communications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No customer assigned to this work order.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Customer Communications</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSmsDialog(true)}
                disabled={!customerPhone}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Send SMS
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCallDialog(true)}
                disabled={!customerPhone}
              >
                <Phone className="h-4 w-4 mr-2" />
                Make Call
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRecordDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Record Communication
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Communication History
              </TabsTrigger>
            </TabsList>
            <TabsContent value="history" className="mt-4">
              <CommunicationHistory 
                communications={communications}
                loading={loading}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* SMS Dialog */}
      <SendSmsDialog
        open={showSmsDialog}
        onOpenChange={setShowSmsDialog}
        customerId={customerId}
        customerName={customerName}
        phoneNumber={customerPhone}
        workOrderId={workOrder.id}
        onSuccess={handleCommunicationSent}
      />

      {/* Call Dialog */}
      <MakeCallDialog
        open={showCallDialog}
        onOpenChange={setShowCallDialog}
        customerId={customerId}
        customerName={customerName}
        phoneNumber={customerPhone}
        workOrderId={workOrder.id}
        onSuccess={handleCommunicationSent}
      />

      {/* Record Communication Dialog */}
      <RecordCommunicationDialog
        open={showRecordDialog}
        onOpenChange={setShowRecordDialog}
        customerId={customerId}
        customerName={customerName}
        customerEmail={customerEmail}
        customerPhone={customerPhone}
        workOrderId={workOrder.id}
        onSuccess={handleCommunicationRecorded}
      />
    </div>
  );
}
