import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, X } from 'lucide-react';
import { FormBuilderField } from '@/types/formBuilder';

interface FieldEditorProps {
  field: FormBuilderField;
  onUpdate: (updates: Partial<FormBuilderField>) => void;
  onDelete: () => void;
}

export const FieldEditor: React.FC<FieldEditorProps> = ({
  field,
  onUpdate,
  onDelete
}) => {
  const [newOption, setNewOption] = useState('');

  const handleAddOption = () => {
    if (!newOption.trim()) return;
    
    const currentOptions = field.options || [];
    onUpdate({
      options: [
        ...currentOptions,
        { label: newOption, value: newOption.toLowerCase().replace(/\s+/g, '_') }
      ]
    });
    setNewOption('');
  };

  const handleRemoveOption = (index: number) => {
    const currentOptions = field.options || [];
    onUpdate({
      options: currentOptions.filter((_, i) => i !== index)
    });
  };

  const needsOptions = field.fieldType === 'select' || field.fieldType === 'radio';

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Field Label *</Label>
                <Input
                  value={field.label}
                  onChange={(e) => onUpdate({ label: e.target.value })}
                  placeholder="Enter field label"
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">Placeholder</Label>
                <Input
                  value={field.placeholder || ''}
                  onChange={(e) => onUpdate({ placeholder: e.target.value })}
                  placeholder="Enter placeholder text"
                  className="h-8"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Help Text</Label>
              <Textarea
                value={field.helpText || ''}
                onChange={(e) => onUpdate({ helpText: e.target.value })}
                placeholder="Help text for users"
                rows={2}
              />
            </div>

            {needsOptions && (
              <div>
                <Label className="text-xs">Options</Label>
                <div className="space-y-2">
                  {field.options?.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={option.label} readOnly className="h-8" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      placeholder="Add option"
                      className="h-8"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddOption();
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddOption}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={field.isRequired}
                  onChange={(e) => onUpdate({ isRequired: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-xs">Required</span>
              </label>
              <span className="text-xs text-muted-foreground">
                Type: {field.fieldType}
              </span>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
