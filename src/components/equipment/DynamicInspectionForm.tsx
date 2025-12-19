import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { GYRSelector, GYRLegend } from './GYRSelector';
import { GYRStatus } from '@/hooks/useEquipmentInspections';
import type { 
  InspectionFormTemplate, 
  InspectionFormSection, 
  InspectionFormItem,
  InspectionDataValue 
} from '@/types/inspectionTemplate';

interface DynamicInspectionFormProps {
  template: InspectionFormTemplate;
  values: Record<string, InspectionDataValue>;
  onChange: (values: Record<string, InspectionDataValue>) => void;
}

export function DynamicInspectionForm({ template, values, onChange }: DynamicInspectionFormProps) {
  const handleValueChange = (item: InspectionFormItem, newValue: string | number | boolean | null) => {
    onChange({
      ...values,
      [item.item_key]: {
        item_key: item.item_key,
        item_type: item.item_type,
        value: newValue,
      },
    });
  };

  const getValue = (itemKey: string) => {
    return values[itemKey]?.value ?? null;
  };

  const getCardClassName = (status: number | null) => {
    if (status === 1) return 'border-red-500 bg-red-50 dark:bg-red-950/30';
    if (status === 2) return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30';
    return '';
  };

  const renderItem = (item: InspectionFormItem) => {
    const currentValue = getValue(item.item_key);

    switch (item.item_type) {
      case 'gyr_status':
        return (
          <Card 
            key={item.id} 
            className={`p-4 space-y-3 transition-colors ${getCardClassName(currentValue as number)}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <Label className="text-base font-medium">{item.item_name}</Label>
                {item.description && (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                )}
              </div>
              <GYRSelector 
                value={(currentValue as GYRStatus) ?? 3} 
                onChange={(val) => handleValueChange(item, val)} 
              />
            </div>
            {(currentValue as number) !== 3 && currentValue !== null && (
              <Textarea
                placeholder={`Describe issues with ${item.item_name.toLowerCase()}...`}
                value={(values[`${item.item_key}_notes`]?.value as string) ?? ''}
                onChange={(e) => onChange({
                  ...values,
                  [item.item_key]: values[item.item_key],
                  [`${item.item_key}_notes`]: {
                    item_key: `${item.item_key}_notes`,
                    item_type: 'text',
                    value: e.target.value,
                  },
                })}
                className="mt-2"
              />
            )}
          </Card>
        );

      case 'text':
        return (
          <div key={item.id} className="space-y-2">
            <Label htmlFor={item.item_key}>
              {item.item_name}
              {item.is_required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {item.description && (
              <p className="text-sm text-muted-foreground">{item.description}</p>
            )}
            <Textarea
              id={item.item_key}
              value={(currentValue as string) ?? ''}
              onChange={(e) => handleValueChange(item, e.target.value)}
              placeholder={`Enter ${item.item_name.toLowerCase()}...`}
              required={item.is_required}
            />
          </div>
        );

      case 'number':
        return (
          <div key={item.id} className="space-y-2">
            <Label htmlFor={item.item_key}>
              {item.item_name}
              {item.is_required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {item.description && (
              <p className="text-sm text-muted-foreground">{item.description}</p>
            )}
            <Input
              id={item.item_key}
              type="number"
              step="any"
              value={(currentValue as number) ?? ''}
              onChange={(e) => handleValueChange(item, e.target.value ? parseFloat(e.target.value) : null)}
              placeholder={`Enter ${item.item_name.toLowerCase()}...`}
              required={item.is_required}
            />
          </div>
        );

      case 'checkbox':
        return (
          <div key={item.id} className="flex items-start space-x-3">
            <Checkbox
              id={item.item_key}
              checked={(currentValue as boolean) ?? false}
              onCheckedChange={(checked) => handleValueChange(item, checked)}
            />
            <div className="space-y-1">
              <Label htmlFor={item.item_key} className="cursor-pointer">
                {item.item_name}
                {item.is_required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {item.description && (
                <p className="text-sm text-muted-foreground">{item.description}</p>
              )}
            </div>
          </div>
        );

      case 'date':
        return (
          <div key={item.id} className="space-y-2">
            <Label htmlFor={item.item_key}>
              {item.item_name}
              {item.is_required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {item.description && (
              <p className="text-sm text-muted-foreground">{item.description}</p>
            )}
            <Input
              id={item.item_key}
              type="date"
              value={(currentValue as string) ?? ''}
              onChange={(e) => handleValueChange(item, e.target.value)}
              required={item.is_required}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const renderSection = (section: InspectionFormSection) => {
    return (
      <div key={section.id} className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{section.title}</h3>
          {section.description && (
            <p className="text-sm text-muted-foreground">{section.description}</p>
          )}
        </div>
        <div className="space-y-4">
          {section.items.map(renderItem)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <GYRLegend />
      {template.sections.map(renderSection)}
    </div>
  );
}
