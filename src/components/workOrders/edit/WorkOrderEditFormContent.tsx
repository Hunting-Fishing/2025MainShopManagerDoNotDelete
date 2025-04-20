import React, { useState, useEffect } from "react";
import { Form } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Customer, adaptCustomerForUI } from "@/types/customer";

// Import components
import { CustomerInfoSection } from "@/components/workOrders/CustomerInfoSection";
import { WorkOrderStatusSection } from "@/components/workOrders/WorkOrderStatusSection";
import { AssignmentSection } from "@/components/workOrders/AssignmentSection";
import { NotesSection } from "@/components/workOrders/NotesSection";
import { WorkOrderInventoryField } from "@/components/workOrders/inventory/WorkOrderInventoryField";
import { EditFormActions } from "@/components/workOrders/edit/EditFormActions";

interface WorkOrderEditFormContentProps {
  workOrderId: string;
  technicians: string[];
  form: any;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  error?: string | null;
}

export const WorkOrderEditFormContent: React.FC<WorkOrderEditFormContentProps> = ({
  workOrderId,
  technicians,
  form,
  onSubmit,
  isSubmitting,
  error
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  // Fetch customers data for the form
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('last_name', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Apply adaptCustomerForUI to normalize each customer record
          setCustomers(data.map(customer => adaptCustomerForUI(customer)));
        }
      } catch (err) {
        console.error("Error fetching customers:", err);
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <Card className="p-6">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <CustomerInfoSection form={form as any} customers={customers} isLoading={loadingCustomers} />
            
            {/* Status & Priority */}
            <WorkOrderStatusSection form={form as any} />
            
            {/* Assignment */}
            <AssignmentSection form={form as any} technicians={technicians} />
            
            {/* Notes */}
            <NotesSection form={form as any} />

            {/* Inventory Items */}
            <WorkOrderInventoryField form={form as any} />
          </div>

          {/* Form Actions */}
          <EditFormActions 
            workOrderId={workOrderId}
            isSubmitting={isSubmitting} 
          />
        </form>
      </Form>
    </Card>
  );
};
