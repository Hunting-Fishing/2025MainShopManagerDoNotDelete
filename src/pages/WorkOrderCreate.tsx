
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm";
import { WorkOrderPageLayout } from "@/components/work-orders/WorkOrderPageLayout";
import { supabase } from "@/lib/supabase";

export default function WorkOrderCreate() {
  const navigate = useNavigate();
  const [technicians, setTechnicians] = useState<string[]>([]);
  const [isLoadingTechnicians, setIsLoadingTechnicians] = useState(true);
  
  useEffect(() => {
    // Fetch technicians from Supabase if possible
    const fetchTechnicians = async () => {
      try {
        setIsLoadingTechnicians(true);
        
        // Try to fetch technicians from the profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .eq('role', 'technician')
          .order('last_name', { ascending: true });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const techNames = data.map(tech => `${tech.first_name} ${tech.last_name}`);
          setTechnicians(techNames);
        } else {
          // Fallback to example data
          setTechnicians(["John Doe", "Jane Smith", "Bob Johnson"]);
        }
      } catch (error) {
        console.error("Error fetching technicians:", error);
        // Fallback to example technicians
        setTechnicians(["John Doe", "Jane Smith", "Bob Johnson"]);
      } finally {
        setIsLoadingTechnicians(false);
      }
    };
    
    fetchTechnicians();
  }, []);
  
  return (
    <WorkOrderPageLayout
      title="Create Work Order"
      description="Create a new work order for your customer"
      backLink="/work-orders"
      backLinkText="Back to Work Orders"
    >
      <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow">
        <WorkOrderForm 
          technicians={technicians} 
          isLoadingTechnicians={isLoadingTechnicians}
        />
      </div>
    </WorkOrderPageLayout>
  );
}
