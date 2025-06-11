
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MessageSquare, Plus, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { WorkOrder } from '@/types/workOrder';
import { CommunicationHistory } from './CommunicationHistory';
import { SendSmsDialog } from './SendSmsDialog';
import { MakeCallDialog } from './MakeCallDialog';
import { RecordCommunicationDialog } from './RecordCommunicationDialog';

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

interface WorkOrderCommunicationsProps {
  workOrder: WorkOrder;
}

export function WorkOrderCommunications({ workOrder }: WorkOrderCommunicationsProps) {
  const [communications, setCommunications] = useState<CustomerCommunication[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendSmsOpen, setSendSmsOpen] = useState(false);
  const [makeCallOpen, setMakeCallOpen] = useState(false);
  const [recordCommOpen, setRecordCommOpen] = useState(false);

  const fetchCommunications = async () => {
    if (!workOrder.customer_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customer_communications')
        .select('*')
        .eq('customer_id', workOrder.customer_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Type cast the database response to match our interface
      const typedCommunications: CustomerCommunication[] = (data || []).map(comm => ({
        ...comm,
        type: comm.type as 'email' | 'phone' | 'text' | 'in-person',
        direction: comm.direction as 'inbound' | 'outbound',
        status: comm.status as 'pending' | 'sent' | 'delivered' | 'failed' | 'completed'
      }));

      setCommunications(typedCommunications);
    } catch (error) {
      console.error('Error fetching communications:', error);
      toast({
        title: "Error",
        description: "Failed to load communication history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunications();
  }, [workOrder.customer_id]);

  const handleCommunicationSuccess = () => {
    fetchCommunications();
    setSendSmsOpen(false);
    setMakeCallOpen(false);
    setRecordCommOpen(false);
  };

  if (!workOrder.customer_id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Communications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No customer associated with this work order.</p>
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSendSmsOpen(true)}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Send SMS
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMakeCallOpen(true)}
                className="flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                Make Call
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRecordCommOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Record Communication
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CommunicationHistory 
            communications={communications}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <SendSmsDialog
        open={sendSmsOpen}
        onOpenChange={setSendSmsOpen}
        customerId={workOrder.customer_id}
        customerName={workOrder.customer_name || 'Customer'}
        phoneNumber={workOrder.customer_phone || ''}
        workOrderId={workOrder.id}
        onSuccess={handleCommunicationSuccess}
      />

      <MakeCallDialog
        open={makeCallOpen}
        onOpenChange={setMakeCallOpen}
        customerId={workOrder.customer_id}
        customerName={workOrder.customer_name || 'Customer'}
        phoneNumber={workOrder.customer_phone || ''}
        workOrderId={workOrder.id}
        onSuccess={handleCommunicationSuccess}
      />

      <RecordCommunicationDialog
        open={recordCommOpen}
        onOpenChange={setRecordCommOpen}
        customerId={workOrder.customer_id}
        customerName={workOrder.customer_name || 'Customer'}
        workOrderId={workOrder.id}
        onSuccess={handleCommunicationSuccess}
      />
    </div>
  );
}
