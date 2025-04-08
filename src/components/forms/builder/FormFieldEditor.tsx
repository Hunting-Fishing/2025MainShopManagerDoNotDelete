
import React from 'react';
import { FormFieldType, FormFieldOption, FormBuilderField } from '@/types/formBuilder';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Trash2, GripVertical, Plus, X } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

interface FormFieldEditorProps {
  field: FormBuilderField;
  onUpdate: (field: FormBuilderField) => void;
  onDelete: () => void;
  isDragging?: boolean;
}

export const FormFieldEditor: React.FC<FormFieldEditorProps> = ({
  field,
  onUpdate,
  onDelete,
  isDragging
}) => {
  const handleChange = (
    key: keyof FormBuilderField,
    value: string | boolean | FormFieldOption[] | undefined
  ) => {
    onUpdate({ ...field, [key]: value });
  };

  const addOption = () => {
    const newOptions = [...(field.options || []), { label: '', value: '' }];
    handleChange('options', newOptions);
  };

  const updateOption = (index: number, key: keyof FormFieldOption, value: string) => {
    if (!field.options) return;
    
    const newOptions = [...field.options];
    newOptions[index] = { ...newOptions[index], [key]: value };
    
    // Auto-generate value from label if value is empty
    if (key === 'label' && !newOptions[index].value) {
      newOptions[index].value = value.toLowerCase().replace(/\s+/g, '_');
    }
    
    handleChange('options', newOptions);
  };

  const removeOption = (index: number) => {
    if (!field.options) return;
    const newOptions = field.options.filter((_, i) => i !== index);
    handleChange('options', newOptions);
  };

  return (
    <Card className={`mb-4 border-2 ${isDragging ? 'border-blue-400 opacity-50' : 'border-gray-200'}`}>
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          <div className="cursor-move">
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          <CardTitle className="text-base">{field.label || 'New Field'}</CardTitle>
        </div>
        <Button onClick={onDelete} size="sm" variant="ghost" className="h-8 w-8 p-0">
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-4 pt-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`field-label-${field.id}`}>Field Label</Label>
            <Input
              id={`field-label-${field.id}`}
              value={field.label}
              onChange={(e) => handleChange('label', e.target.value)}
              placeholder="Enter field label"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`field-type-${field.id}`}>Field Type</Label>
            <Select 
              value={field.fieldType} 
              onValueChange={(value) => handleChange('fieldType', value as FormFieldType)}
            >
              <SelectTrigger id={`field-type-${field.id}`}>
                <SelectValue placeholder="Select field type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text Input</SelectItem>
                <SelectItem value="textarea">Text Area</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="select">Dropdown</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
                <SelectItem value="radio">Radio Buttons</SelectItem>
                <SelectItem value="date">Date Picker</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="file">File Upload</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`field-placeholder-${field.id}`}>Placeholder Text</Label>
          <Input
            id={`field-placeholder-${field.id}`}
            value={field.placeholder || ''}
            onChange={(e) => handleChange('placeholder', e.target.value)}
            placeholder="Enter placeholder text"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`field-help-${field.id}`}>Help Text</Label>
          <Textarea
            id={`field-help-${field.id}`}
            value={field.helpText || ''}
            onChange={(e) => handleChange('helpText', e.target.value)}
            placeholder="Enter help text for this field"
            rows={2}
          />
        </div>
        
        {(field.fieldType === 'select' || field.fieldType === 'radio' || field.fieldType === 'checkbox') && (
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <Label>Options</Label>
              <Button 
                type="button" 
                onClick={addOption} 
                size="sm" 
                variant="outline" 
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Option
              </Button>
            </div>
            
            {field.options && field.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={option.label}
                  onChange={(e) => updateOption(index, 'label', e.target.value)}
                  placeholder="Option label"
                  className="flex-grow"
                />
                <Button 
                  onClick={() => removeOption(index)} 
                  variant="ghost" 
                  size="sm"
                  className="p-0 h-8 w-8 text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {(!field.options || field.options.length === 0) && (
              <div className="text-sm text-gray-500 italic">
                No options added yet. Click 'Add Option' to create options.
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center space-x-2 pt-2">
          <Switch
            id={`field-required-${field.id}`}
            checked={field.isRequired}
            onCheckedChange={(checked) => handleChange('isRequired', checked)}
          />
          <Label htmlFor={`field-required-${field.id}`} className="cursor-pointer">Required Field</Label>
        </div>
      </CardContent>
    </Card>
  );
};

export const createNewField = (sectionId: string, order: number): FormBuilderField => ({
  id: uuidv4(),
  sectionId,
  label: 'New Field',
  fieldType: 'text',
  isRequired: false,
  displayOrder: order,
});
