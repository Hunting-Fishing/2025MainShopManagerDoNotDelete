
import React from 'react';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { EnrollCustomerFormValues } from '../hooks/useEnrollCustomerForm';

interface SequenceSelectorProps {
  form: UseFormReturn<EnrollCustomerFormValues>;
  sequences: any[];
  loading: boolean;
}

export const SequenceSelector: React.FC<SequenceSelectorProps> = ({
  form,
  sequences,
  loading,
}) => {
  return (
    <FormItem>
      <FormLabel>Email Sequence</FormLabel>
      <Select
        disabled={loading}
        onValueChange={(value) => form.setValue('sequenceId', value)}
        defaultValue={form.getValues('sequenceId')}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select a sequence" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {sequences.map((sequence) => (
            <SelectItem key={sequence.id} value={sequence.id}>
              {sequence.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormDescription>
        Choose an active email sequence to enroll this customer in.
      </FormDescription>
      <FormMessage />
    </FormItem>
  );
};
