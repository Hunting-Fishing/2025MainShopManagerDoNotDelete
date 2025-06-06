import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TagSelector } from './tag/TagSelector';

interface FormContentProps {
  isNewCustomer: boolean;
}

export const FormContent: React.FC<FormContentProps> = ({ isNewCustomer }) => {
  const { register } = useFormContext();

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input type="text" id="firstName" {...register("firstName")} />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input type="text" id="lastName" {...register("lastName")} />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input type="email" id="email" {...register("email")} />
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input type="tel" id="phone" {...register("phone")} />
      </div>

      <div>
        <Label htmlFor="company">Company</Label>
        <Input type="text" id="company" {...register("company")} />
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input type="text" id="address" {...register("address")} />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register("notes")} />
      </div>

      <div>
        <Label>Tags</Label>
        <TagSelector name="tags" />
      </div>
    </div>
  );
};
