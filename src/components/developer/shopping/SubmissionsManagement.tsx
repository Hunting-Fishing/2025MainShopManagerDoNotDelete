
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { isValidAmazonLink } from '@/utils/amazonUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, CheckCircle2, XCircle, ExternalLink, Eye } from 'lucide-react';

interface ProductSubmission {
  id: string;
  product_name: string;
  product_url: string;
  suggested_category: string;
  suggested_by: string | null;
  notes: string | null;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
}

export default function SubmissionsManagement() {
  const [submissions, setSubmissions] = useState<ProductSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<ProductSubmission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Ensure we're casting to the correct type
        setSubmissions(data as ProductSubmission[]);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (submission: ProductSubmission, newStatus: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from('product_submissions')
        .update({ status: newStatus, notes: newStatus === "rejected" ? rejectionReason : submission.notes })
        .eq('id', submission.id);
      
      if (error) throw error;

      // If approved, create a product entry
      if (newStatus === 'approved') {
        await createProductFromSubmission(submission);
      }
      
      // Refresh the list
      fetchSubmissions();
      setRejectionDialogOpen(false);
      setRejectionReason("");
      setSelectedSubmission(null);
      
    } catch (error) {
      console.error('Error updating submission status:', error);
    }
  };

  const createProductFromSubmission = async (submission: ProductSubmission) => {
    try {
      // Get or create the category
      let categoryId = null;
      const { data: existingCategories } = await supabase
        .from('product_categories')
        .select('id')
        .eq('name', submission.suggested_category)
        .limit(1);
      
      if (existingCategories && existingCategories.length > 0) {
        categoryId = existingCategories[0].id;
      } else {
        // Create new category
        const { data: newCategory, error: categoryError } = await supabase
          .from('product_categories')
          .insert({
            name: submission.suggested_category,
            slug: submission.suggested_category.toLowerCase().replace(/\s+/g, '-'),
            description: `Products in the ${submission.suggested_category} category`
          })
          .select('id')
          .single();
        
        if (categoryError) throw categoryError;
        categoryId = newCategory.id;
      }
      
      // Create the product
      const { error: productError } = await supabase
        .from('products')
        .insert({
          title: submission.product_name,
          description: `Product based on user submission`,
          price: 0, // Placeholder
          affiliate_link: submission.product_url,
          category_id: categoryId,
          product_type: 'affiliate',
          is_approved: true
        });
      
      if (productError) throw productError;
      
    } catch (error) {
      console.error('Error creating product from submission:', error);
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    const matchesSearch = sub.product_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sub.product_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sub.suggested_category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleReject = (submission: ProductSubmission) => {
    setSelectedSubmission(submission);
    setRejectionDialogOpen(true);
  };

  const handleViewDetails = (submission: ProductSubmission) => {
    setSelectedSubmission(submission);
    setDetailsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Product Submissions</h2>
        <Button onClick={fetchSubmissions}>Refresh</Button>
      </div>

      <div className="flex gap-4 items-center mb-6">
        <div className="relative grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <Input
            placeholder="Search submissions..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-lg">
          <p className="text-slate-500">No submissions match your filters</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
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
                <TableCell className="font-medium">{submission.product_name}</TableCell>
                <TableCell>{submission.suggested_category}</TableCell>
                <TableCell>{new Date(submission.submitted_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  {submission.status === 'pending' && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">Pending</Badge>
                  )}
                  {submission.status === 'approved' && (
                    <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300">Approved</Badge>
                  )}
                  {submission.status === 'rejected' && (
                    <Badge variant="outline" className="bg-red-50 text-red-800 border-red-300">Rejected</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => window.open(submission.product_url, '_blank')}
                    >
                      <ExternalLink size={18} />
                      <span className="sr-only">View URL</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(submission)}
                    >
                      <Eye size={18} />
                      <span className="sr-only">View Details</span>
                    </Button>

                    {submission.status === 'pending' && (
                      <>
                        <Button 
                          variant="ghost"
                          size="icon"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleStatusChange(submission, "approved")}
                        >
                          <CheckCircle2 size={18} />
                          <span className="sr-only">Approve</span>
                        </Button>
                        
                        <Button 
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleReject(submission)}
                        >
                          <XCircle size={18} />
                          <span className="sr-only">Reject</span>
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Product Submission</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">You are about to reject the product "{selectedSubmission?.product_name}". 
              Please provide a reason for the rejection:</p>
            <Textarea 
              value={rejectionReason} 
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectionDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedSubmission && handleStatusChange(selectedSubmission, "rejected")}
              disabled={!rejectionReason.trim()}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-slate-500">Product Name</h3>
                  <p>{selectedSubmission.product_name}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-500">Suggested Category</h3>
                  <p>{selectedSubmission.suggested_category}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-500">Submission Date</h3>
                  <p>{new Date(selectedSubmission.submitted_at).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-500">Status</h3>
                  <p>{selectedSubmission.status.charAt(0).toUpperCase() + selectedSubmission.status.slice(1)}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-slate-500">Product URL</h3>
                <a 
                  href={selectedSubmission.product_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all flex items-center gap-1"
                >
                  {selectedSubmission.product_url}
                  <ExternalLink size={14} />
                </a>
                <div className="mt-1">
                  {isValidAmazonLink(selectedSubmission.product_url) ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700">Valid Amazon Link</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Not an Amazon Link</Badge>
                  )}
                </div>
              </div>
              
              {selectedSubmission.notes && (
                <div>
                  <h3 className="font-semibold text-sm text-slate-500">Notes</h3>
                  <p className="whitespace-pre-wrap">{selectedSubmission.notes}</p>
                </div>
              )}
              
              {selectedSubmission.status === 'pending' && (
                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="border-red-200 text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setDetailsDialogOpen(false);
                      setTimeout(() => handleReject(selectedSubmission), 100);
                    }}
                  >
                    <XCircle size={16} className="mr-2" />
                    Reject
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setDetailsDialogOpen(false);
                      handleStatusChange(selectedSubmission, "approved");
                    }}
                  >
                    <CheckCircle2 size={16} className="mr-2" />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
