
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  Search,
  ExternalLink,
  Calendar,
  Eye,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';

interface ProductSubmission {
  id: string;
  productName: string;
  submittedBy?: string;
  suggestedCategory: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'modifications';
  notes?: string;
  productUrl?: string;
  manufacturer?: string;
}

const SubmissionsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewSubmission, setViewSubmission] = useState<ProductSubmission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  
  // Use React Query to fetch product submissions
  const { data: submissions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['productSubmissions'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('product_submissions')
          .select('*')
          .order('submitted_at', { ascending: false });
          
        if (error) throw error;
        
        return data.map(item => ({
          id: item.id,
          productName: item.product_name,
          submittedBy: item.suggested_by,
          suggestedCategory: item.suggested_category,
          submittedAt: item.submitted_at,
          status: item.status,
          notes: item.notes,
          productUrl: item.product_url,
          manufacturer: item.manufacturer || 'Not specified'
        }));
      } catch (error) {
        console.error('Error fetching submissions:', error);
        return [];
      }
    },
  });
  
  // Filter submissions based on search and status
  const filteredSubmissions = React.useMemo(() => {
    return submissions.filter((submission: ProductSubmission) => {
      const matchesSearch = searchTerm === "" || 
        submission.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesStatus = statusFilter === "all" || submission.status === statusFilter;
        
      return matchesSearch && matchesStatus;
    });
  }, [submissions, searchTerm, statusFilter]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  const handleViewSubmission = (submission: ProductSubmission) => {
    setViewSubmission(submission);
    setIsDialogOpen(true);
  };
  
  const handleApproveSubmission = async (id: string) => {
    try {
      setIsApproving(true);
      
      const { error } = await supabase
        .from('product_submissions')
        .update({ status: 'approved' })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Submission approved",
        description: "The product submission has been approved.",
        variant: "success",
      });
      
      refetch();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error approving submission:', error);
      toast({
        title: "Error",
        description: "Failed to approve the submission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };
  
  const handleRejectSubmission = async (id: string) => {
    try {
      setIsRejecting(true);
      
      const { error } = await supabase
        .from('product_submissions')
        .update({ status: 'rejected' })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Submission rejected",
        description: "The product submission has been rejected.",
        variant: "default",
      });
      
      refetch();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast({
        title: "Error",
        description: "Failed to reject the submission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRejecting(false);
    }
  };
  
  const handleVisitLink = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  
  if (error) {
    return (
      <Card className="bg-white shadow-md rounded-lg mb-6">
        <CardHeader>
          <CardTitle>Product Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <p className="text-red-500">Error loading submissions. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-md rounded-lg mb-6">
        <CardHeader>
          <CardTitle>Product Submissions</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-grow min-w-[200px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search submissions..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center min-w-[180px]">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
                        <p className="text-muted-foreground">Loading submissions...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredSubmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">No submissions found.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubmissions.map((submission: ProductSubmission) => (
                    <TableRow key={submission.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{submission.productName}</div>
                          {submission.submittedBy && (
                            <div className="text-xs text-muted-foreground">by {submission.submittedBy}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {submission.suggestedCategory}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-700">
                          {submission.manufacturer || 'Not specified'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                          <span>{formatDate(submission.submittedAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            submission.status === 'approved' ? 'bg-green-100 text-green-800 border-green-300' :
                            submission.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' :
                            'bg-amber-100 text-amber-800 border-amber-300'
                          }
                        >
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleViewSubmission(submission)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                          </Button>
                          {submission.productUrl && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleVisitLink(submission.productUrl!)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span className="sr-only">Visit product URL</span>
                            </Button>
                          )}
                          {submission.status === 'pending' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-green-500 hover:text-green-600"
                                onClick={() => handleApproveSubmission(submission.id)}
                              >
                                <Check className="h-4 w-4" />
                                <span className="sr-only">Approve</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-red-500 hover:text-red-600"
                                onClick={() => handleRejectSubmission(submission.id)}
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Reject</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Submission Details Dialog */}
      {viewSubmission && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Product Submission Details</DialogTitle>
              <DialogDescription>
                Review the submission details and take action.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Product Name</h4>
                  <p className="mt-1">{viewSubmission.productName}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Suggested Category</h4>
                  <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-200">
                    {viewSubmission.suggestedCategory}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Manufacturer</h4>
                  <p className="mt-1">{viewSubmission.manufacturer || 'Not specified'}</p>
                </div>
                
                {viewSubmission.productUrl && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-500">Product URL</h4>
                    <a 
                      href={viewSubmission.productUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-1 text-blue-600 hover:text-blue-800 underline flex items-center"
                    >
                      View Product Link
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}
                
                {viewSubmission.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-500">Notes</h4>
                    <p className="mt-1 whitespace-pre-line text-sm">{viewSubmission.notes}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Status</h4>
                  <Badge 
                    className={
                      viewSubmission.status === 'approved' ? 'mt-1 bg-green-100 text-green-800 border-green-300' :
                      viewSubmission.status === 'rejected' ? 'mt-1 bg-red-100 text-red-800 border-red-300' :
                      'mt-1 bg-amber-100 text-amber-800 border-amber-300'
                    }
                  >
                    {viewSubmission.status.charAt(0).toUpperCase() + viewSubmission.status.slice(1)}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Submitted Date</h4>
                  <p className="mt-1">{formatDate(viewSubmission.submittedAt)}</p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              {viewSubmission.status === 'pending' && (
                <div className="flex gap-2 w-full">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleRejectSubmission(viewSubmission.id)}
                    disabled={isRejecting}
                  >
                    {isRejecting ? 'Rejecting...' : 'Reject'}
                  </Button>
                  <Button 
                    variant="default"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApproveSubmission(viewSubmission.id)}
                    disabled={isApproving}
                  >
                    {isApproving ? 'Approving...' : 'Approve'}
                  </Button>
                </div>
              )}
              {viewSubmission.status !== 'pending' && (
                <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SubmissionsManagement;
