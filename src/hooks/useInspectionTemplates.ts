import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type {
  InspectionFormTemplate,
  InspectionFormSection,
  InspectionFormItem,
  CreateInspectionFormTemplate,
  AssetType,
} from '@/types/inspectionTemplate';

// Fetch all templates
export function useInspectionTemplates(assetType?: AssetType) {
  return useQuery({
    queryKey: ['inspection-templates', assetType],
    queryFn: async () => {
      let query = supabase
        .from('inspection_form_templates')
        .select('*')
        .order('asset_type')
        .order('is_base_template', { ascending: false })
        .order('name');

      if (assetType) {
        query = query.eq('asset_type', assetType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as InspectionFormTemplate[];
    },
  });
}

// Fetch single template with sections and items
export function useInspectionTemplate(templateId: string | undefined) {
  return useQuery({
    queryKey: ['inspection-template', templateId],
    queryFn: async () => {
      if (!templateId) return null;

      // Fetch template
      const { data: template, error: templateError } = await supabase
        .from('inspection_form_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;

      // Fetch sections
      const { data: sections, error: sectionsError } = await supabase
        .from('inspection_form_sections')
        .select('*')
        .eq('template_id', templateId)
        .order('display_order');

      if (sectionsError) throw sectionsError;

      // Fetch items for all sections
      const sectionIds = sections.map((s) => s.id);
      let items: InspectionFormItem[] = [];
      
      if (sectionIds.length > 0) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('inspection_form_items')
          .select('*')
          .in('section_id', sectionIds)
          .order('display_order');

        if (itemsError) throw itemsError;
        items = itemsData as InspectionFormItem[];
      }

      // Combine sections with their items
      const sectionsWithItems: InspectionFormSection[] = sections.map((section) => ({
        ...section,
        items: items.filter((item) => item.section_id === section.id),
      }));

      return {
        ...template,
        sections: sectionsWithItems,
      } as InspectionFormTemplate;
    },
    enabled: !!templateId,
  });
}

// Fetch base templates (for inheritance)
export function useBaseTemplates(assetType?: AssetType) {
  return useQuery({
    queryKey: ['base-inspection-templates', assetType],
    queryFn: async () => {
      let query = supabase
        .from('inspection_form_templates')
        .select('*')
        .eq('is_base_template', true)
        .eq('is_published', true)
        .order('asset_type')
        .order('name');

      if (assetType) {
        query = query.eq('asset_type', assetType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as InspectionFormTemplate[];
    },
  });
}

// Create template with sections and items
export function useCreateInspectionTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateInspectionFormTemplate) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create template
      const { data: template, error: templateError } = await supabase
        .from('inspection_form_templates')
        .insert({
          name: input.name,
          asset_type: input.asset_type,
          description: input.description,
          is_base_template: input.is_base_template ?? false,
          parent_template_id: input.parent_template_id,
          is_published: input.is_published ?? false,
          created_by: user?.id,
        })
        .select()
        .single();

      if (templateError) throw templateError;

      // Create sections and items
      for (const sectionInput of input.sections) {
        const { data: section, error: sectionError } = await supabase
          .from('inspection_form_sections')
          .insert({
            template_id: template.id,
            title: sectionInput.title,
            description: sectionInput.description,
            display_order: sectionInput.display_order,
          })
          .select()
          .single();

        if (sectionError) throw sectionError;

        // Create items for this section
        if (sectionInput.items.length > 0) {
          const itemsToInsert = sectionInput.items.map((item) => ({
            section_id: section.id,
            item_name: item.item_name,
            item_key: item.item_key,
            item_type: item.item_type,
            description: item.description,
            is_required: item.is_required ?? false,
            display_order: item.display_order,
            default_value: item.default_value,
            component_category: item.component_category,
            linked_component_type: item.linked_component_type,
            unit: item.unit,
          }));

          const { error: itemsError } = await supabase
            .from('inspection_form_items')
            .insert(itemsToInsert);

          if (itemsError) throw itemsError;
        }
      }

      return template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspection-templates'] });
      queryClient.invalidateQueries({ queryKey: ['base-inspection-templates'] });
      toast({
        title: 'Template Created',
        description: 'Inspection template has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create template: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

// Update template
export function useUpdateInspectionTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      templateId,
      updates,
    }: {
      templateId: string;
      updates: Partial<InspectionFormTemplate>;
    }) => {
      const { data, error } = await supabase
        .from('inspection_form_templates')
        .update({
          name: updates.name,
          description: updates.description,
          is_published: updates.is_published,
          version: updates.version,
        })
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inspection-templates'] });
      queryClient.invalidateQueries({ queryKey: ['inspection-template', variables.templateId] });
      toast({
        title: 'Template Updated',
        description: 'Inspection template has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update template: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

// Delete template
export function useDeleteInspectionTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('inspection_form_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspection-templates'] });
      queryClient.invalidateQueries({ queryKey: ['base-inspection-templates'] });
      toast({
        title: 'Template Deleted',
        description: 'Inspection template has been deleted.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete template: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

// Add section to template
export function useAddInspectionSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      title,
      description,
      displayOrder,
    }: {
      templateId: string;
      title: string;
      description?: string;
      displayOrder: number;
    }) => {
      const { data, error } = await supabase
        .from('inspection_form_sections')
        .insert({
          template_id: templateId,
          title,
          description,
          display_order: displayOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inspection-template', variables.templateId] });
    },
  });
}

// Update section
export function useUpdateInspectionSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sectionId,
      templateId,
      updates,
    }: {
      sectionId: string;
      templateId: string;
      updates: Partial<InspectionFormSection>;
    }) => {
      const { data, error } = await supabase
        .from('inspection_form_sections')
        .update({
          title: updates.title,
          description: updates.description,
          display_order: updates.display_order,
        })
        .eq('id', sectionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inspection-template', variables.templateId] });
    },
  });
}

// Delete section
export function useDeleteInspectionSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sectionId, templateId }: { sectionId: string; templateId: string }) => {
      const { error } = await supabase
        .from('inspection_form_sections')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inspection-template', variables.templateId] });
    },
  });
}

// Add item to section
export function useAddInspectionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sectionId,
      templateId,
      item,
    }: {
      sectionId: string;
      templateId: string;
      item: Omit<InspectionFormItem, 'id' | 'section_id' | 'created_at' | 'updated_at'>;
    }) => {
      const { data, error } = await supabase
        .from('inspection_form_items')
        .insert({
          section_id: sectionId,
          ...item,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inspection-template', variables.templateId] });
    },
  });
}

// Update item
export function useUpdateInspectionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      templateId,
      updates,
    }: {
      itemId: string;
      templateId: string;
      updates: Partial<InspectionFormItem>;
    }) => {
      const { data, error } = await supabase
        .from('inspection_form_items')
        .update({
          item_name: updates.item_name,
          item_key: updates.item_key,
          item_type: updates.item_type,
          description: updates.description,
          is_required: updates.is_required,
          display_order: updates.display_order,
          default_value: updates.default_value,
          component_category: updates.component_category,
          linked_component_type: updates.linked_component_type,
          unit: updates.unit,
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inspection-template', variables.templateId] });
    },
  });
}

// Delete item
export function useDeleteInspectionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, templateId }: { itemId: string; templateId: string }) => {
      const { error } = await supabase
        .from('inspection_form_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inspection-template', variables.templateId] });
    },
  });
}

// Get template for an asset (by asset's inspection_template_id or base template for asset_type)
export function useTemplateForAsset(inspectionTemplateId?: string, assetType?: string) {
  return useQuery({
    queryKey: ['template-for-asset', inspectionTemplateId, assetType],
    queryFn: async () => {
      // If asset has a specific template assigned, use that
      if (inspectionTemplateId) {
        const { data: template, error } = await supabase
          .from('inspection_form_templates')
          .select('*')
          .eq('id', inspectionTemplateId)
          .single();

        if (error) throw error;

        // Fetch sections and items
        const { data: sections } = await supabase
          .from('inspection_form_sections')
          .select('*')
          .eq('template_id', template.id)
          .order('display_order');

        const sectionIds = sections?.map((s) => s.id) || [];
        let items: InspectionFormItem[] = [];

        if (sectionIds.length > 0) {
          const { data: itemsData } = await supabase
            .from('inspection_form_items')
            .select('*')
            .in('section_id', sectionIds)
            .order('display_order');

          items = (itemsData as InspectionFormItem[]) || [];
        }

        const sectionsWithItems = (sections || []).map((section) => ({
          ...section,
          items: items.filter((item) => item.section_id === section.id),
        }));

        return { ...template, sections: sectionsWithItems } as InspectionFormTemplate;
      }

      // Otherwise, try to find a published base template for the asset type
      if (assetType) {
        const { data: templates, error } = await supabase
          .from('inspection_form_templates')
          .select('*')
          .eq('asset_type', assetType)
          .eq('is_base_template', true)
          .eq('is_published', true)
          .limit(1);

        if (error) throw error;

        if (templates && templates.length > 0) {
          const template = templates[0];

          // Fetch sections and items
          const { data: sections } = await supabase
            .from('inspection_form_sections')
            .select('*')
            .eq('template_id', template.id)
            .order('display_order');

          const sectionIds = sections?.map((s) => s.id) || [];
          let items: InspectionFormItem[] = [];

          if (sectionIds.length > 0) {
            const { data: itemsData } = await supabase
              .from('inspection_form_items')
              .select('*')
              .in('section_id', sectionIds)
              .order('display_order');

            items = (itemsData as InspectionFormItem[]) || [];
          }

          const sectionsWithItems = (sections || []).map((section) => ({
            ...section,
            items: items.filter((item) => item.section_id === section.id),
          }));

          return { ...template, sections: sectionsWithItems } as InspectionFormTemplate;
        }
      }

      return null;
    },
    enabled: !!(inspectionTemplateId || assetType),
  });
}
