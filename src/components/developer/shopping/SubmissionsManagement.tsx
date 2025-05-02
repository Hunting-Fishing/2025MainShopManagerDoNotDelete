
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { UserSubmission } from '@/types/affiliate';
import { MoreHorizontal, X, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const SubmissionsManagement = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSubmission, setSelectedSubmission] = useState<UserSubmission | null>(null);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // Fetch submissions data
  const { data: submissions, isLoading, error, refetch } = useQuery({
    queryKey: ['product-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(submission => ({
        id: submission.id,
        productName: submission.product_name,
        submittedBy: submission.suggested_by || undefined,
        suggestedCategory: submission.suggested_category,
        submittedAt: submission.submitted_at,
        status: submission.status as 'pending' | 'approved' | 'rejected' | 'modifications',
        notes: submission.notes,
        productUrl: submission.product_url,
      })) as UserSubmission[];
    }
  });

  // Filter submissions based on status and search term
  const filteredSubmissions = submissions?.filter(submission => {
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    const matchesSearch = submission.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (submission.notes && submission.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Handle status update
  const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'rejected' | 'pending' | 'modifications') => {
    try {
      const { error } = await supabase
        .from('product_submissions')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Status updated",
        description: `Product submission has been ${newStatus}.`,
      });
      
      refetch();
    } catch (error) {
      console.error("Error updating submission status:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the submission status.",
        variant: "destructive",
      });
    }
  };

  // Handle approval dialog
  const handleApproveSubmission = (submission: UserSubmission) => {
    setSelectedSubmission(submission);
    setDialogAction('approve');
    setIsDialogOpen(true);
  };

  // Handle rejection dialog
  const handleRejectSubmission = (submission: UserSubmission) => {
    setSelectedSubmission(submission);
    setDialogAction('reject');
    setIsDialogOpen(true);
  };

  // Process submission after dialog confirmation
  const processSubmission = () => {
    if (!selectedSubmission || !dialogAction) return;
    
    const newStatus = dialogAction === 'approve' ? 'approved' : 'rejected';
    handleStatusUpdate(selectedSubmission.id, newStatus);
    setIsDialogOpen(false);
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300"><Check className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300"><X className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case 'modifications':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Needs Changes</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading submissions...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-500">Error loading submissions</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">User Tool Submissions</h2>
        <p className="text-slate-600 dark:text-slate-300">
          Review and approve tool submissions from users
        </p>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Search submissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-1/4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Submissions</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="modifications">Needs Modifications</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Submission list */}
      {filteredSubmissions && filteredSubmissions.length > 0 ? (
        <div className="grid gap-4">
          {filteredSubmissions.map((submission) => (
            <Card key={submission.id} className="overflow-hidden border border-gray-100">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{submission.productName}</h3>
                        <StatusBadge status={submission.status} />
                      </div>
                      <p className="text-sm text-slate-500 mb-2">
                        Category: <span className="font-medium">{submission.suggestedCategory}</span>
                      </p>
                      <p className="text-sm text-slate-500 mb-2">
                        Submitted: <span className="font-medium">{new Date(submission.submittedAt).toLocaleDateString()}</span>
                      </p>
                      {submission.productUrl && (
                        <a 
                          href={submission.productUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline mb-2 inline-block"
                        >
                          View Product
                        </a>
                      )}
                      {submission.notes && (
                        <p className="text-sm mt-2 bg-slate-50 p-3 rounded-md">
                          <span className="font-semibold block mb-1">Notes:</span>
                          {submission.notes}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 md:mt-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleApproveSubmission(submission)}
                            className="text-green-600"
                          >
                            <Check className="mr-2 h-4 w-4" /> Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRejectSubmission(submission)}
                            className="text-red-600"
                          >
                            <X className="mr-2 h-4 w-4" /> Reject
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(submission.id, 'pending')}
                          >
                            Mark as Pending
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-slate-600 mb-1">No submissions found</h3>
          <p className="text-slate-500">
            {searchTerm || statusFilter !== 'all'
              ? "Try changing your filters"
              : "There are no product submissions yet"}
          </p>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogAction === 'approve' ? 'Approve Submission' : 'Reject Submission'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAction === 'approve'
                ? "Are you sure you want to approve this product submission? It will be marked as approved."
                : "Are you sure you want to reject this product submission? It will be marked as rejected."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={processSubmission}>
              {dialogAction === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SubmissionsManagement;
