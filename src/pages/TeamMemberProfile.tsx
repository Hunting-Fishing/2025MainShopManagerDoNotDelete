
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ProfileHeader } from "@/components/team/profile/ProfileHeader";
import { ProfileSidebar } from "@/components/team/profile/ProfileSidebar";
import { TeamMemberDetails } from "@/components/team/profile/TeamMemberDetails";
import { DeleteMemberDialog } from "@/components/team/profile/DeleteMemberDialog";

// Mock data - would come from API in real app
const teamMembers = [
  {
    id: "TM001",
    name: "John Smith",
    role: "Owner",
    email: "john.smith@easyshopmanager.com",
    phone: "555-123-4567",
    jobTitle: "Chief Executive Officer",
    department: "Management",
    status: "Active",
    notes: "Founder and CEO of the company. Has full access to all system features.",
    workOrders: {
      assigned: 0,
      completed: 0,
    },
    recentActivity: [
      { type: "login", date: "2023-12-01T09:15:00", description: "Logged in to the system" },
      { type: "workOrder", date: "2023-12-01T10:30:00", description: "Created work order #WO-2023-1205" },
      { type: "invoice", date: "2023-12-01T14:45:00", description: "Generated invoice #INV-2023-089" }
    ],
    joinDate: "2021-06-15",
    lastActive: "2023-12-01T17:30:00"
  },
  {
    id: "TM002",
    name: "Sarah Johnson",
    role: "Technician",
    email: "sarah.johnson@easyshopmanager.com",
    phone: "555-987-6543",
    jobTitle: "Senior HVAC Technician",
    department: "Field Service",
    status: "Active",
    notes: "Highly skilled HVAC technician with 10+ years of experience. Specializes in commercial systems.",
    workOrders: {
      assigned: 5,
      completed: 24,
    },
    recentActivity: [
      { type: "login", date: "2023-12-01T07:45:00", description: "Logged in to the system" },
      { type: "workOrder", date: "2023-12-01T08:30:00", description: "Updated work order #WO-2023-1198" },
      { type: "workOrder", date: "2023-12-01T15:20:00", description: "Completed work order #WO-2023-1201" }
    ],
    joinDate: "2022-02-10",
    lastActive: "2023-12-01T16:45:00"
  },
];

export default function TeamMemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch member details
    setLoading(true);
    setTimeout(() => {
      const foundMember = teamMembers.find(m => m.id === id);
      if (foundMember) {
        setMember(foundMember);
      }
      setLoading(false);
    }, 500);
  }, [id]);

  // Handle member deletion
  const handleDeleteMember = () => {
    // In a real app, this would call an API
    console.log("Deleting member:", id);
    
    // Show success message
    toast({
      title: "Team member deleted",
      description: `${member.name} has been removed from the team`,
    });
    
    // Close dialog and navigate back to team list
    setDeleteDialogOpen(false);
    navigate("/team");
  };

  const handleEditClick = () => {
    setActiveTab("edit");
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-slate-500">Loading team member details...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <h2 className="text-2xl font-bold">Team Member Not Found</h2>
        <p className="text-slate-500">The team member you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/team">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Team
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <ProfileHeader 
        memberName={member.name}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      {/* Profile content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <ProfileSidebar member={member} />

        {/* Main content */}
        <div className="md:col-span-3 space-y-6">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full justify-start border-b rounded-none p-0 h-auto">
              <TabsTrigger 
                value="overview" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-esm-blue-600 py-2 px-4"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="permissions" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-esm-blue-600 py-2 px-4"
              >
                Permissions
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-esm-blue-600 py-2 px-4"
              >
                Activity
              </TabsTrigger>
              <TabsTrigger 
                value="edit" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-esm-blue-600 py-2 px-4"
              >
                Edit Profile
              </TabsTrigger>
            </TabsList>
            
            <TeamMemberDetails member={member} activeTab={activeTab} />
          </Tabs>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <DeleteMemberDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        memberName={member.name}
        onDelete={handleDeleteMember}
      />
    </div>
  );
}
