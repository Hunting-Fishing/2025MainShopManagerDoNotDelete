import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

export default function JournalEntries() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('id,entry_number,entry_date,description,total_debits,total_credits,is_posted')
        .order('entry_date', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Journal Entries</h1>
          <p className="text-muted-foreground">
            Review posted and draft journal entries.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entry Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading journal entries...</div>
          ) : data.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No journal entries have been created yet.
            </div>
          ) : (
            <div className="space-y-2">
              {data.map((entry: any) => (
                <div key={entry.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <div className="font-medium">{entry.entry_number}</div>
                    <div className="text-xs text-muted-foreground">
                      {entry.entry_date} · {entry.description || 'No description'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      Dr {Number(entry.total_debits || 0).toFixed(2)} / Cr {Number(entry.total_credits || 0).toFixed(2)}
                    </div>
                    <Badge variant={entry.is_posted ? 'default' : 'secondary'}>
                      {entry.is_posted ? 'Posted' : 'Draft'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
