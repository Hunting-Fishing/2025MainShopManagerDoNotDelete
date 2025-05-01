
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, CheckCircle2, XCircle2, ExternalLink, Eye } from 'lucide-react';

interface ProductSubmission {
  id: string;
  product_name: string;
  product_url: string;
  suggested_category: string;
  notes?: string;
  submitted_by?: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
}

export default function SubmissionsManagement() {
  const [submissions, setSubmissions] = useState<ProductSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingSubmission, setViewingSubmission] = useState<ProductSubmission | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Fetch all product submissions
  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching product submissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch product submissions',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Update submission status
  const updateSubmissionStatus = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('product_submissions')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Submission ${status}`,
        variant: 'success'
      });

      // Update local state
      setSubmissions(prevSubmissions => 
        prevSubmissions.map(sub => 
          sub.id === id ? { ...sub, status } : sub
        )
      );
      
      // If viewing the submission, update it
      if (viewingSubmission && viewingSubmission.id === id) {
        setViewingSubmission({ ...viewingSubmission, status });
      }
    } catch (error) {
      console.error('Error updating submission status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update submission status',
        variant: 'destructive'
      });
    }
  };

  // View submission details
  const viewSubmission = (submission: ProductSubmission) => {
    setViewingSubmission(submission);
    setIsViewDialogOpen(true);
  };
  
  // Convert to product
  const convertToProduct = async (submission: ProductSubmission) => {
    try {
      // First, find the category ID based on the suggested category
      const { data: categoryData, error: categoryError } = await supabase
        .from('product_categories')
        .select('id')
        .eq('name', submission.suggested_category)
        .maybeSingle();
      
      if (categoryError) throw categoryError;
      
      // Prepare the product data
      const productData = {
        title: submission.product_name,
        description: submission.notes || `Product suggested via user submission`,
        affiliate_link: submission.product_url,
        category_id: categoryData?.id || null,
        is_approved: false, // Default to non-approved
      };
      
      // Insert the product
      const { error: insertError } = await supabase
        .from('products')
        .insert([productData]);
        
      if (insertError) throw insertError;
      
      // Update submission status
      await updateSubmissionStatus(submission.id, 'approved');
      
      toast({
        title: 'Success',
        description: 'Product created successfully from submission',
        variant: 'success'
      });
      
      setIsViewDialogOpen(false);
    } catch (error) {
      console.error('Error converting submission to product:', error);
      toast({
        title: 'Error',
        description: 'Failed to create product from submission',
        variant: 'destructive'
      });
    }
  };

  // Filter submissions based on search query
  const filteredSubmissions = submissions.filter(sub => 
    sub.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.product_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.suggested_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sub.notes && sub.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Format submission date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-2xl font-bold">Product Submissions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search submissions..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            {searchQuery ? "No submissions match your search" : "No product submissions yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="border">
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">
                      <div>
                        {submission.product_name}
                        <div className="text-xs text-slate-500 truncate max-w-xs">
                          {submission.product_url}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {submission.suggested_category || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {formatDate(submission.submitted_at)}
                    </TableCell>
                    <TableCell>
                      {submission.status === 'pending' && (
                        <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300">
                          Pending
                        </Badge>
                      )}
                      {submission.status === 'approved' && (
                        <Badge className="bg-green-100 text-green-800 border border-green-300">
                          Approved
                        </Badge>
                      )}
                      {submission.status === 'rejected' && (
                        <Badge className="bg-red-100 text-red-800 border border-red-300">
                          Rejected
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => viewSubmission(submission)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-white hover:bg-green-600"
                          onClick={() => updateSubmissionStatus(submission.id, 'approved')}
                          disabled={submission.status === 'approved'}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-white hover:bg-red-500"
                          onClick={() => updateSubmissionStatus(submission.id, 'rejected')}
                          disabled={submission.status === 'rejected'}
                        >
                          <XCircle2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* View Submission Dialog */}
      {viewingSubmission && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Submission Details</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <h3 className="text-lg font-semibold">{viewingSubmission.product_name}</h3>
                <Badge className={`mt-1 ${
                  viewingSubmission.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                  viewingSubmission.status === 'approved' ? 'bg-green-100 text-green-800 border border-green-300' :
                  'bg-red-100 text-red-800 border border-red-300'
                }`}>
                  {viewingSubmission.status.charAt(0).toUpperCase() + viewingSubmission.status.slice(1)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Submitted</label>
                  <div>{formatDate(viewingSubmission.submitted_at)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <div>{viewingSubmission.suggested_category || '—'}</div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Product URL</label>
                <div className="flex items-center mt-1">
                  <a 
                    href={viewingSubmission.product_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate flex items-center"
                  >
                    {viewingSubmission.product_url}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>
              
              {viewingSubmission.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <Textarea 
                    value={viewingSubmission.notes} 
                    readOnly 
                    className="mt-1" 
                  />
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
              
              {viewingSubmission.status === 'pending' && (
                <>
                  <Button 
                    onClick={() => updateSubmissionStatus(viewingSubmission.id, 'rejected')}
                    variant="destructive"
                  >
                    <XCircle2 className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button 
                    onClick={() => convertToProduct(viewingSubmission)}
                    className="bg-green-600"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Convert to Product
                  </Button>
                </>
              )}
              
              {viewingSubmission.status === 'approved' && (
                <Button disabled variant="outline">
                  Already Approved
                </Button>
              )}
              
              {viewingSubmission.status === 'rejected' && (
                <Button 
                  onClick={() => updateSubmissionStatus(viewingSubmission.id, 'pending')}
                  variant="outline"
                >
                  Mark as Pending
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
