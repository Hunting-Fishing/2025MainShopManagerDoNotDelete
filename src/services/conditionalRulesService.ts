import { supabase } from '@/integrations/supabase/client';
import { ConditionalRule, ConditionOperator, ConditionType } from '@/types/formBuilder';

interface DbConditionalRule {
  id: string;
  form_field_id: string;
  condition_field_id: string;
  condition_type: string;
  condition_operator: string;
  condition_value: string;
  created_at: string | null;
  updated_at: string | null;
}

// Transform database row to ConditionalRule
function toConditionalRule(row: DbConditionalRule): ConditionalRule {
  return {
    id: row.id,
    formFieldId: row.form_field_id,
    conditionFieldId: row.condition_field_id,
    conditionType: row.condition_type as ConditionType,
    conditionOperator: row.condition_operator as ConditionOperator,
    conditionValue: row.condition_value,
  };
}

// Transform ConditionalRule to database insert format
function toDbFormat(rule: ConditionalRule) {
  return {
    id: rule.id,
    form_field_id: rule.formFieldId,
    condition_field_id: rule.conditionFieldId,
    condition_type: rule.conditionType,
    condition_operator: rule.conditionOperator,
    condition_value: rule.conditionValue,
  };
}

export async function getConditionalRules(fieldId: string): Promise<ConditionalRule[]> {
  const { data, error } = await supabase
    .from('form_conditional_rules')
    .select('*')
    .eq('form_field_id', fieldId);

  if (error) {
    console.error('Error fetching conditional rules:', error);
    return [];
  }

  return (data || []).map(toConditionalRule);
}

export async function saveConditionalRules(
  fieldId: string,
  rules: ConditionalRule[]
): Promise<boolean> {
  try {
    // First, delete existing rules for this field
    const { error: deleteError } = await supabase
      .from('form_conditional_rules')
      .delete()
      .eq('form_field_id', fieldId);

    if (deleteError) {
      console.error('Error deleting existing rules:', deleteError);
      return false;
    }

    // If no new rules, we're done
    if (rules.length === 0) {
      return true;
    }

    // Insert new rules
    const dbRules = rules.map(toDbFormat);
    const { error: insertError } = await supabase
      .from('form_conditional_rules')
      .insert(dbRules);

    if (insertError) {
      console.error('Error inserting conditional rules:', insertError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving conditional rules:', error);
    return false;
  }
}

export async function deleteConditionalRules(fieldId: string): Promise<boolean> {
  const { error } = await supabase
    .from('form_conditional_rules')
    .delete()
    .eq('form_field_id', fieldId);

  if (error) {
    console.error('Error deleting conditional rules:', error);
    return false;
  }

  return true;
}

export async function getConditionalRulesForTemplate(
  templateId: string
): Promise<Map<string, ConditionalRule[]>> {
  const rulesMap = new Map<string, ConditionalRule[]>();

  const { data: sections, error: sectionsError } = await supabase
    .from('form_sections')
    .select('id')
    .eq('template_id', templateId);

  if (sectionsError) {
    console.error('Error fetching form sections:', sectionsError);
    return rulesMap;
  }

  const sectionIds = (sections || []).map(section => section.id);
  if (sectionIds.length === 0) {
    return rulesMap;
  }

  const { data: fields, error: fieldsError } = await supabase
    .from('form_fields')
    .select('id')
    .in('section_id', sectionIds);

  if (fieldsError) {
    console.error('Error fetching form fields:', fieldsError);
    return rulesMap;
  }

  const fieldIds = (fields || []).map(field => field.id);
  if (fieldIds.length === 0) {
    return rulesMap;
  }

  const { data: rules, error: rulesError } = await supabase
    .from('form_conditional_rules')
    .select('*')
    .in('form_field_id', fieldIds);

  if (rulesError) {
    console.error('Error fetching template conditional rules:', rulesError);
    return rulesMap;
  }

  (rules || []).forEach(rule => {
    const mappedRule = toConditionalRule(rule as DbConditionalRule);
    const existing = rulesMap.get(mappedRule.formFieldId) || [];
    existing.push(mappedRule);
    rulesMap.set(mappedRule.formFieldId, existing);
  });

  return rulesMap;
}
