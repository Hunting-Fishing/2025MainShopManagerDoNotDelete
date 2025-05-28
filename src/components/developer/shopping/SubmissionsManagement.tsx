
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, Eye, MessageSquare } from 'lucide-react';

interface Submission {
  id: string;
  product_name: string;
  submitted_by: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export function SubmissionsManagement() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        // Since product_submissions table doesn't exist, use mock data
        const mockSubmissions: Submission[] = [
          {
            id: '1',
            product_name: 'Sample Product 1',
            submitted_by: 'John Doe',
            status: 'pending',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            product_name: 'Sample Product 2',
            submitted_by: 'Jane Smith',
            status: 'approved',
            created_at: new Date().toISOString()
          }
        ];
        setSubmissions(mockSubmissions);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const updateSubmissionStatus = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      // Update local state since we don't have the actual table
      setSubmissions(submissions.map(submission =>
        submission.id === id ? { ...submission, status } : submission
      ));
    } catch (error) {
      console.error('Error updating submission status:', error);
    }
  };

  const approveSubmission = (id: string) => {
    updateSubmissionStatus(id, 'approved');
  };

  const rejectSubmission = (id: string) => {
    updateSubmissionStatus(id, 'rejected');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Submissions</CardTitle>
          <CardDescription>Loading submissions...</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Submissions</CardTitle>
        <CardDescription>Manage user submissions for new products</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell>{submission.product_name}</TableCell>
                <TableCell>{submission.submitted_by}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      submission.status === 'pending'
                        ? 'secondary'
                        : submission.status === 'approved'
                          ? 'default'
                          : 'destructive'
                    }
                  >
                    {submission.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(submission.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  {submission.status === 'pending' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => approveSubmission(submission.id)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => rejectSubmission(submission.id)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Comment
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
