
import { Role } from "@/types/team";
import { toast } from "@/hooks/use-toast";
import { validateImportedRoles } from "@/utils/roleUtils";

export function useRoleImportExport(roles: Role[], setRoles: React.Dispatch<React.SetStateAction<Role[]>>) {
  const handleImportRoles = (importedRoles: Role[]) => {
    const validation = validateImportedRoles(importedRoles);
    
    if (!validation.valid) {
      toast({
        title: "Import failed",
        description: validation.message || "Invalid role data",
        variant: "destructive",
      });
      return false;
    }

    const defaultRoleIds = roles.filter(role => role.isDefault).map(role => role.id);
    const customImportedRoles = importedRoles.filter(role => !defaultRoleIds.includes(role.id));
    
    const existingRoleNames = new Set(roles.map(role => role.name.toLowerCase()));
    const duplicates = customImportedRoles.filter(role => 
      existingRoleNames.has(role.name.toLowerCase())
    );
    
    if (duplicates.length > 0) {
      const nonDuplicates = customImportedRoles.filter(
        role => !existingRoleNames.has(role.name.toLowerCase())
      );
      
      setRoles([...roles, ...nonDuplicates]);
      
      toast({
        title: "Roles imported with warnings",
        description: `Imported ${nonDuplicates.length} roles. ${duplicates.length} roles were skipped due to name conflicts.`,
        variant: "warning",
      });
    } else {
      setRoles([...roles, ...customImportedRoles]);
      
      toast({
        title: "Roles imported successfully",
        description: `Imported ${customImportedRoles.length} roles`,
        variant: "success",
      });
    }
    
    return true;
  };

  return { handleImportRoles };
}
