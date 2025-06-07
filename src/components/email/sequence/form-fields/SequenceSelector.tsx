import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

interface Sequence {
  id: string;
  name: string;
}

interface SequenceSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
}

export function SequenceSelector({ value, onValueChange }: SequenceSelectorProps) {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSequences = async () => {
      try {
        const { data, error } = await supabase
          .from('email_sequences')
          .select('id, name');

        if (error) {
          console.error('Error fetching sequences:', error);
        } else {
          setSequences(data || []);
        }
      } catch (error) {
        console.error('Error fetching sequences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSequences();
  }, []);

  return (
    <div>
      <Label htmlFor="sequence">Select Sequence</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id="sequence">
          <SelectValue placeholder={loading ? "Loading sequences..." : "Select a sequence"} />
        </SelectTrigger>
        <SelectContent>
          {sequences.map((sequence) => (
            <SelectItem key={sequence.id} value={sequence.id}>
              {sequence.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

