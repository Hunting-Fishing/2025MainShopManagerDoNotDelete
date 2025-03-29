import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash, Edit, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Role } from "@/types/team";
import { permissionPresets } from "@/data/permissionPresets";
import { PermissionSet } from "@/types/permissions";
import { TeamPermissions } from "@/components/team/TeamPermissions";
import { v4 as uuidv4 } from "uuid";

// Mock data - in a real app, would come from backend
const initialRoles: Role[] = [
  {
    id: "role-1",
    name: "Owner",
    description: "Full access to all system features and settings",
    isDefault: true,
    permissions: permissionPresets.Owner,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "role-2",
    name: "Administrator",
    description: "Administrative access to most system features",
    isDefault: true,
    permissions: permissionPresets.Administrator,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "role-3",
    name: "Technician",
    description: "Access to work orders and relevant customer information",
    isDefault: true,
    permissions: permissionPresets.Technician,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "role-4",
    name: "Customer Service",
    description: "Access to customer information and basic work order management",
    isDefault: true,
    permissions: permissionPresets["Customer Service"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default function TeamRoles() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<PermissionSet | null>(null);

  // Handle adding a new role
  const handleAddRole = () => {
    if (!newRoleName.trim()) {
      toast({
        title: "Role name required",
        description: "Please provide a name for the new role",
        variant: "destructive",
      });
      return;
    }

    // Check if role with this name already exists
    if (roles.some(role => role.name.toLowerCase() === newRoleName.toLowerCase())) {
      toast({
        title: "Role already exists",
        description: "A role with this name already exists",
        variant: "destructive",
      });
      return;
    }

    const newRole: Role = {
      id: `role-${uuidv4()}`,
      name: newRoleName,
      description: newRoleDescription,
      isDefault: false,
      permissions: rolePermissions || permissionPresets.Technician, // Default to Technician permissions
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setRoles([...roles, newRole]);
    setIsAddDialogOpen(false);
    setNewRoleName("");
    setNewRoleDescription("");
    setRolePermissions(null);

    toast({
      title: "Role created successfully",
      description: `The role "${newRoleName}" has been created`,
      variant: "success",
    });
  };

  // Handle editing a role
  const handleEditRole = () => {
    if (!currentRole) return;

    const updatedRoles = roles.map(role => {
      if (role.id === currentRole.id) {
        return {
          ...currentRole,
          permissions: rolePermissions || currentRole.permissions,
          updatedAt: new Date().toISOString()
        };
      }
      return role;
    });

    setRoles(updatedRoles);
    setIsEditDialogOpen(false);
    setCurrentRole(null);
    setRolePermissions(null);

    toast({
      title: "Role updated successfully",
      description: `The role "${currentRole.name}" has been updated`,
      variant: "success",
    });
  };

  // Handle deleting a role
  const handleDeleteRole = () => {
    if (!currentRole) return;

    // Don't allow deletion of default roles
    if (currentRole.isDefault) {
      toast({
        title: "Cannot delete default role",
        description: "Default roles cannot be deleted",
        variant: "destructive",
      });
      return;
    }

    setRoles(roles.filter(role => role.id !== currentRole.id));
    setIsDeleteDialogOpen(false);
    setCurrentRole(null);

    toast({
      title: "Role deleted successfully",
      description: `The role "${currentRole.name}" has been deleted`,
      variant: "success",
    });
  };

  // Reset form when add dialog is closed
  useEffect(() => {
    if (!isAddDialogOpen) {
      setNewRoleName("");
      setNewRoleDescription("");
      setRolePermissions(null);
    }
  }, [isAddDialogOpen]);

  // Reset current role when edit dialog is closed
  useEffect(() => {
    if (!isEditDialogOpen) {
      setCurrentRole(null);
      setRolePermissions(null);
    }
  }, [isEditDialogOpen]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/team">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Team Roles & Permissions</h1>
          </div>
          <p className="text-muted-foreground">
            Manage role definitions and permission sets for team members
          </p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-esm-blue-600 hover:bg-esm-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Role
        </Button>
      </div>

      {/* Roles list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map(role => (
          <Card key={role.id} className={role.isDefault ? "border-slate-200" : "border-esm-blue-200"}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-esm-blue-500" />
                  <CardTitle>{role.name}</CardTitle>
                </div>
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setCurrentRole(role);
                      setRolePermissions(role.permissions as PermissionSet);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {!role.isDefault && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setCurrentRole(role);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-2">{role.description}</p>
              {role.isDefault ? (
                <div className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded inline-block">
                  Default Role
                </div>
              ) : (
                <div className="text-xs bg-esm-blue-50 text-esm-blue-700 px-2 py-1 rounded inline-block">
                  Custom Role
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add role dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="roleName">Role Name</Label>
                  <Input 
                    id="roleName" 
                    value={newRoleName} 
                    onChange={(e) => setNewRoleName(e.target.value)} 
                    placeholder="e.g., Senior Technician"
                  />
                </div>
                <div>
                  <Label htmlFor="roleDescription">Description</Label>
                  <Textarea 
                    id="roleDescription" 
                    value={newRoleDescription} 
                    onChange={(e) => setNewRoleDescription(e.target.value)} 
                    placeholder="Describe this role's purpose and responsibilities"
                    rows={3}
                  />
                </div>
              </div>
              <div>
                <Label>Set Role Permissions</Label>
                <p className="text-sm text-slate-500 mb-4">
                  Customize what users with this role can access
                </p>
                <TeamPermissions 
                  memberRole="" 
                  onChange={(permissions) => setRolePermissions(permissions)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-esm-blue-600 hover:bg-esm-blue-700"
              onClick={handleAddRole}
            >
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit role dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Role: {currentRole?.name}</DialogTitle>
          </DialogHeader>
          {currentRole && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="editRoleName">Role Name</Label>
                    <Input 
                      id="editRoleName" 
                      value={currentRole.name} 
                      onChange={(e) => setCurrentRole({...currentRole, name: e.target.value})} 
                      disabled={currentRole.isDefault}
                    />
                    {currentRole.isDefault && (
                      <p className="text-xs text-slate-500 mt-1">
                        Default role names cannot be changed
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="editRoleDescription">Description</Label>
                    <Textarea 
                      id="editRoleDescription" 
                      value={currentRole.description} 
                      onChange={(e) => setCurrentRole({...currentRole, description: e.target.value})} 
                      rows={3}
                    />
                  </div>
                </div>
                <div>
                  <Label>Set Role Permissions</Label>
                  <p className="text-sm text-slate-500 mb-4">
                    Customize what users with this role can access
                  </p>
                  <TeamPermissions 
                    memberRole=""
                    initialPermissions={rolePermissions as PermissionSet}
                    onChange={(permissions) => setRolePermissions(permissions)}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-esm-blue-600 hover:bg-esm-blue-700"
              onClick={handleEditRole}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete role confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete the role "{currentRole?.name}"? This action cannot be undone.
            </p>
            <p className="text-sm text-red-500 mt-2">
              Note: Any team members currently assigned this role will need to be reassigned.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteRole}
            >
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
