
import { SeoHead } from "@/components/common/SeoHead";
import { CreatePageHeader } from "@/components/team/create/CreatePageHeader";
import { TeamMemberForm } from "@/components/team/form/TeamMemberForm";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { TeamMemberFormValues } from "@/components/team/form/formValidation";

export default function TeamMemberCreate() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = (data: TeamMemberFormValues) => {
    setIsSubmitting(true);
    
    // In a real app, this would send data to your backend
    console.log("Submitting team member data:", data);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Team member created successfully");
      navigate("/team");
    }, 1000);
  };
  
  return (
    <div className="space-y-6">
      <SeoHead
        title="Add Team Member | Easy Shop Manager"
        description="Add a new team member to your organization and assign their role and permissions."
        keywords="team management, add team member, role assignment"
      />
      
      <CreatePageHeader />
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <TeamMemberForm 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting} 
            mode="create" 
          />
        </div>
      </div>
    </div>
  );
}
