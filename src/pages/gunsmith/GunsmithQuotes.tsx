import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Plus, 
  Search,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function GunsmithQuotes() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: quotes, isLoading } = useQuery({
    queryKey: ['gunsmith-quotes'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('gunsmith_quotes')
        .select('*, customers(first_name, last_name), gunsmith_firearms(make, model)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const filteredQuotes = quotes?.filter((q: any) => 
    q.quote_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.customers?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.customers?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-500';
      case 'sent': return 'bg-blue-500';
      case 'declined': return 'bg-red-500';
      case 'expired': return 'bg-gray-500';
      default: return 'bg-amber-500';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/gunsmith')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <FileText className="h-8 w-8 text-amber-500" />
              Quotes
            </h1>
            <p className="text-muted-foreground mt-1">Manage service quotes</p>
          </div>
        </div>
        <Button onClick={() => navigate('/gunsmith/quotes/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Quote
        </Button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search quotes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : filteredQuotes?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No quotes yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuotes?.map((quote: any) => (
                <div key={quote.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted" onClick={() => navigate(`/gunsmith/quotes/${quote.id}`)}>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium">{quote.quote_number}</span>
                      <Badge className={`${getStatusColor(quote.status)} text-white`}>{quote.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {quote.customers?.first_name} {quote.customers?.last_name}
                      {quote.gunsmith_firearms && ` â€¢ ${quote.gunsmith_firearms.make} ${quote.gunsmith_firearms.model}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${quote.total?.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{format(new Date(quote.created_at), 'MMM d, yyyy')}</p>
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
