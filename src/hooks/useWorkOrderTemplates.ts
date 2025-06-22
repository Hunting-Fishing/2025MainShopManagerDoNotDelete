
import { useState, useCallback, useEffect } from "react";
import { WorkOrderTemplate } from "@/types/workOrder";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const useWorkOrderTemplates = () => {
  const [templates, setTemplates] = useState<WorkOrderTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('work_order_templates')
        .select('*')
        .order('usage_count', { ascending: false });

      if (fetchError) throw fetchError;

      const formattedTemplates: WorkOrderTemplate[] = (data || []).map(template => ({
        id: template.id,
        name: template.name,
        description: template.description || "",
        status: template.status || "pending",
        priority: template.priority || "medium", 
        technician: template.technician || "",
        notes: template.notes || "",
        usage_count: template.usage_count || 0,
        last_used: template.last_used || "",
        created_at: template.created_at || new Date().toISOString(),
        updated_at: template.updated_at || new Date().toISOString()
      }));

      setTemplates(formattedTemplates);
    } catch (err) {
      console.error("Failed to load templates:", err);
      setError("Failed to load work order templates");
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);
  
  const handleApplyTemplate = useCallback(async (template: WorkOrderTemplate) => {
    try {
      // Update template usage count in database
      const { error } = await supabase
        .from('work_order_templates')
        .update({ 
          usage_count: (template.usage_count || 0) + 1,
          last_used: new Date().toISOString()
        })
        .eq('id', template.id);

      if (error) throw error;

      // Update local state
      setTemplates(prev => prev.map(t => 
        t.id === template.id 
          ? { ...t, usage_count: (t.usage_count || 0) + 1, last_used: new Date().toISOString() }
          : t
      ));

      return template;
    } catch (err) {
      console.error("Failed to update template usage:", err);
      toast.error("Failed to update template usage");
      return template;
    }
  }, []);
  
  const handleSaveTemplate = useCallback(async (newTemplate: Omit<WorkOrderTemplate, "id" | "usage_count" | "created_at" | "updated_at">) => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('work_order_templates')
        .insert({
          name: newTemplate.name,
          description: newTemplate.description,
          status: newTemplate.status,
          priority: newTemplate.priority,
          technician: newTemplate.technician,
          notes: newTemplate.notes,
          usage_count: 0,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (error) throw error;

      const savedTemplate: WorkOrderTemplate = {
        id: data.id,
        name: data.name,
        description: data.description || "",
        status: data.status || "pending",
        priority: data.priority || "medium",
        technician: data.technician || "",
        notes: data.notes || "",
        usage_count: 0,
        last_used: "",
        created_at: data.created_at || now,
        updated_at: data.updated_at || now
      };
      
      setTemplates(prev => [...prev, savedTemplate]);
      toast.success("Template saved successfully");
      return savedTemplate;
    } catch (err) {
      console.error("Failed to save template:", err);
      toast.error("Failed to save template");
      throw err;
    }
  }, []);
  
  return {
    templates,
    loading,
    error,
    handleApplyTemplate,
    handleSaveTemplate,
    refreshTemplates: loadTemplates
  };
};
