import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStaffCertificates } from '@/hooks/useStaffCertificates';

interface AddCertificateDialogProps {
  staffId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCertificateDialog({ staffId, open, onOpenChange }: AddCertificateDialogProps) {
  const { certificateTypes, addCertificate, isAdding } = useStaffCertificates();
  const [formData, setFormData] = useState({
    certificate_type_id: '',
    certificate_number: '',
    issue_date: '',
    expiry_date: '',
    training_date: '',
    issuing_authority: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.certificate_type_id || !formData.issue_date) {
      return;
    }

    addCertificate({
      staff_id: staffId,
      certificate_type_id: formData.certificate_type_id,
      certificate_number: formData.certificate_number || null,
      issue_date: formData.issue_date,
      expiry_date: formData.expiry_date || null,
      training_date: formData.training_date || null,
      issuing_authority: formData.issuing_authority || null,
      status: 'active',
      notes: formData.notes || null,
      document_url: null,
    });

    // Reset form and close
    setFormData({
      certificate_type_id: '',
      certificate_number: '',
      issue_date: '',
      expiry_date: '',
      training_date: '',
      issuing_authority: '',
      notes: '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Certificate</DialogTitle>
          <DialogDescription>
            Add a new certificate or training record for this staff member
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="certificate_type">Certificate Type *</Label>
            <Select
              value={formData.certificate_type_id}
              onValueChange={(value) => setFormData({ ...formData, certificate_type_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select certificate type" />
              </SelectTrigger>
              <SelectContent>
                {certificateTypes?.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="certificate_number">Certificate Number</Label>
              <Input
                id="certificate_number"
                value={formData.certificate_number}
                onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })}
                placeholder="e.g., TC-1234567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issuing_authority">Issuing Authority</Label>
              <Input
                id="issuing_authority"
                value={formData.issuing_authority}
                onChange={(e) => setFormData({ ...formData, issuing_authority: e.target.value })}
                placeholder="e.g., Transport Canada"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="issue_date">Issue Date *</Label>
              <Input
                id="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry_date">Expiry Date</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="training_date">Training Date</Label>
              <Input
                id="training_date"
                type="date"
                value={formData.training_date}
                onChange={(e) => setFormData({ ...formData, training_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isAdding}>
              {isAdding ? 'Adding...' : 'Add Certificate'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
