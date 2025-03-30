
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useCustomerDetails } from "@/hooks/useCustomerDetails";
import { AddInteractionDialog } from "@/components/interactions/AddInteractionDialog";
import { CustomerDetailsHeader } from "@/components/customers/details/CustomerDetailsHeader";
import { CustomerDetailsTabs } from "@/components/customers/CustomerDetailsTabs";
import { CustomerCommunication } from "@/types/customer";
import { supabase } from "@/integrations/supabase/client";

export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const {
    customer,
    customerWorkOrders,
    customerInteractions,
    loading,
    addInteractionOpen,
    setAddInteractionOpen,
    activeTab,
    setActiveTab,
    handleInteractionAdded
  } = useCustomerDetails(id);

  const [customerCommunications, setCustomerCommunications] = useState<CustomerCommunication[]>([]);
  const [customerNotes, setCustomerNotes] = useState<any[]>([]);
  const [loadingCommunications, setLoadingCommunications] = useState(true);

  // Fetch communications when customer ID changes
  useEffect(() => {
    if (id) {
      fetchCustomerCommunications(id);
      // In a real implementation, we would also fetch customer notes here
    }
  }, [id]);

  const fetchCustomerCommunications = async (customerId: string) => {
    setLoadingCommunications(true);
    try {
      const { data, error } = await supabase
        .from('customer_communications')
        .select('*')
        .eq('customer_id', customerId)
        .order('date', { ascending: false });

      if (error) throw error;
      setCustomerCommunications(data || []);
    } catch (error) {
      console.error("Error fetching communications:", error);
    } finally {
      setLoadingCommunications(false);
    }
  };

  const handleCommunicationAdded = async (communication: CustomerCommunication) => {
    try {
      // In a real implementation, this would be a more complete insert with error handling
      const { data, error } = await supabase
        .from('customer_communications')
        .insert([
          {
            customer_id: communication.customer_id,
            type: communication.type,
            direction: communication.direction,
            subject: communication.subject,
            content: communication.content,
            staff_member_id: communication.staff_member_id,
            staff_member_name: communication.staff_member_name,
            status: communication.status,
            template_id: communication.template_id,
            template_name: communication.template_name
          }
        ])
        .select();

      if (error) throw error;

      // Add the new communication to the state
      if (data && data.length > 0) {
        setCustomerCommunications(prev => [data[0], ...prev]);
      }
    } catch (error) {
      console.error("Error adding communication:", error);
    }
  };

  const handleNoteAdded = (note: any) => {
    // In a real implementation, this would save the note to Supabase
    setCustomerNotes(prev => [note, ...prev]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-lg text-slate-500">Loading customer details...</div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="space-y-6">
      <CustomerDetailsHeader 
        customer={customer}
        setAddInteractionOpen={setAddInteractionOpen}
      />

      <CustomerDetailsTabs
        customer={customer}
        customerWorkOrders={customerWorkOrders}
        customerInteractions={customerInteractions}
        customerCommunications={customerCommunications}
        customerNotes={customerNotes}
        setAddInteractionOpen={setAddInteractionOpen}
        onCommunicationAdded={handleCommunicationAdded}
        onNoteAdded={handleNoteAdded}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      {customer && (
        <AddInteractionDialog
          customer={customer}
          open={addInteractionOpen}
          onOpenChange={setAddInteractionOpen}
          onInteractionAdded={handleInteractionAdded}
        />
      )}
    </div>
  );
}
