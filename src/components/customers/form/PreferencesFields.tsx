
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTechnicians } from '@/hooks/useTechnicians';
import { UseFormReturn } from 'react-hook-form';

interface PreferencesFieldsProps {
  form: UseFormReturn<any>;
}

export function PreferencesFields({ form }: PreferencesFieldsProps) {
  const { technicians, loading } = useTechnicians();

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="preferredTechnician"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preferred Technician</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Loading..." : "Select technician"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {technicians.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Additional notes about this customer..." 
                {...field}
                rows={4}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tags</FormLabel>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {field.value?.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => {
                        const newTags = field.value.filter((_: string, i: number) => i !== index);
                        field.onChange(newTags);
                      }}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      const newTag = input.value.trim();
                      if (newTag && !field.value?.includes(newTag)) {
                        field.onChange([...(field.value || []), newTag]);
                        input.value = '';
                      }
                    }
                  }}
                />
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
