
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm";
import { WorkOrderPageLayout } from "@/components/work-orders/WorkOrderPageLayout";
import { supabase } from "@/lib/supabase";
import { useTechnicians } from "@/hooks/useTechnicians";
import { WorkOrderFormHeader } from "@/components/work-orders/WorkOrderFormHeader";
import { Button } from "@/components/ui/button";

export default function WorkOrderCreate() {
  const navigate = useNavigate();
  const { technicians, isLoading: isLoadingTechnicians } = useTechnicians();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  return (
    <WorkOrderPageLayout
      title="Create Work Order"
      description="Create a new work order for your customer"
      backLink="/work-orders"
      backLinkText="Back to Work Orders"
      actions={
        <Button 
          type="submit"
          form="work-order-form"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {isSubmitting ? "Creating..." : "Create Work Order"}
        </Button>
      }
    >
      <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow">
        <WorkOrderFormHeader 
          isSubmitting={isSubmitting}
          error={error}
        />
        <WorkOrderForm 
          technicians={technicians.map(tech => tech.name)} 
          isLoadingTechnicians={isLoadingTechnicians}
          setIsSubmitting={setIsSubmitting}
          setError={setError}
          id="work-order-form"
        />
      </div>
    </WorkOrderPageLayout>
  );
}
