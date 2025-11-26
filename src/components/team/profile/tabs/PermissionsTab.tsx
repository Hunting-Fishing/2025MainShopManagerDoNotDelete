import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useToast } from "@/hooks/use-toast";
import { PERMISSION_MODULES, MODULE_CATEGORIES } from "@/types/permissionModules";

interface PermissionsTabProps {
  memberRole: string;
  memberId: string;
}

interface UserPermission {
  module: string;
  actions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
}

export function PermissionsTab({ memberRole, memberId }: PermissionsTabProps) {
  const { userRole } = useUserRole();
  const { userId: currentUserId } = useAuthUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Check if current user can edit permissions
  const canEditPermissions = userRole?.name === 'owner' || userRole?.name === 'admin';
  
  // Fetch member's shop_id
  const { data: memberProfile } = useQuery({
    queryKey: ['member-profile', memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', memberId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!memberId
  });

  // Fetch member's permissions
  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ['user-permissions', memberId, memberProfile?.shop_id],
    queryFn: async () => {
      if (!memberProfile?.shop_id) return [];
      
      const { data, error } = await supabase
        .from('user_permissions')
        .select('module, actions')
        .eq('user_id', memberId)
        .eq('shop_id', memberProfile.shop_id);
      
      if (error) throw error;
      return data as UserPermission[];
    },
    enabled: !!memberId && !!memberProfile?.shop_id
  });

  // Update permission mutation
  const updatePermissionMutation = useMutation({
    mutationFn: async ({ module, action, value }: { module: string; action: string; value: boolean }) => {
      if (!memberProfile?.shop_id || !currentUserId) {
        throw new Error('Missing required data');
      }

      // Find existing permission for this module
      const existingPermission = permissions.find(p => p.module === module);
      const currentActions = existingPermission?.actions || { view: false, create: false, edit: false, delete: false };
      
      // Update the specific action
      const updatedActions = {
        ...currentActions,
        [action]: value
      };

      const { error } = await supabase
        .from('user_permissions')
        .upsert({
          user_id: memberId,
          shop_id: memberProfile.shop_id,
          module,
          actions: updatedActions,
          created_by: currentUserId,
        }, {
          onConflict: 'user_id,shop_id,module'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions', memberId] });
      toast({
        title: "Permission updated",
        description: "User permissions have been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating permission",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update all permissions mutation
  const updateAllPermissionsMutation = useMutation({
    mutationFn: async ({ module, allEnabled }: { module: string; allEnabled: boolean }) => {
      if (!memberProfile?.shop_id || !currentUserId) {
        throw new Error('Missing required data');
      }

      const updatedActions = {
        view: allEnabled,
        create: allEnabled,
        edit: allEnabled,
        delete: allEnabled
      };

      const { error } = await supabase
        .from('user_permissions')
        .upsert({
          user_id: memberId,
          shop_id: memberProfile.shop_id,
          module,
          actions: updatedActions,
          created_by: currentUserId,
        }, {
          onConflict: 'user_id,shop_id,module'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions', memberId] });
      toast({
        title: "Permissions updated",
        description: "All permissions for this module have been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating permissions",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleTogglePermission = (module: string, action: string, value: boolean) => {
    if (!canEditPermissions) return;
    updatePermissionMutation.mutate({ module, action, value });
  };

  const handleToggleAll = (module: string, allEnabled: boolean) => {
    if (!canEditPermissions) return;
    updateAllPermissionsMutation.mutate({ module, allEnabled });
  };

  const getPermissionValue = (moduleId: string, action: string): boolean => {
    const permission = permissions.find(p => p.module === moduleId);
    return permission?.actions[action as keyof typeof permission.actions] || false;
  };

  const areAllPermissionsEnabled = (moduleId: string): boolean => {
    const permission = permissions.find(p => p.module === moduleId);
    if (!permission) return false;
    return permission.actions.view && 
           permission.actions.create && 
           permission.actions.edit && 
           permission.actions.delete;
  };

  const areSomePermissionsEnabled = (moduleId: string): boolean => {
    const permission = permissions.find(p => p.module === moduleId);
    if (!permission) return false;
    const { view, create, edit, delete: del } = permission.actions;
    const enabledCount = [view, create, edit, del].filter(Boolean).length;
    return enabledCount > 0 && enabledCount < 4;
  };

  const PermissionRow = ({ 
    label, 
    moduleId, 
    action 
  }: { 
    label: string; 
    moduleId: string; 
    action: string;
  }) => {
    const isAllowed = getPermissionValue(moduleId, action);
    
    return (
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-foreground">{label}</span>
        <Switch
          checked={isAllowed}
          onCheckedChange={(checked) => handleTogglePermission(moduleId, action, checked)}
          disabled={!canEditPermissions}
        />
      </div>
    );
  };

  const PermissionModuleCard = ({ module }: { module: typeof PERMISSION_MODULES[0] }) => {
    const actions = [
      { key: 'view', label: 'View' },
      { key: 'create', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' }
    ];

    const allEnabled = areAllPermissionsEnabled(module.id);
    const someEnabled = areSomePermissionsEnabled(module.id);

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg">{module.name}</CardTitle>
              <CardDescription className="text-sm">{module.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-medium text-muted-foreground">All</span>
              <Switch
                checked={allEnabled}
                onCheckedChange={(checked) => handleToggleAll(module.id, checked)}
                disabled={!canEditPermissions}
                className={someEnabled && !allEnabled ? 'data-[state=unchecked]:bg-amber-500' : ''}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {actions.map(action => (
              <PermissionRow
                key={`${module.id}-${action.key}`}
                label={action.label}
                moduleId={module.id}
                action={action.key}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>User Permissions</CardTitle>
          </div>
          <CardDescription>
            Manage what this team member can access and modify in the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Role:</span>
            <Badge variant="outline" className="text-base px-3 py-1">
              {memberRole}
            </Badge>
          </div>
          
          {!canEditPermissions && (
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Only Owners and Administrators can modify permissions. You are viewing this user's current permissions.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="space-y-8">
        {MODULE_CATEGORIES.map((category) => {
          const categoryModules = PERMISSION_MODULES.filter(m => m.category === category.id);
          if (categoryModules.length === 0) return null;

          return (
            <div key={category.id} className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{category.label}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryModules.map(module => (
                  <PermissionModuleCard key={module.id} module={module} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Custom permissions override role defaults. These permissions are stored in the database and will persist across sessions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
