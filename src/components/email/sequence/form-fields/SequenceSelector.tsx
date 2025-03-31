
import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { Label } from '@/components/ui/label';
import { FormDescription } from '@/components/ui/form';

interface SequenceSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SequenceSelector: React.FC<SequenceSelectorProps> = ({
  value,
  onChange,
  className
}) => {
  const [sequences, setSequences] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSequences = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('email_sequences')
          .select('*')
          .eq('is_active', true);
          
        if (error) throw error;
        setSequences(data || []);
      } catch (error) {
        console.error('Error fetching sequences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSequences();
  }, []);

  return (
    <div className={className}>
      <Label htmlFor="sequence-select">Select Sequence</Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={loading}
      >
        <SelectTrigger id="sequence-select">
          <SelectValue placeholder="Select an email sequence" />
        </SelectTrigger>
        <SelectContent>
          {sequences.length === 0 && loading ? (
            <SelectItem value="loading" disabled>
              Loading sequences...
            </SelectItem>
          ) : sequences.length === 0 ? (
            <SelectItem value="none" disabled>
              No active sequences found
            </SelectItem>
          ) : (
            sequences.map((sequence) => (
              <SelectItem key={sequence.id} value={sequence.id}>
                {sequence.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      <FormDescription>
        Only active sequences can be selected for enrollment
      </FormDescription>
    </div>
  );
};
