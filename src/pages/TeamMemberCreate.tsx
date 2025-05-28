
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeamMemberForm } from '@/components/team/TeamMemberForm';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useShopId } from '@/hooks/useShopId';

export default function TeamMemberCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { shopId } = useShopId();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: any) => {
    if (!shopId) {
      toast({
        title: "Error",
        description: "No shop ID available. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate a UUID for the new profile
      const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: 'temporary-password-123', // In production, this should be generated securely
        email_confirm: true,
        user_metadata: {
          first_name: formData.first_name,
          last_name: formData.last_name
        }
      });

      if (authError) throw authError;

      if (!user) {
        throw new Error('Failed to create user');
      }

      // Create profile with the user's ID
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          job_title: formData.job_title,
          department: formData.department,
          shop_id: shopId
        }]);

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "Team member created successfully",
      });

      navigate('/settings/team');
    } catch (error: any) {
      console.error('Error creating team member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create team member",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Add New Team Member</h1>
        
        <div className="bg-white shadow-sm rounded-lg p-6">
          <TeamMemberForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
