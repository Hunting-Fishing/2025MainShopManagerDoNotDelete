
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserSubmission } from '@/types/affiliate';
import { Search, Eye, CheckCheck, X, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Sample submissions for demonstration
const sampleSubmissions: UserSubmission[] = [
  {
    id: '1',
    productName: 'Snap-on Ratchet Set',
    productUrl: 'https://www.amazon.com/snap-on-ratchet-set',
    suggestedCategory: 'hand-tools',
    notes: 'This is a professional-grade ratchet set that would be great for the premium tier.',
    submittedBy: 'john.doe@example.com',
    status: 'pending',
    submittedAt: '2023-05-10T14:32:00Z',
  },
  {
    id: '2',
    productName: 'ANCEL OBD2 Scanner',
    productUrl: 'https://www.amazon.com/ancel-scanner',
    suggestedCategory: 'diagnostic',
    notes: 'Good mid-range scanner for DIY mechanics',
    submittedBy: 'jane.smith@example.com',
    status: 'approved',
    submittedAt: '2023-05-09T11:20:00Z',
  },
  {
    id: '3',
    productName: 'Clipsandfasteners Body Clip Set',
    productUrl: 'https://www.amazon.com/clips-set',
    suggestedCategory: 'clips-fasteners',
    submittedBy: 'mike.wilson@example.com',
    status: 'rejected',
    submittedAt: '2023-05-08T16:45:00Z',
  }
];

export default function SubmissionsManagement() {
  const [submissions, setSubmissions] = useState<UserSubmission[]>(sampleSubmissions);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewSubmission, setViewSubmission] = useState<UserSubmission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredSubmissions = searchTerm
    ? submissions.filter(sub => 
        sub.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        sub.suggestedCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.submittedBy?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : submissions;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleApprove = (id: string) => {
    setSubmissions(submissions.map(sub => 
      sub.id === id ? { ...sub, status: 'approved' } : sub
    ));
    toast({
      title: "Submission approved",
      description: "The product submission has been approved.",
    });
  };

  const handleReject = (id: string) => {
    setSubmissions(submissions.map(sub => 
      sub.id === id ? { ...sub, status: 'rejected' } : sub
    ));
    toast({
      title: "Submission rejected",
      description: "The product submission has been rejected.",
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">User Submissions</h2>
      </div>

      <div className="flex mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search submissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  No submissions found.
                </TableCell>
              </TableRow>
            ) : (
              filteredSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">{submission.productName}</TableCell>
                  <TableCell>{submission.suggestedCategory}</TableCell>
                  <TableCell>{submission.submittedBy || "Anonymous"}</TableCell>
                  <TableCell>{formatDate(submission.submittedAt)}</TableCell>
                  <TableCell>
                    <SubmissionStatusBadge status={submission.status} />
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => setViewSubmission(submission)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <SubmissionDetails 
                          submission={submission} 
                          onClose={() => setIsDialogOpen(false)} 
                          onApprove={() => handleApprove(submission.id)}
                          onReject={() => handleReject(submission.id)}
                        />
                      </DialogContent>
                    </Dialog>
                    {submission.status === 'pending' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-green-500 hover:text-green-600"
                          onClick={() => handleApprove(submission.id)}
                        >
                          <CheckCheck className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => handleReject(submission.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function SubmissionStatusBadge({ status }: { status: UserSubmission['status'] }) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 border border-amber-300">
          Pending
        </Badge>
      );
    case 'approved':
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border border-green-300">
          Approved
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border border-red-300">
          Rejected
        </Badge>
      );
    default:
      return null;
  }
}

interface SubmissionDetailsProps {
  submission: UserSubmission;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

function SubmissionDetails({ submission, onClose, onApprove, onReject }: SubmissionDetailsProps) {
  const formatDateFull = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Product Submission</DialogTitle>
        <DialogDescription>
          Review the product submission details below.
        </DialogDescription>
      </DialogHeader>
      
      <div className="py-4 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-slate-500">Status</h3>
          <div className="mt-1">
            <SubmissionStatusBadge status={submission.status} />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-500">Product Name</h3>
          <p className="mt-1">{submission.productName}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-500">Product URL</h3>
          <div className="mt-1 flex items-center">
            <a 
              href={submission.productUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              {submission.productUrl}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-500">Suggested Category</h3>
          <p className="mt-1">{submission.suggestedCategory}</p>
        </div>

        {submission.notes && (
          <div>
            <h3 className="text-sm font-medium text-slate-500">Notes</h3>
            <p className="mt-1">{submission.notes}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-slate-500">Submitted By</h3>
            <p className="mt-1">{submission.submittedBy || "Anonymous"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">Submitted On</h3>
            <p className="mt-1">{formatDateFull(submission.submittedAt)}</p>
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2 sm:justify-between">
        {submission.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => {
                onReject();
                onClose();
              }}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-green-300 text-green-600 hover:bg-green-50"
              onClick={() => {
                onApprove();
                onClose();
              }}
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </div>
        )}
        <Button type="button" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </>
  );
}
