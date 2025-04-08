
import { supabase } from '@/lib/supabase';
import { FormBuilderTemplate, FormBuilderSection, FormBuilderField } from '@/types/formBuilder';
import { v4 as uuidv4 } from 'uuid';

// Save a complete form template with sections and fields
export async function saveFormTemplate(template: FormBuilderTemplate): Promise<FormBuilderTemplate | null> {
  try {
    // Create or update template
    const templateData = {
      name: template.name,
      description: template.description,
      category: template.category,
      is_published: template.isPublished,
      version: template.version
    };
    
    let templateId = template.id;
    
    if (templateId === 'new' || !templateId) {
      // Create new template
      templateId = uuidv4();
      const { error } = await supabase.from('form_templates')
        .insert({
          ...templateData,
          id: templateId,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });
      
      if (error) throw error;
    } else {
      // Update existing template
      const { error } = await supabase.from('form_templates')
        .update(templateData)
        .eq('id', templateId);
      
      if (error) throw error;
      
      // Delete existing sections and fields - we'll recreate them
      await deleteSectionsByTemplateId(templateId);
    }

    // Insert sections
    for (const section of template.sections) {
      const sectionId = await saveFormSection({
        ...section,
        templateId
      });
      
      if (!sectionId) continue;
      
      // Insert fields for this section
      for (const field of section.fields) {
        await saveFormField({
          ...field,
          sectionId
        });
      }
    }

    // Get the saved template with all its sections and fields
    return await getFormTemplate(templateId);

  } catch (error) {
    console.error('Error saving form template:', error);
    return null;
  }
}

// Save a form section
async function saveFormSection(section: FormBuilderSection): Promise<string | null> {
  try {
    const sectionData = {
      template_id: section.templateId,
      title: section.title,
      description: section.description,
      display_order: section.displayOrder
    };
    
    const sectionId = section.id === 'new' ? uuidv4() : section.id;
    
    const { error } = await supabase.from('form_sections')
      .insert({
        ...sectionData,
        id: sectionId
      });
    
    if (error) throw error;
    
    return sectionId;
  } catch (error) {
    console.error('Error saving form section:', error);
    return null;
  }
}

// Save a form field
async function saveFormField(field: FormBuilderField): Promise<string | null> {
  try {
    const fieldData = {
      section_id: field.sectionId,
      label: field.label,
      field_type: field.fieldType,
      placeholder: field.placeholder,
      help_text: field.helpText,
      is_required: field.isRequired,
      display_order: field.displayOrder,
      options: field.options ? JSON.stringify(field.options) : null,
      default_value: field.defaultValue,
      validation_rules: field.validationRules ? JSON.stringify(field.validationRules) : null
    };
    
    const fieldId = field.id === 'new' ? uuidv4() : field.id;
    
    const { error } = await supabase.from('form_fields')
      .insert({
        ...fieldData,
        id: fieldId
      });
    
    if (error) throw error;
    
    return fieldId;
  } catch (error) {
    console.error('Error saving form field:', error);
    return null;
  }
}

// Delete sections and their fields by template ID
async function deleteSectionsByTemplateId(templateId: string): Promise<void> {
  try {
    // Get all section IDs for this template
    const { data: sections, error: sectionsError } = await supabase.from('form_sections')
      .select('id')
      .eq('template_id', templateId);
    
    if (sectionsError) throw sectionsError;
    
    // Delete the sections (fields will be cascaded due to FK constraint)
    if (sections && sections.length > 0) {
      const { error: deleteError } = await supabase.from('form_sections')
        .delete()
        .eq('template_id', templateId);
      
      if (deleteError) throw deleteError;
    }
  } catch (error) {
    console.error('Error deleting sections:', error);
  }
}

// Get a form template with all its sections and fields
export async function getFormTemplate(templateId: string): Promise<FormBuilderTemplate | null> {
  try {
    // Get the template
    const { data: templateData, error: templateError } = await supabase.from('form_templates')
      .select('*')
      .eq('id', templateId)
      .single();
    
    if (templateError) throw templateError;
    if (!templateData) return null;
    
    // Get all sections for this template
    const { data: sections, error: sectionsError } = await supabase.from('form_sections')
      .select('*')
      .eq('template_id', templateId)
      .order('display_order', { ascending: true });
    
    if (sectionsError) throw sectionsError;
    
    const processedSections: FormBuilderSection[] = [];
    
    // Get fields for each section
    for (const section of sections || []) {
      const { data: fields, error: fieldsError } = await supabase.from('form_fields')
        .select('*')
        .eq('section_id', section.id)
        .order('display_order', { ascending: true });
      
      if (fieldsError) throw fieldsError;
      
      const processedFields: FormBuilderField[] = (fields || []).map(field => ({
        id: field.id,
        sectionId: field.section_id,
        label: field.label,
        fieldType: field.field_type,
        placeholder: field.placeholder,
        helpText: field.help_text,
        isRequired: field.is_required,
        displayOrder: field.display_order,
        options: field.options ? JSON.parse(field.options) : undefined,
        defaultValue: field.default_value,
        validationRules: field.validation_rules ? JSON.parse(field.validation_rules) : undefined
      }));
      
      processedSections.push({
        id: section.id,
        templateId: section.template_id,
        title: section.title,
        description: section.description,
        displayOrder: section.display_order,
        fields: processedFields
      });
    }
    
    return {
      id: templateData.id,
      name: templateData.name,
      description: templateData.description,
      category: templateData.category,
      isPublished: templateData.is_published,
      version: templateData.version,
      sections: processedSections
    };
    
  } catch (error) {
    console.error('Error getting form template:', error);
    return null;
  }
}

// Get all form templates (without sections and fields)
export async function getAllFormTemplates(): Promise<Partial<FormBuilderTemplate>[]> {
  try {
    const { data, error } = await supabase.from('form_templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      isPublished: template.is_published,
      version: template.version
    }));
    
  } catch (error) {
    console.error('Error getting form templates:', error);
    return [];
  }
}

// Delete a form template and all its sections and fields
export async function deleteFormTemplate(templateId: string): Promise<boolean> {
  try {
    // The sections and fields will be deleted automatically due to CASCADE
    const { error } = await supabase.from('form_templates')
      .delete()
      .eq('id', templateId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting form template:', error);
    return false;
  }
}
