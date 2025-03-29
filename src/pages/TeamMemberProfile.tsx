
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TeamMemberForm } from "@/components/team/TeamMemberForm";
import { TeamPermissions } from "@/components/team/TeamPermissions";
import { toast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  Trash, 
  User, 
  Lock, 
  FileText,
  Clock
} from "lucide-react";

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

// Helper to get initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/team")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Team Member Profile</h1>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setActiveTab("edit")}
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
          
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="flex items-center gap-2"
              >
                <Trash className="h-4 w-4" />
                Remove
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This will permanently remove {member.name} from your team. 
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteMember}
                >
                  Delete Member
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Profile content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="md:col-span-1 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="" alt={member.name} />
                <AvatarFallback className="bg-esm-blue-100 text-esm-blue-700 text-xl">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-xl font-semibold">{member.name}</h2>
              <p className="text-sm text-slate-500 mb-2">{member.jobTitle}</p>
              
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-4">
                {member.status}
              </div>
              
              <div className="w-full space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <a href={`mailto:${member.email}`} className="text-esm-blue-600 hover:underline">
                    {member.email}
                  </a>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <a href={`tel:${member.phone}`} className="text-esm-blue-600 hover:underline">
                    {member.phone}
                  </a>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-slate-400" />
                  <span>{member.role}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
            
            <TabsContent value="overview" className="pt-6">
              <div className="space-y-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Team Member Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <dt className="text-sm font-medium text-slate-500">Department</dt>
                        <dd className="mt-1">{member.department}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-slate-500">Role</dt>
                        <dd className="mt-1">{member.role}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-slate-500">Join Date</dt>
                        <dd className="mt-1">{new Date(member.joinDate).toLocaleDateString()}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-slate-500">Last Active</dt>
                        <dd className="mt-1">{new Date(member.lastActive).toLocaleString()}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>

                {member.role === "Technician" && (
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle>Work Order Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col items-center p-4 bg-slate-50 rounded-lg">
                          <span className="text-sm font-medium text-slate-500">Assigned Work Orders</span>
                          <span className="text-3xl font-bold text-esm-blue-600 mt-2">{member.workOrders.assigned}</span>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-slate-50 rounded-lg">
                          <span className="text-sm font-medium text-slate-500">Completed Work Orders</span>
                          <span className="text-3xl font-bold text-esm-blue-600 mt-2">{member.workOrders.completed}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {member.notes && (
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700">{member.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="permissions" className="pt-6">
              <TeamPermissions memberRole={member.role} />
            </TabsContent>
            
            <TabsContent value="activity" className="pt-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Recent actions performed by this team member
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {member.recentActivity && member.recentActivity.map((activity: any, index: number) => (
                      <li key={index} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                        <div className="rounded-full bg-slate-100 p-2">
                          {activity.type === "login" && <User className="h-4 w-4 text-slate-600" />}
                          {activity.type === "workOrder" && <FileText className="h-4 w-4 text-slate-600" />}
                          {activity.type === "invoice" && <FileText className="h-4 w-4 text-slate-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{activity.description}</p>
                          <div className="flex items-center mt-1 text-xs text-slate-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(activity.date).toLocaleString()}
                          </div>
                        </div>
                      </li>
                    ))}
                    
                    {(!member.recentActivity || member.recentActivity.length === 0) && (
                      <li className="text-center py-6 text-slate-500">
                        No recent activity to display
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="edit" className="pt-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Edit Team Member</CardTitle>
                  <CardDescription>
                    Update this team member's information and settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TeamMemberForm 
                    initialData={{
                      name: member.name,
                      email: member.email,
                      phone: member.phone,
                      jobTitle: member.jobTitle,
                      role: member.role,
                      department: member.department,
                      status: member.status === "Active",
                      notes: member.notes,
                    }} 
                    mode="edit" 
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
