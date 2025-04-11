
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const CampaignsList = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  
  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('email_campaigns')
          .select('id, name, subject, status, total_recipients, opened, clicked, created_at, sent_date')
          .order(sortBy, { ascending: sortDirection === 'asc' });
          
        if (error) throw error;
        
        setCampaigns(data || []);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCampaigns();
  }, [sortBy, sortDirection]);
  
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };
  
  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    
    return sortDirection === 'asc' 
      ? <ChevronUp className="ml-1 h-4 w-4" /> 
      : <ChevronDown className="ml-1 h-4 w-4" />;
  };
  
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }
  
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No campaigns found.</p>
      </div>
    );
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
              <div className="flex items-center">
                Campaign Name {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
              <div className="flex items-center">
                Status {getSortIcon('status')}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('total_recipients')}>
              <div className="flex items-center">
                Recipients {getSortIcon('total_recipients')}
              </div>
            </TableHead>
            <TableHead>Performance</TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('created_at')}>
              <div className="flex items-center">
                Created {getSortIcon('created_at')}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('sent_date')}>
              <div className="flex items-center">
                Sent {getSortIcon('sent_date')}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map(campaign => {
            // Calculate performance metrics
            const openRate = campaign.total_recipients 
              ? ((campaign.opened / campaign.total_recipients) * 100).toFixed(1) 
              : '0';
              
            const clickRate = campaign.total_recipients 
              ? ((campaign.clicked / campaign.total_recipients) * 100).toFixed(1) 
              : '0';
            
            return (
              <TableRow key={campaign.id}>
                <TableCell>
                  <div className="font-medium">{campaign.name}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {campaign.subject}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={campaign.status} />
                </TableCell>
                <TableCell>
                  {campaign.total_recipients?.toLocaleString() || 0}
                </TableCell>
                <TableCell>
                  <div className="text-xs">
                    <span className="font-medium">{openRate}%</span> open rate
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">{clickRate}%</span> click rate
                  </div>
                </TableCell>
                <TableCell>
                  {campaign.created_at ? (
                    format(new Date(campaign.created_at), 'MMM d, yyyy')
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell>
                  {campaign.sent_date ? (
                    format(new Date(campaign.sent_date), 'MMM d, yyyy')
                  ) : (
                    '—'
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const getVariant = () => {
    switch (status) {
      case 'draft': return "secondary";
      case 'scheduled': return "outline";
      case 'sending': return "outline";
      case 'sent': return "default";
      case 'completed': return "default";
      case 'cancelled': return "destructive";
      default: return "secondary";
    }
  };
  
  return (
    <Badge variant={getVariant()}>{status}</Badge>
  );
};
