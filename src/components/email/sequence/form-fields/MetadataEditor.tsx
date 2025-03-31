
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormDescription } from '@/components/ui/form';

interface MetadataEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const MetadataEditor: React.FC<MetadataEditorProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <Label htmlFor="metadata">Custom JSON Metadata</Label>
      <Textarea
        id="metadata"
        placeholder='{"custom_field": "value", "tracking": {"source": "website"}}'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
      />
      <FormDescription>
        Add any additional metadata as valid JSON for advanced tracking and personalization.
      </FormDescription>
    </div>
  );
};
