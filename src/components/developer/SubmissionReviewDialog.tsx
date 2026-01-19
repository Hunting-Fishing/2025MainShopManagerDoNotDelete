import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Check, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface Submission {
  id: string;
  product_name: string;
  product_url: string;
  suggested_category: string;
  notes: string | null;
  status: string;
  submitted_at: string;
  suggested_by: string | null;
  module_id: string;
}

interface SubmissionReviewDialogProps {
  submission: Submission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleSlug: string;
}

export function SubmissionReviewDialog({
  submission,
  open,
  onOpenChange,
  moduleSlug,
}: SubmissionReviewDialogProps) {
  const queryClient = useQueryClient();
  const [productDescription, setProductDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [showDenyReason, setShowDenyReason] = useState(false);
  const [denyReason, setDenyReason] = useState('');
  const [isDenying, setIsDenying] = useState(false);

  const resetForm = () => {
    setProductDescription('');
    setImageUrl('');
    setShowDenyReason(false);
    setDenyReason('');
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleApprove = async () => {
    if (!submission) return;
    
    if (!productDescription.trim()) {
      toast.error('Please enter a product description');
      return;
    }
    
    if (!imageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    setIsApproving(true);
    try {
      // First, we need a category_id - let's check if one exists or create default
      let categoryId: string;
      
      const { data: existingCategories, error: catError } = await supabase
        .from('product_categories')
        .select('id')
        .eq('name', submission.suggested_category || 'General')
        .limit(1);
      
      if (catError) throw catError;
      
      if (existingCategories && existingCategories.length > 0) {
        categoryId = existingCategories[0].id;
      } else {
        // Create a new category
        const { data: newCategory, error: newCatError } = await supabase
          .from('product_categories')
          .insert({
            name: submission.suggested_category || 'General',
            slug: (submission.suggested_category || 'general').toLowerCase().replace(/\s+/g, '-'),
          })
          .select('id')
          .single();
        
        if (newCatError) throw newCatError;
        categoryId = newCategory.id;
      }

      // Create product
      const { error: productError } = await supabase
        .from('products')
        .insert({
          title: submission.product_name,
          name: submission.product_name,
          description: productDescription,
          image_url: imageUrl,
          affiliate_link: submission.product_url,
          module_id: submission.module_id,
          category_id: categoryId,
          product_type: 'affiliate',
          is_approved: true,
          is_available: true,
          suggested_by: submission.suggested_by,
          suggestion_reason: submission.notes,
        });

      if (productError) throw productError;

      // Update submission status
      const { error: updateError } = await supabase
        .from('product_submissions')
        .update({ status: 'approved' })
        .eq('id', submission.id);

      if (updateError) throw updateError;

      toast.success('Product approved and added to store!');
      queryClient.invalidateQueries({ queryKey: ['product-submissions', moduleSlug] });
      handleClose();
    } catch (error: any) {
      console.error('Error approving submission:', error);
      toast.error(`Failed to approve: ${error.message}`);
    } finally {
      setIsApproving(false);
    }
  };

  const handleDeny = async () => {
    if (!submission) return;
    
    if (!denyReason.trim()) {
      toast.error('Please provide a reason for denial');
      return;
    }

    setIsDenying(true);
    try {
      const { error } = await supabase
        .from('product_submissions')
        .update({ 
          status: 'rejected',
          notes: `[REJECTED] ${denyReason}${submission.notes ? `\n\nOriginal notes: ${submission.notes}` : ''}`
        })
        .eq('id', submission.id);

      if (error) throw error;

      toast.success('Submission denied');
      queryClient.invalidateQueries({ queryKey: ['product-submissions', moduleSlug] });
      handleClose();
    } catch (error: any) {
      console.error('Error denying submission:', error);
      toast.error(`Failed to deny: ${error.message}`);
    } finally {
      setIsDenying(false);
    }
  };

  if (!submission) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Review Submission
            <Badge 
              variant={
                submission.status === 'pending' ? 'secondary' :
                submission.status === 'approved' ? 'default' : 'destructive'
              }
            >
              {submission.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Review this product suggestion and approve or deny it
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Submission Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">Product Name</Label>
              <p className="font-medium">{submission.product_name}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">Category</Label>
              <p className="font-medium">{submission.suggested_category || 'Uncategorized'}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Product URL</Label>
            <div className="flex items-center gap-2">
              <a 
                href={submission.product_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1 text-sm break-all"
              >
                {submission.product_url}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              Open this link to copy the product image and write a description
            </p>
          </div>

          {submission.notes && (
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">User Notes</Label>
              <p className="text-sm bg-muted/50 p-3 rounded-md">{submission.notes}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Submitted</Label>
            <p className="text-sm">
              {new Date(submission.submitted_at).toLocaleDateString()} at{' '}
              {new Date(submission.submitted_at).toLocaleTimeString()}
            </p>
          </div>

          {submission.status === 'pending' && (
            <>
              <div className="border-t pt-4 space-y-4">
                <h4 className="font-medium">Product Details (Required for Approval)</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Product Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter a compelling description for this product..."
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Product Image URL *</Label>
                  <Input
                    id="imageUrl"
                    placeholder="https://example.com/product-image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  {imageUrl && (
                    <div className="mt-2">
                      <img 
                        src={imageUrl} 
                        alt="Preview" 
                        className="w-24 h-24 object-cover rounded-md border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {showDenyReason && (
                <div className="space-y-2 border-t pt-4">
                  <Label htmlFor="denyReason">Reason for Denial *</Label>
                  <Textarea
                    id="denyReason"
                    placeholder="Explain why this submission is being denied..."
                    value={denyReason}
                    onChange={(e) => setDenyReason(e.target.value)}
                    rows={2}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          {submission.status === 'pending' ? (
            <>
              {showDenyReason ? (
                <>
                  <Button variant="ghost" onClick={() => setShowDenyReason(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeny}
                    disabled={isDenying}
                  >
                    {isDenying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Denying...
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Confirm Deny
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDenyReason(true)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Deny
                  </Button>
                  <Button 
                    onClick={handleApprove}
                    disabled={isApproving || !productDescription.trim() || !imageUrl.trim()}
                  >
                    {isApproving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Approve & Add to Store
                      </>
                    )}
                  </Button>
                </>
              )}
            </>
          ) : (
            <Button variant="ghost" onClick={handleClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
