
import { useState } from 'react';
import { TeamMemberForm } from './form/TeamMemberForm';
import { TeamMemberFormValues } from './form/formValidation';

interface CreateMemberFormProps {
  onSubmit: (data: TeamMemberFormValues) => void;
  isSubmitting: boolean;
}

export function CreateMemberForm({ onSubmit, isSubmitting }: CreateMemberFormProps) {
  return (
    <TeamMemberForm 
      mode="create" 
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
