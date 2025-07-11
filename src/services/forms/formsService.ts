import { supabase } from '@/integrations/supabase/client';
import type { FormTemplate } from '@/types/form';

export async function getFormTemplates(): Promise<FormTemplate[]> {
  const { data, error } = await supabase
    .from('form_templates')
    .select(`
      *,
      form_sections(*),
      form_fields(*)
    `)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching form templates:', error);
    throw error;
  }

  return (data || []).map(template => ({
    ...template,
    content: { sections: [] }, // Default content structure
    tags: [] // Default empty tags
  }));
}

export async function getFormTemplate(id: string): Promise<FormTemplate | null> {
  const { data, error } = await supabase
    .from('form_templates')
    .select(`
      *,
      form_sections(*),
      form_fields(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching form template:', error);
    return null;
  }

  return {
    ...data,
    content: { sections: [] }, // Default content structure
    tags: [] // Default empty tags
  };
}

export async function createFormTemplate(template: Omit<FormTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<FormTemplate> {
  const { data, error } = await supabase
    .from('form_templates')
    .insert(template)
    .select()
    .single();

  if (error) {
    console.error('Error creating form template:', error);
    throw error;
  }

  return {
    ...data,
    content: { sections: [] }, // Default content structure  
    tags: [] // Default empty tags
  };
}

export async function updateFormTemplate(id: string, updates: Partial<FormTemplate>): Promise<FormTemplate> {
  const { data, error } = await supabase
    .from('form_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating form template:', error);
    throw error;
  }

  return {
    ...data,
    content: { sections: [] }, // Default content structure
    tags: [] // Default empty tags
  };
}

export async function deleteFormTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('form_templates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting form template:', error);
    throw error;
  }
}

export async function publishFormTemplate(id: string, isPublished: boolean): Promise<void> {
  const { error } = await supabase
    .from('form_templates')
    .update({ is_published: isPublished })
    .eq('id', id);

  if (error) {
    console.error('Error publishing form template:', error);
    throw error;
  }
}

export async function getFormSubmissions(templateId?: string) {
  let query = supabase
    .from('form_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (templateId) {
    query = query.eq('template_id', templateId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching form submissions:', error);
    throw error;
  }

  return data || [];
}

export async function getFormCategories(): Promise<{ category: string; count: number }[]> {
  const { data, error } = await supabase
    .from('form_templates')
    .select('category')
    .not('category', 'is', null);

  if (error) {
    console.error('Error fetching form categories:', error);
    return [];
  }

  // Count occurrences of each category
  const categoryCount: Record<string, number> = {};
  data.forEach(item => {
    if (item.category) {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    }
  });

  return Object.entries(categoryCount).map(([category, count]) => ({
    category,
    count
  }));
}