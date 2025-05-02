
import React, { useState } from 'react';
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
import { UserSubmission } from '@/types/affiliate';

const SubmissionsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Use React Query to fetch user submissions
  const { data: submissions = [], isLoading, error } = useQuery({
    queryKey: ['productSubmissions'],
    queryFn: async () => {
      // In a real implementation, this would fetch from your database
      await new Promise(resolve => setTimeout(resolve, 800));
      return [];
    },
  });
  
  // Filter submissions based on search and status
  const filteredSubmissions = React.useMemo(() => {
    return submissions.filter((submission: UserSubmission) => {
      const matchesSearch = searchTerm === "" || 
        submission.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.notes?.toLowerCase().includes(searchTerm.toLowerCase());
        
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
  
  const handleViewSubmission = (id: string) => {
    console.log(`View submission ${id}`);
  };
  
  const handleApproveSubmission = (id: string) => {
    console.log(`Approve submission ${id}`);
  };
  
  const handleRejectSubmission = (id: string) => {
    console.log(`Reject submission ${id}`);
  };
  
  const handleVisitLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
                        <p className="text-muted-foreground">Loading submissions...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredSubmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-muted-foreground">No submissions found.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubmissions.map((submission: UserSubmission) => (
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
                            onClick={() => handleViewSubmission(submission.id)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                          </Button>
                          {submission.productUrl && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleVisitLink(submission.productUrl)}
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
    </div>
  );
};

export default SubmissionsManagement;
